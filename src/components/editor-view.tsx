'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Download, Wand2, Loader2, Save, Eye, EyeOff, CheckCircle, Sparkles, ArrowLeftRight } from 'lucide-react'
import Image from 'next/image'
import { useImageViewer } from './image-viewer'

// Local Browser Save Utility
class LocalBrowserSave {
  private dbName = 'FixtralHistory'
  private storeName = 'editHistory'
  private db: IDBDatabase | null = null

  async initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1)

      request.onerror = () => {
        console.error('IndexedDB error:', request.error)
        reject(request.error)
      }

      request.onsuccess = () => {
        this.db = request.result
        console.log('IndexedDB initialized successfully')
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' })
          store.createIndex('timestamp', 'timestamp', { unique: false })
          console.log('IndexedDB object store created')
        }
      }
    })
  }

  async saveToIndexedDB(data: any): Promise<boolean> {
    try {
      if (!this.db) {
        await this.initDB()
      }

      if (!this.db) {
        throw new Error('Failed to initialize IndexedDB')
      }

      return new Promise((resolve) => {
        const transaction = this.db!.transaction([this.storeName], 'readwrite')
        const store = transaction.objectStore(this.storeName)
        const request = store.put(data)

        request.onsuccess = () => {
          console.log('Successfully saved to IndexedDB')
          resolve(true)
        }

        request.onerror = () => {
          console.error('Failed to save to IndexedDB:', request.error)
          resolve(false)
        }
      })
    } catch (error) {
      console.error('IndexedDB save error:', error)
      return false
    }
  }

  async loadFromIndexedDB(): Promise<any[]> {
    try {
      if (!this.db) {
        await this.initDB()
      }

      if (!this.db) {
        throw new Error('Failed to initialize IndexedDB')
      }

      return new Promise((resolve) => {
        const transaction = this.db!.transaction([this.storeName], 'readonly')
        const store = transaction.objectStore(this.storeName)
        const index = store.index('timestamp')
        const request = index.openCursor(null, 'prev') // Most recent first

        const results: any[] = []

        request.onsuccess = () => {
          const cursor = request.result
          if (cursor) {
            results.push(cursor.value)
            cursor.continue()
          } else {
            console.log('Loaded', results.length, 'items from IndexedDB')
            resolve(results)
          }
        }

        request.onerror = () => {
          console.error('Failed to load from IndexedDB:', request.error)
          resolve([])
        }
      })
    } catch (error) {
      console.error('IndexedDB load error:', error)
      return []
    }
  }

  async saveToLocalStorage(data: any): Promise<boolean> {
    try {
      const key = 'fixtral_editHistory'
      const existingData = this.loadFromLocalStorage()
      const updatedData = [data, ...existingData.slice(0, 49)] // Keep last 50 items

      localStorage.setItem(key, JSON.stringify(updatedData))
      console.log('Successfully saved to localStorage')
      return true
    } catch (error) {
      console.error('localStorage save error:', error)
      return false
    }
  }

  loadFromLocalStorage(): any[] {
    try {
      const key = 'fixtral_editHistory'
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('localStorage load error:', error)
      return []
    }
  }

  async saveWithFallback(data: any): Promise<{success: boolean, method: string, downloadUrl?: string}> {
    console.log('Starting comprehensive save process...')

    // Method 1: Try IndexedDB
    try {
      const indexedDBSuccess = await this.saveToIndexedDB(data)
      if (indexedDBSuccess) {
        return { success: true, method: 'IndexedDB' }
      }
    } catch (error) {
      console.warn('IndexedDB failed, trying localStorage...', error)
    }

    // Method 2: Try localStorage
    try {
      const localStorageSuccess = await this.saveToLocalStorage(data)
      if (localStorageSuccess) {
        return { success: true, method: 'localStorage' }
      }
    } catch (error) {
      console.warn('localStorage failed, creating download link...', error)
    }

    // Method 3: Create manual download link
    try {
      const downloadUrl = await this.createDownloadLink(data)
      if (downloadUrl) {
        return { success: true, method: 'download', downloadUrl }
      }
    } catch (error) {
      console.error('All save methods failed:', error)
    }

    return { success: false, method: 'failed' }
  }

  async createDownloadLink(data: any): Promise<string | null> {
    try {
      const imageUrl = data.editedImageUrl || data.editedContent
      if (!imageUrl) {
        throw new Error('No image URL found')
      }

      // Create a download link for the image
      const link = document.createElement('a')
      link.href = imageUrl
      link.download = `fixtral_edit_${Date.now()}.png`
      link.style.display = 'none'
      document.body.appendChild(link)

      console.log('Created manual download link for image')
      return imageUrl
    } catch (error) {
      console.error('Failed to create download link:', error)
      return null
    }
  }

  async loadAllHistory(): Promise<any[]> {
    console.log('Loading history from all sources...')

    // Try IndexedDB first
    try {
      const indexedDBData = await this.loadFromIndexedDB()
      if (indexedDBData.length > 0) {
        console.log('Loaded from IndexedDB:', indexedDBData.length, 'items')
        return indexedDBData
      }
    } catch (error) {
      console.warn('IndexedDB load failed:', error)
    }

    // Fallback to localStorage
    try {
      const localStorageData = this.loadFromLocalStorage()
      if (localStorageData.length > 0) {
        console.log('Loaded from localStorage:', localStorageData.length, 'items')
        return localStorageData
      }
    } catch (error) {
      console.warn('localStorage load failed:', error)
    }

    console.log('No history data found')
    return []
  }

  clearAllData(): void {
    try {
      // Clear IndexedDB
      if (this.db) {
        const transaction = this.db.transaction([this.storeName], 'readwrite')
        const store = transaction.objectStore(this.storeName)
        store.clear()
      }

      // Clear localStorage
      localStorage.removeItem('fixtral_editHistory')
      localStorage.removeItem('editHistory')

      console.log('All local data cleared')
    } catch (error) {
      console.error('Failed to clear data:', error)
    }
  }
}

