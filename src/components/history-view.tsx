'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Eye, History as HistoryIcon, Trash2, RefreshCw, Sparkles } from 'lucide-react'
import Image from 'next/image'
import { useImageViewer } from './image-viewer'
import { supabase } from '@/lib/supabase'

interface HistoryItem {
  id: string
  postId: string
  postTitle: string
  requestText: string
  status: 'completed' | 'failed'
  originalImageUrl: string
  editedImageUrl?: string
  postUrl?: string
  editForm: any
  timestamp: number
  processingTime?: number
}

export function HistoryView() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null)
  const [loading, setLoading] = useState(false)
  const { showImage } = useImageViewer()

  // Load history from localStorage on component mount
  useEffect(() => {
    loadHistory()


  }, [])

  const loadHistory = async () => {
    console.log('📚 Loading history from all sources...')
    setLoading(true)

    try {
      let combinedHistory: HistoryItem[] = []

      // Method 1: Try to load from database
      if (process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project-id.supabase.co') {
        try {
          console.log('1️⃣ Loading from database...')
          const { DatabaseService } = await import('@/lib/database')
          const dbHistory = await DatabaseService.getEditHistory()

          if (dbHistory && dbHistory.length > 0) {
            // Transform database format to component format
            const transformedHistory = dbHistory.map((item: any) => ({
              id: item.id,
              postId: item.post_id,
              postTitle: item.post_title,
              requestText: item.request_text,
              status: item.status,
              originalImageUrl: item.original_image_url,
              editedImageUrl: item.edited_image_url,
              postUrl: item.post_url,
      editForm: {
                task_type: item.edit_form?.task_type || 'other',
                instructions: item.analysis,
                method: item.method
              },
              timestamp: new Date(item.created_at).getTime(),
              processingTime: item.processing_time || 0
            }))

            combinedHistory = [...transformedHistory]
            console.log(`✅ Loaded ${transformedHistory.length} items from database`)
          }
        } catch (dbError) {
          console.warn('⚠️ Database load failed:', dbError)
        }
      }

      // Method 2: Always load from local browser save system
      try {
        console.log('2️⃣ Loading from local browser storage...')
        const { localBrowserSave } = await import('./editor-view')
        const localHistory = await localBrowserSave.loadAllHistory()

        if (localHistory && localHistory.length > 0) {
          // Transform local format to component format
          const transformedLocalHistory: HistoryItem[] = localHistory.map((item: any): HistoryItem => ({
            id: item.id,
            postId: item.postId,
            postTitle: item.postTitle,
            requestText: item.requestText,
            status: item.status as 'completed' | 'failed',
            originalImageUrl: item.originalImageUrl,
            editedImageUrl: item.editedImageUrl || item.editedContent,
            postUrl: item.postUrl,
            editForm: item.editForm || {
              task_type: 'ai_generated',
              instructions: item.analysis || 'AI Generated',
              method: item.method || 'unknown'
            },
            timestamp: item.timestamp,
            processingTime: item.processingTime || 0
          }))

          // Merge with database history, avoiding duplicates by ID
          const existingIds = new Set(combinedHistory.map(item => item.id))
          const uniqueLocalItems = transformedLocalHistory.filter(item => !existingIds.has(item.id))

          combinedHistory = [...combinedHistory, ...uniqueLocalItems]
          console.log(`✅ Loaded ${uniqueLocalItems.length} additional items from local storage`)
        }
      } catch (localError) {
        console.warn('⚠️ Local storage load failed:', localError)
      }

      // Method 3: Legacy localStorage fallback
      try {
        const legacyHistory = localStorage.getItem('editHistory')
        if (legacyHistory) {
          const parsedLegacyHistory = JSON.parse(legacyHistory)

          if (parsedLegacyHistory && parsedLegacyHistory.length > 0) {
            // Avoid duplicates with existing history
            const existingIds = new Set(combinedHistory.map(item => item.id))
            const uniqueLegacyItems = parsedLegacyHistory.filter((item: any) => !existingIds.has(item.id))

            combinedHistory = [...combinedHistory, ...uniqueLegacyItems]
            console.log(`✅ Loaded ${uniqueLegacyItems.length} items from legacy localStorage`)
          }
        }
      } catch (legacyError) {
        console.warn('⚠️ Legacy localStorage load failed:', legacyError)
      }

      // Sort by timestamp (most recent first) and limit to last 100 items
      combinedHistory.sort((a, b) => b.timestamp - a.timestamp)
      const limitedHistory = combinedHistory.slice(0, 100)

      setHistory(limitedHistory)
      console.log(`🎯 History loading complete! Total items: ${limitedHistory.length}`)

    } catch (error) {
      console.error('❌ Critical error loading history:', error)

      // Last resort: Clear corrupted data
      try {
        localStorage.removeItem('editHistory')
        localStorage.removeItem('fixtral_editHistory')
        setHistory([])
        console.log('🧹 Cleared corrupted history data')
      } catch (clearError) {
        console.error('❌ Error clearing corrupted history:', clearError)
      }
    } finally {
      setLoading(false)
    }
  }



  // Delete specific item from history
  const deleteItem = async (itemId: string) => {
    if (confirm('Are you sure you want to delete this item from history?')) {
      try {
        console.log(`🗑️ Deleting item: ${itemId}`)

        // Method 1: Delete from database
        if (process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project-id.supabase.co') {
          try {
            // Use direct Supabase call for delete
            const { error } = await supabase
              .from('edit_history')
              .delete()
              .eq('id', itemId)

            if (error) {
              console.warn('⚠️ Database delete failed:', error)
            } else {
              console.log('✅ Deleted from database')
            }
          } catch (dbError) {
            console.warn('⚠️ Database delete error:', dbError)
          }
        }

        // Method 2: Delete from local browser save system
        try {
          const { localBrowserSave } = await import('./editor-view')
          // We need to delete from both IndexedDB and localStorage
          // Since IndexedDB doesn't have a simple delete by ID without knowing the exact data,
          // we'll reload and filter out the deleted item
          const allData = await localBrowserSave.loadAllHistory()
          const filteredData = allData.filter(item => item.id !== itemId)

          // Clear and resave filtered data
          localBrowserSave.clearAllData()

          // Resave filtered data
          for (const item of filteredData.slice(0, 49)) { // Keep last 50
            await localBrowserSave.saveToLocalStorage(item as any)
            await localBrowserSave.saveToIndexedDB(item as any)
          }

          console.log('✅ Deleted from local browser storage')
        } catch (localError) {
          console.warn('⚠️ Local storage delete failed:', localError)
        }

        // Method 3: Delete from legacy localStorage
        try {
          const legacyData = localStorage.getItem('editHistory')
          if (legacyData) {
            const parsedData = JSON.parse(legacyData)
            const filteredData = parsedData.filter((item: any) => item.id !== itemId)
            localStorage.setItem('editHistory', JSON.stringify(filteredData))
            console.log('✅ Deleted from legacy localStorage')
          }
        } catch (legacyError) {
          console.warn('⚠️ Legacy localStorage delete failed:', legacyError)
        }

        // Update UI state
        const updatedHistory = history.filter(item => item.id !== itemId)
        setHistory(updatedHistory)
        if (selectedItem && selectedItem.id === itemId) {
          setSelectedItem(null)
        }

        console.log('✅ Item deleted successfully')
        alert('Item deleted from history!')

      } catch (error) {
        console.error('❌ Error deleting from history:', error)
        alert('Unable to delete item. Please try again.')
      }
    }
  }

  // Clear all history
  const clearHistory = async () => {
    if (confirm('Are you sure you want to clear all history? This action cannot be undone.')) {
      try {
        console.log('🧹 Clearing all history...')
        const userId = localStorage.getItem('user_id')

        // Method 1: Clear from database if user is authenticated
        if (userId && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project-id.supabase.co') {
          try {
            const { error } = await supabase
              .from('edit_history')
              .delete()
              .eq('user_id', userId)

            if (error) {
              console.warn('⚠️ Database clear failed:', error)
            } else {
              console.log('✅ Cleared from database')
            }
          } catch (dbError) {
            console.warn('⚠️ Database clear error:', dbError)
          }
        }

        // Method 2: Clear from local browser save system
        try {
          const { localBrowserSave } = await import('./editor-view')
          localBrowserSave.clearAllData()
          console.log('✅ Cleared from local browser storage')
        } catch (localError) {
          console.warn('⚠️ Local storage clear failed:', localError)
        }

        // Method 3: Clear legacy localStorage
        try {
          localStorage.removeItem('editHistory')
          localStorage.removeItem('fixtral_editHistory')
          console.log('✅ Cleared legacy localStorage')
        } catch (legacyError) {
          console.warn('⚠️ Legacy localStorage clear failed:', legacyError)
        }

        // Update UI state
        setHistory([])
        setSelectedItem(null)

        console.log('🎯 All history cleared successfully!')
        alert('All history cleared successfully!')

      } catch (error) {
        console.error('❌ Error clearing history:', error)
        alert('Unable to clear history. Please try again.')
      }
    }
  }

  const handleDownload = (imageUrl: string, filename: string) => {
    try {
      // Handle base64 data URLs
      if (imageUrl.startsWith('data:')) {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
      } else {
        // For regular URLs, fetch and download as blob
        fetch(imageUrl)
          .then(response => response.blob())
          .then(blob => {
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = filename
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
          })
          .catch(err => {
            console.error('Download failed:', err)
            alert('Failed to download image. Please try again.')
          })
      }
    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download image. Please try again.')
    }
  }

  const getStatusBadge = (status: string) => {
    if (status === 'completed') {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-[hsl(var(--nano-green))]/20 text-[hsl(var(--nano-green))]">
          Completed
        </span>
      )
    }
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-destructive/20 text-destructive">
        Failed
      </span>
    )
  }

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}m`
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl nano-gradient mb-4">
          <HistoryIcon className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white">
          Edit History
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Your saved AI-generated image edits with before & after comparison
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl nano-glass">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[hsl(var(--nano-purple))]/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-[hsl(var(--nano-purple))]" />
          </div>
          <div>
            <p className="font-semibold text-white">{history.length} Saved Edit{history.length !== 1 ? 's' : ''}</p>
            <p className="text-sm text-muted-foreground">Before & after gallery</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={loadHistory}
            disabled={loading}
            className="text-muted-foreground hover:text-white"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          {history.length > 0 && (
            <Button
              variant="ghost"
              onClick={clearHistory}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* History Gallery */}
      {history.length > 0 ? (
        <div className="grid gap-8">
          {history.map((item, index) => (
            <div 
              key={item.id} 
              className="nano-card overflow-hidden nano-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white truncate">
                        {item.postTitle}
                      </h3>
                      {getStatusBadge(item.status)}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {item.requestText}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(item.timestamp)}
                      {item.processingTime && item.processingTime > 0 && (
                        <span className="ml-2">• Processed in {formatTime(item.processingTime)}</span>
                      )}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteItem(item.id)}
                    className="text-muted-foreground hover:text-destructive ml-4"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Before/After Comparison */}
                <div className="nano-comparison">
                  {/* Before */}
                  <div className="nano-comparison-item">
                    <span className="nano-comparison-label">Before</span>
                    <div 
                      className="nano-image-container aspect-video cursor-pointer"
                      onClick={() => showImage(item.originalImageUrl, 'Original', item.originalImageUrl)}
                    >
                      <Image
                        src={item.originalImageUrl}
                        alt="Original"
                        fill
                        className="object-cover"
                        unoptimized={item.originalImageUrl?.startsWith('data:')}
                      />
                    </div>
                  </div>

                  {/* After */}
                  {item.editedImageUrl && item.status === 'completed' && (
                    <div className="nano-comparison-item">
                      <span className="nano-comparison-label bg-[hsl(var(--nano-green))]/80">After</span>
                      <div 
                        className="nano-image-container aspect-video cursor-pointer"
                        onClick={() => item.editedImageUrl && showImage(item.editedImageUrl, 'AI Edited', item.editedImageUrl)}
                      >
                        <Image
                          src={item.editedImageUrl}
                          alt="AI Edited"
                          fill
                          className="object-cover"
                          unoptimized={item.editedImageUrl?.startsWith('data:')}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-end gap-2 mt-6 pt-6 border-t border-border/30">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => showImage(item.originalImageUrl, 'Original', item.originalImageUrl)}
                    className="text-muted-foreground hover:text-white"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Original
                  </Button>
                  
                  {item.editedImageUrl && item.status === 'completed' && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => item.editedImageUrl && showImage(item.editedImageUrl, 'AI Edited', item.editedImageUrl)}
                        className="text-muted-foreground hover:text-white"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Edited
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => item.editedImageUrl && handleDownload(item.editedImageUrl, `nano-edit-${item.id}.png`)}
                        className="text-[hsl(var(--nano-blue))] hover:text-[hsl(var(--nano-blue))]"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </>
                  )}

                  {item.postUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(item.postUrl, '_blank')}
                      className="text-muted-foreground hover:text-white"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Source
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="nano-card p-12 text-center">
          <div className="w-20 h-20 rounded-2xl bg-secondary/50 flex items-center justify-center mx-auto mb-6">
            <HistoryIcon className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Saved Images Yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Complete the workflow in the Upload and Editor tabs to save your AI-generated images here
          </p>
        </div>
      )}

      {/* Selected Item Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="nano-card max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[hsl(var(--nano-green))]/10 flex items-center justify-center">
                    <Eye className="w-5 h-5 text-[hsl(var(--nano-green))]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Image Details</h3>
                    <p className="text-sm text-muted-foreground">View and download</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedItem(null)}
                  className="text-muted-foreground hover:text-white"
                >
                  Close
                </Button>
              </div>

              {/* Content */}
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">{selectedItem.postTitle}</h4>
                  <p className="text-sm text-muted-foreground">{selectedItem.requestText}</p>
                </div>

                <div className="nano-comparison">
                  {/* Original */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Original</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(selectedItem.originalImageUrl, 'original.jpg')}
                        className="text-muted-foreground hover:text-white"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                    <div
                      className="nano-image-container aspect-video cursor-pointer"
                      onClick={() => showImage(selectedItem.originalImageUrl, 'Original', selectedItem.originalImageUrl)}
                    >
                      <Image
                        src={selectedItem.originalImageUrl}
                        alt="Original"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>

                  {/* Edited */}
                  {selectedItem.editedImageUrl && selectedItem.status === 'completed' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[hsl(var(--nano-green))]">✨ AI Enhanced</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => selectedItem.editedImageUrl && handleDownload(selectedItem.editedImageUrl, 'ai-edited.jpg')}
                          className="text-muted-foreground hover:text-white"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </div>
                      <div
                        className="nano-image-container aspect-video cursor-pointer"
                        onClick={() => selectedItem.editedImageUrl && showImage(selectedItem.editedImageUrl, 'AI Edited', selectedItem.editedImageUrl)}
                      >
                        <Image
                          src={selectedItem.editedImageUrl}
                          alt="AI Edited"
                          fill
                          className="object-cover"
                          unoptimized={selectedItem.editedImageUrl?.startsWith('data:')}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Metadata */}
                <div className="p-4 rounded-xl bg-secondary/30 border border-border/30">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Status</p>
                      {getStatusBadge(selectedItem.status)}
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Processed</p>
                      <p className="font-medium text-white">{formatDate(selectedItem.timestamp)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Method</p>
                      <p className="font-medium text-white">{selectedItem.editForm?.method || 'Google Gemini'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Duration</p>
                      <p className="font-medium text-white">
                        {selectedItem.processingTime ? formatTime(selectedItem.processingTime) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