// Global instance
const localBrowserSave = new LocalBrowserSave()

// Export for use in other components
export { localBrowserSave }

interface RedditPost {
  id: string
  title: string
  description: string
  imageUrl: string
  postUrl: string
  created_utc: number
  created_date: string
  author: string
  score: number
  num_comments: number
  subreddit: string
}

interface EditorItem {
  id: string
  post: RedditPost
  analysis: string
  timestamp: string
}

interface EditResult {
  ok: boolean
  postId: string
  analysis: string
  editedContent: string
  method?: string
  hasImageData?: boolean
  generatedImages?: string[]
  timestamp: string
}

export function EditorView() {
  const [currentItem, setCurrentItem] = useState<EditorItem | null>(null)
  const [editPrompt, setEditPrompt] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editResult, setEditResult] = useState<EditResult | null>(null)
  const [comparisonMode, setComparisonMode] = useState<'side-by-side' | 'overlay'>('side-by-side')
  const [showOriginal, setShowOriginal] = useState(true)
  const [savedItems, setSavedItems] = useState<EditResult[]>([])
  const { showImage } = useImageViewer()

  // Load pending item from localStorage when component mounts
  useEffect(() => {
    const loadPendingItem = () => {
      console.log('EditorView: Loading pending item...')
      const pendingItemStr = localStorage.getItem('pendingEditorItem')
      console.log('EditorView: Pending item from localStorage:', pendingItemStr)

      if (pendingItemStr) {
        try {
          const pendingItem = JSON.parse(pendingItemStr)
          console.log('EditorView: Parsed pending item:', pendingItem)

          setCurrentItem(pendingItem)
          setEditPrompt(pendingItem.analysis)

          console.log('EditorView: Set current item and edit prompt')

          // Clear the pending item from localStorage
          localStorage.removeItem('pendingEditorItem')
          console.log('EditorView: Cleared pending item from localStorage')
        } catch (error) {
          console.error('EditorView: Error loading pending item:', error)
        }
      } else {
        console.log('EditorView: No pending item found in localStorage')
      }
    }

    loadPendingItem()

    // Also listen for storage changes in case item is set from another tab
    const handleStorageChange = (e: StorageEvent) => {
      console.log('EditorView: Storage event received:', {
        key: e.key,
        newValue: e.newValue,
        oldValue: e.oldValue
      })

      if (e.key === 'pendingEditorItem' && e.newValue) {
        console.log('EditorView: Pending item storage event detected, loading...')
        loadPendingItem()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Generate edited image
  const generateEditedImage = async () => {
    if (!currentItem || !editPrompt.trim()) return

    setIsEditing(true)

    try {
      const response = await fetch('/api/edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: currentItem.post.imageUrl,
          changeSummary: editPrompt
        }),
      })

      const result = await response.json()
      console.log('Edit API response:', result)

      if (result.ok) {
        console.log('Edit successful, preparing result data...')

        // Validate result data
        const editedContent = result.edited || result.generatedImages?.[0] || ''
        const hasValidImage = editedContent && (editedContent.startsWith('data:') || editedContent.startsWith('http'))

        if (!hasValidImage) {
          console.warn('No valid image data in result:', { editedContent: editedContent?.substring(0, 50) })
        }

        const editResult: EditResult = {
          ok: true,
          postId: currentItem.post.id,
          analysis: editPrompt,
          editedContent: editedContent,
          method: result.method || 'unknown',
          hasImageData: result.hasImageData || false,
          generatedImages: result.generatedImages || [],
          timestamp: result.timestamp || Date.now()
        }

        console.log('Edit result prepared:', {
          postId: editResult.postId,
          hasEditedContent: !!editResult.editedContent,
          method: editResult.method,
          hasImageData: editResult.hasImageData
        })

        setEditResult(editResult)
      } else {
        console.error('Edit failed:', result.error)
      }
    } catch (error) {
      console.error('Error generating edited image:', error)
    }
    setIsEditing(false)
  }

  // Save to history with comprehensive fallback system
  const saveToHistory = async (result: EditResult) => {
    console.log('🚀 Starting comprehensive save to history process...')

    // Double-check that we have valid result data
    if (!result || !result.postId) {
      console.error('❌ Invalid result data for saving:', result)
      alert('Invalid image data. Please try generating the image again.')
      return
    }

    // Create comprehensive data object for all save methods
    const historyItem = {
      id: `history_${Date.now()}`,
      postId: result.postId,
      postTitle: currentItem?.post?.title || 'Generated Image',
      requestText: currentItem?.post?.description || result.analysis || 'AI Generated',
      analysis: result.analysis,
      editPrompt: editPrompt, // Current edited prompt
      originalImageUrl: currentItem?.post?.imageUrl || '',
      editedImageUrl: result.generatedImages?.[0] || result.editedContent || '',
      editedContent: result.editedContent,
      generatedImages: result.generatedImages || [],
      postUrl: currentItem?.post?.postUrl || '',
      method: result.method || 'google_gemini',
      status: 'completed' as const,
      timestamp: Date.now(),
      processingTime: typeof result.timestamp === 'number' ? Date.now() - result.timestamp : 0,
      savedAt: new Date().toISOString(),
      hasImageData: result.hasImageData || false
    }

    console.log('📦 History item created:', historyItem)

    let saveSuccess = false
    let saveMethod = 'failed'
    let downloadUrl: string | undefined

    try {
      // Method 1: Try database save first
      console.log('1️⃣ Attempting database save...')
      const { DatabaseService } = await import('@/lib/database')

      const dbHistoryItem = {
        original_image_url: historyItem.originalImageUrl,
        edited_image_url: historyItem.editedImageUrl,
        prompt: editPrompt,
        analysis: result.analysis || null,
        source_type: historyItem.postUrl ? 'reddit' as const : 'upload' as const,
        source_title: historyItem.postTitle || null,
        source_url: historyItem.postUrl || null,
        model: result.method || 'gemini',
        status: 'completed' as const,
        processing_time_ms: historyItem.processingTime
      }

      const dbResult = await DatabaseService.saveEditHistory(dbHistoryItem)
      console.log('✅ Database save result:', dbResult)

      if (dbResult) {
        saveSuccess = true
        saveMethod = 'database'
      }

      // Method 2: Always try comprehensive local browser save
      console.log('2️⃣ Attempting local browser save...')
      const localSaveResult = await localBrowserSave.saveWithFallback(historyItem)

      if (localSaveResult.success) {
        if (!saveSuccess) {
          saveSuccess = true
          saveMethod = localSaveResult.method
        }
        downloadUrl = localSaveResult.downloadUrl
        console.log(`✅ Local browser save successful via ${localSaveResult.method}`)
      } else {
        console.warn('⚠️ Local browser save failed, but continuing...')
      }

      // Update UI state if we have any successful save
      if (saveSuccess) {
        try {
          setSavedItems(prev => [result, ...prev])
          setCurrentItem(null)
          setEditResult(null)
          setEditPrompt('')

          // Clear the pending item from localStorage to remove notification
          localStorage.removeItem('pendingEditorItem')

          // Dispatch storage event to notify other tabs/windows
          window.dispatchEvent(new StorageEvent('storage', {
            key: 'pendingEditorItem',
            newValue: null,
            oldValue: null,
            storageArea: localStorage
          }))

          console.log('✅ UI state updated successfully and pending item cleared')
        } catch (uiError) {
          console.warn('⚠️ UI state update failed, but data saved:', uiError)
        }

        // Show appropriate success message
        if (saveMethod === 'download') {
          alert('✅ Image generated! Download link created - check your downloads folder.')
        } else {
          alert(`✅ Image saved via ${saveMethod}! You can view it in the History tab.`)
        }
      }

    } catch (error: any) {
      console.error('❌ Critical error in save process:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })

      // Last resort: Try manual download
      try {
        const imageUrl = result.generatedImages?.[0] || result.editedContent
        if (imageUrl && (imageUrl.startsWith('data:') || imageUrl.startsWith('http'))) {
          console.log('🔄 Creating manual download as last resort...')
          const link = document.createElement('a')
          link.href = imageUrl
          link.download = `fixtral_edit_${Date.now()}.png`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)

          alert('✅ Manual download initiated! The image generation was successful.')
          return
        }
      } catch (downloadError) {
        console.error('❌ Even manual download failed:', downloadError)
      }

      alert('❌ Unable to save. Image generation was successful, but all save methods failed.')
    }

    console.log(`🎯 Save process completed. Success: ${saveSuccess}, Method: ${saveMethod}`)
  }

  const handleDownload = (imageUrl: string, filename: string) => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl nano-gradient mb-4">
          <Wand2 className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white">
          AI Image Editor
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Edit prompts and generate AI-enhanced images using Google Gemini
        </p>
      </div>

      {/* Current Item Display */}
      {currentItem ? (
        <div className="space-y-6">
          {/* Source Info Card */}
          <div className="nano-card p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[hsl(var(--nano-green))]/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6 text-[hsl(var(--nano-green))]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-white truncate">{currentItem.post.title}</h3>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-[hsl(var(--nano-blue))]/20 text-[hsl(var(--nano-blue))]">
                    Step 2: Edit
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {currentItem.post.description}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>By {currentItem.post.author}</span>
                  <span>{new Date(currentItem.post.created_utc * 1000).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Original Image Preview */}
            <div
              className="mt-6 nano-image-container aspect-video cursor-pointer"
              onClick={() => showImage(
                currentItem.post.imageUrl,
                'Original Image',
                currentItem.post.imageUrl,
                currentItem.post.postUrl
              )}
            >
              <Image
                src={currentItem.post.imageUrl}
                alt="Original image"
                fill
                className="object-cover"
              />
              <span className="nano-comparison-label">Original</span>
            </div>
          </div>

          {/* Edit Prompt Card */}
          <div className="nano-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[hsl(var(--nano-purple))]/10 flex items-center justify-center">
                <Wand2 className="w-5 h-5 text-[hsl(var(--nano-purple))]" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Edit Prompt</h3>
                <p className="text-sm text-muted-foreground">Modify the prompt to customize your edit</p>
              </div>
            </div>
            
            <Textarea
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
              className="min-h-[120px] bg-secondary/50 border-border/50 focus:border-[hsl(var(--nano-purple))] resize-none text-base mb-4"
              placeholder="Enter your edit instructions..."
            />

            <Button
              onClick={generateEditedImage}
              disabled={isEditing || !editPrompt.trim()}
              className="w-full h-14 text-base font-semibold nano-button"
            >
              {isEditing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                  Generating AI Image...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-3" />
                  Generate Edited Image
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="nano-card p-12 text-center">
          <div className="w-20 h-20 rounded-2xl bg-secondary/50 flex items-center justify-center mx-auto mb-6">
            <Wand2 className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Items to Edit</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Go to the Upload tab to add an image and send it here for editing.
          </p>
        </div>
      )}

      {/* Edit Result Display */}
      {editResult && (
        <div className="nano-card p-6 nano-slide-up border-[hsl(var(--nano-green))]/30">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[hsl(var(--nano-green))]/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-[hsl(var(--nano-green))]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">AI Image Generated!</h3>
                <p className="text-sm text-muted-foreground">Your edited image is ready</p>
              </div>
            </div>
            <Button
              onClick={() => saveToHistory(editResult)}
              className="h-12 px-6 font-semibold bg-[hsl(var(--nano-green))] hover:bg-[hsl(var(--nano-green))]/90 text-black"
            >
              <Save className="w-5 h-5 mr-2" />
              Save to History
            </Button>
          </div>

          {/* Comparison Mode Toggle */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex p-1 rounded-xl bg-secondary/50 border border-border/30">
              <button
                onClick={() => setComparisonMode('side-by-side')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  comparisonMode === 'side-by-side'
                    ? 'bg-[hsl(var(--nano-blue))] text-white'
                    : 'text-muted-foreground hover:text-white'
                }`}
              >
                <ArrowLeftRight className="w-4 h-4 inline mr-2" />
                Side by Side
              </button>
              <button
                onClick={() => setComparisonMode('overlay')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  comparisonMode === 'overlay'
                    ? 'bg-[hsl(var(--nano-blue))] text-white'
                    : 'text-muted-foreground hover:text-white'
                }`}
              >
                <Eye className="w-4 h-4 inline mr-2" />
                Overlay
              </button>
            </div>
          </div>

          {comparisonMode === 'side-by-side' ? (
            <div className="nano-comparison">
              {/* Original */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Original</span>
                  {currentItem && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(currentItem.post.imageUrl, 'original.jpg')}
                      className="text-muted-foreground hover:text-white"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  )}
                </div>
                <div
                  className="nano-image-container aspect-video cursor-pointer"
                  onClick={() => currentItem && showImage(
                    currentItem.post.imageUrl,
                    'Original Image',
                    currentItem.post.imageUrl,
                    currentItem.post.postUrl
                  )}
                >
                  {currentItem && (
                    <Image
                      src={currentItem.post.imageUrl}
                      alt="Original"
                      fill
                      className="object-cover"
                      unoptimized={currentItem.post.imageUrl?.startsWith('data:')}
                    />
                  )}
                </div>
              </div>

              {/* Edited */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[hsl(var(--nano-green))]">✨ AI Enhanced</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(
                      editResult.generatedImages?.[0] || editResult.editedContent,
                      'ai-edited.jpg'
                    )}
                    className="text-muted-foreground hover:text-white"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                </div>

                {editResult.generatedImages && editResult.generatedImages.length > 0 ? (
                  <div className="space-y-4">
                    {editResult.generatedImages.map((imageUrl, index) => (
                      <div
                        key={index}
                        className="nano-image-container aspect-video cursor-pointer nano-pulse-glow"
                        onClick={() => showImage(imageUrl, `AI Edited Image ${index + 1}`, imageUrl)}
                      >
                        <Image
                          src={imageUrl}
                          alt={`AI edited ${index + 1}`}
                          fill
                          className="object-cover"
                          unoptimized={imageUrl?.startsWith('data:')}
                        />
                      </div>
                    ))}
                  </div>
                ) : editResult.editedContent.includes('data:image') ? (
                  <div
                    className="nano-image-container aspect-video cursor-pointer nano-pulse-glow"
                    onClick={() => showImage(
                      editResult.editedContent.match(/data:image[^"']+/)?.[0] || '',
                      'AI Edited Image',
                      editResult.editedContent.match(/data:image[^"']+/)?.[0] || ''
                    )}
                  >
                    <Image
                      src={editResult.editedContent.match(/data:image[^"']+/)?.[0] || ''}
                      alt="AI edited"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">
                      Image generated successfully! Check the download link above.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Overlay Mode */
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowOriginal(!showOriginal)}
                  className="text-muted-foreground hover:text-white"
                >
                  {showOriginal ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                  {showOriginal ? 'Showing Original' : 'Showing Edited'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(
                    showOriginal
                      ? (currentItem?.post.imageUrl || '')
                      : (editResult.generatedImages?.[0] || editResult.editedContent),
                    showOriginal ? 'original.jpg' : 'ai-edited.jpg'
                  )}
                  className="text-muted-foreground hover:text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Current
                </Button>
              </div>

              <div
                className="nano-image-container aspect-video cursor-pointer"
                onClick={() => {
                  const imageSrc = showOriginal
                    ? (currentItem?.post.imageUrl || '')
                    : (editResult.generatedImages?.[0] || editResult.editedContent)
                  const imageAlt = showOriginal ? 'Original Image' : 'AI Edited Image'
                  const downloadUrl = showOriginal
                    ? (currentItem?.post.imageUrl || '')
                    : (editResult.generatedImages?.[0] || editResult.editedContent)
                  const externalUrl = showOriginal ? currentItem?.post.postUrl : undefined

                  showImage(imageSrc, imageAlt, downloadUrl, externalUrl)
                }}
              >
                <Image
                  src={showOriginal
                    ? (currentItem?.post.imageUrl || '')
                    : (editResult.generatedImages?.[0] || editResult.editedContent)
                  }
                  alt="Comparison"
                  fill
                  className="object-cover"
                />
                <span className={`nano-comparison-label ${showOriginal ? '' : 'bg-[hsl(var(--nano-green))]/80'}`}>
                  {showOriginal ? 'Original' : 'AI Enhanced'}
                </span>
              </div>
            </div>
          )}

          {/* Edit Details */}
          <div className="mt-6 p-4 rounded-xl bg-secondary/30 border border-border/30">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Method</p>
                <p className="font-medium text-white">
                  {editResult.method === 'google_gemini' ? 'Google Gemini' :
                   editResult.method === 'base64' ? 'Base64 Upload' : 'Direct URL'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Generated</p>
                <p className="font-medium text-white">{new Date(editResult.timestamp).toLocaleString()}</p>
              </div>
              {editResult.generatedImages && (
                <div>
                  <p className="text-muted-foreground mb-1">Images</p>
                  <p className="font-medium text-white">{editResult.generatedImages.length}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
