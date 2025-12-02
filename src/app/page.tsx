'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Upload, Wand2, X, Loader2, Download, Eye, Trash2, History, ChevronDown, Github } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { ImageViewerProvider, useImageViewer } from '@/components/image-viewer'

// Import the localBrowserSave from editor-view for history management
import { localBrowserSave } from '@/components/editor-view'

interface UploadedImage {
  id: string
  file: File
  preview: string
  name: string
  size: number
}

interface HistoryItem {
  id: string
  postId: string
  postTitle: string
  requestText: string
  status: 'completed' | 'failed'
  originalImageUrl: string
  editedImageUrl?: string
  timestamp: number
  processingTime?: number
}

function NanoApp() {
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null)
  const [prompt, setPrompt] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [editResult, setEditResult] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const historyRef = useRef<HTMLDivElement>(null)
  const { showImage } = useImageViewer()

  useEffect(() => {
    setIsVisible(true)
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      const localHistory = await localBrowserSave.loadAllHistory()
      if (localHistory && localHistory.length > 0) {
        const transformedHistory: HistoryItem[] = localHistory.map((item: any): HistoryItem => ({
          id: item.id,
          postId: item.postId,
          postTitle: item.postTitle,
          requestText: item.requestText,
          status: item.status as 'completed' | 'failed',
          originalImageUrl: item.originalImageUrl,
          editedImageUrl: item.editedImageUrl || item.editedContent,
          timestamp: item.timestamp,
          processingTime: item.processingTime || 0
        }))
        transformedHistory.sort((a, b) => b.timestamp - a.timestamp)
        setHistory(transformedHistory.slice(0, 20))
      }
    } catch (error) {
      console.error('Error loading history:', error)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WEBP)')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Image size must be less than 10MB')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setUploadedImage({
        id: `img_${Date.now()}`,
        file,
        preview: reader.result as string,
        name: file.name,
        size: file.size
      })
      setEditResult(null)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WEBP)')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setUploadedImage({
        id: `img_${Date.now()}`,
        file,
        preview: reader.result as string,
        name: file.name,
        size: file.size
      })
      setEditResult(null)
    }
    reader.readAsDataURL(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const removeImage = () => {
    setUploadedImage(null)
    setEditResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const generateEdit = async () => {
    if (!uploadedImage || !prompt.trim()) {
      alert('Please upload an image and enter a prompt')
      return
    }

    setIsProcessing(true)

    try {
      const response = await fetch('/api/edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: uploadedImage.preview,
          changeSummary: prompt
        }),
      })

      const result = await response.json()

      if (result.ok) {
        const editedContent = result.edited || result.generatedImages?.[0] || ''
        setEditResult(editedContent)

        // Save to history
        const historyItem = {
          id: `history_${Date.now()}`,
          postId: uploadedImage.id,
          postTitle: uploadedImage.name,
          requestText: prompt,
          analysis: prompt,
          editPrompt: prompt,
          originalImageUrl: uploadedImage.preview,
          editedImageUrl: editedContent,
          editedContent: editedContent,
          generatedImages: result.generatedImages || [],
          method: result.method || 'google_gemini',
          status: 'completed' as const,
          timestamp: Date.now(),
          processingTime: 0,
          savedAt: new Date().toISOString(),
          hasImageData: result.hasImageData || false
        }

        await localBrowserSave.saveWithFallback(historyItem)
        loadHistory()
      } else {
        alert('Failed to generate edit: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('Error generating edit:', error)
      alert('Failed to generate edit. Please try again.')
    }

    setIsProcessing(false)
  }

  const handleDownload = (imageUrl: string, filename: string) => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const deleteHistoryItem = async (itemId: string) => {
    if (confirm('Delete this item from history?')) {
      try {
        const allData = await localBrowserSave.loadAllHistory()
        const filteredData = allData.filter(item => item.id !== itemId)
        localBrowserSave.clearAllData()
        for (const item of filteredData.slice(0, 49)) {
          await localBrowserSave.saveToLocalStorage(item as any)
        }
        setHistory(prev => prev.filter(item => item.id !== itemId))
      } catch (error) {
        console.error('Error deleting item:', error)
      }
    }
  }

  const scrollToHistory = () => {
    historyRef.current?.scrollIntoView({ behavior: 'smooth' })
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
    <div className="min-h-screen bg-background">
      {/* Hero Section with Editor */}
      <section className="relative min-h-screen flex flex-col">
        {/* Ambient Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[hsl(var(--nano-blue))] rounded-full blur-[150px] opacity-20" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[hsl(var(--nano-purple))] rounded-full blur-[150px] opacity-20" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[hsl(var(--nano-red))] rounded-full blur-[200px] opacity-10" />
        </div>

        {/* Header */}
        <header className="relative z-10 nano-glass border-b border-white/5">
          <div className="nano-container py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Image
                  src="/logo-icon.png"
                  alt="Nano Logo"
                  width={40}
                  height={40}
                  className="rounded-xl"
                />
                <span className="text-2xl font-bold text-white">Nano</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground hidden sm:inline">AI Image Editor</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Editor Area */}
        <main className="relative z-10 flex-1 nano-container py-12 lg:py-20">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Title Section */}
            <div className="text-center mb-12 lg:mb-16">
              <h1 className="nano-title text-white mb-6">
                <span className="nano-gradient-text">Transform</span> Your Images
                <br />
                <span className="text-muted-foreground">with AI</span>
              </h1>
              <p className="nano-subtitle max-w-2xl mx-auto">
                Upload any image and describe the changes you want. 
                Powered by Google Gemini AI for stunning results.
              </p>
            </div>

            {/* Editor Interface */}
            <div className="max-w-4xl mx-auto">
              <div className="nano-card p-6 lg:p-8">
                {/* Upload Area */}
                {!uploadedImage ? (
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => fileInputRef.current?.click()}
                    className="relative border-2 border-dashed border-border/50 rounded-2xl p-12 lg:p-16 text-center cursor-pointer transition-all duration-300 hover:border-[hsl(var(--nano-blue))] hover:bg-[hsl(var(--nano-blue))]/5 group"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 rounded-2xl bg-[hsl(var(--nano-blue))]/10 flex items-center justify-center group-hover:bg-[hsl(var(--nano-blue))]/20 transition-colors">
                        <Upload className="w-10 h-10 text-[hsl(var(--nano-blue))]" />
                      </div>
                      <div>
                        <p className="text-xl font-semibold text-white mb-2">Drop your image here</p>
                        <p className="text-muted-foreground">or click to browse • PNG, JPG, WEBP up to 10MB</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Image Preview Grid */}
                    <div className={`grid gap-6 ${editResult ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
                      {/* Original Image */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Original</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={removeImage}
                            className="text-muted-foreground hover:text-white"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                        <div 
                          className="nano-image-container aspect-video cursor-pointer"
                          onClick={() => showImage(uploadedImage.preview, uploadedImage.name, uploadedImage.preview)}
                        >
                          <Image
                            src={uploadedImage.preview}
                            alt={uploadedImage.name}
                            fill
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                      </div>

                      {/* Edited Image */}
                      {editResult && (
                        <div className="space-y-3 nano-slide-up">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-[hsl(var(--nano-green))]">✨ AI Enhanced</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownload(editResult, 'nano-edited.png')}
                              className="text-muted-foreground hover:text-white"
                            >
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </Button>
                          </div>
                          <div 
                            className="nano-image-container aspect-video cursor-pointer nano-pulse-glow"
                            onClick={() => showImage(editResult, 'AI Edited', editResult)}
                          >
                            <Image
                              src={editResult}
                              alt="AI Edited"
                              fill
                              className="object-contain"
                              unoptimized
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Prompt Input */}
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Describe the changes you want... e.g., 'Remove the background', 'Add a sunset sky', 'Make it look vintage'"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="min-h-[100px] bg-secondary/50 border-border/50 focus:border-[hsl(var(--nano-blue))] resize-none text-base"
                        disabled={isProcessing}
                      />
                      
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Button
                          onClick={generateEdit}
                          disabled={!prompt.trim() || isProcessing}
                          className="flex-1 h-12 nano-button"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Wand2 className="w-5 h-5 mr-2" />
                              Generate Edit
                            </>
                          )}
                        </Button>
                        
                        {editResult && (
                          <Button
                            variant="outline"
                            onClick={() => handleDownload(editResult, 'nano-edited.png')}
                            className="h-12 px-8 nano-button-secondary"
                          >
                            <Download className="w-5 h-5 mr-2" />
                            Download Result
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Scroll to History */}
            {history.length > 0 && (
              <div className="text-center mt-12">
                <button
                  onClick={scrollToHistory}
                  className="inline-flex flex-col items-center gap-2 text-muted-foreground hover:text-white transition-colors"
                >
                  <span className="text-sm">View Edit History</span>
                  <ChevronDown className="w-5 h-5 animate-bounce" />
                </button>
              </div>
            )}
          </div>
        </main>
      </section>

      {/* History Gallery Section */}
      {history.length > 0 && (
        <section ref={historyRef} className="relative py-20 lg:py-32 border-t border-border/30">
          <div className="nano-container">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-12">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[hsl(var(--nano-purple))]/20 flex items-center justify-center">
                  <History className="w-6 h-6 text-[hsl(var(--nano-purple))]" />
                </div>
                <div>
                  <h2 className="nano-heading text-white">Edit History</h2>
                  <p className="text-muted-foreground">{history.length} saved edit{history.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>

            {/* History Grid */}
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
                        <h3 className="text-lg font-semibold text-white truncate mb-1">
                          {item.postTitle}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.requestText}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatDate(item.timestamp)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteHistoryItem(item.id)}
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
                    <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-border/30">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => showImage(item.originalImageUrl, 'Original', item.originalImageUrl)}
                        className="text-muted-foreground hover:text-white"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Original
                      </Button>
                      {item.editedImageUrl && (
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
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border/30 py-8">
        <div className="nano-container">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Image
                src="/logo-icon.png"
                alt="Nano Logo"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="font-semibold text-white">Nano</span>
              <span className="text-sm text-muted-foreground">v1.0</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link href="/disclaimer" className="hover:text-white transition-colors">Disclaimer</Link>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Powered by Google Gemini AI
            </p>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              Built by{' '}
              <a 
                href="https://github.com/4mohdisa" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-white hover:text-[hsl(var(--nano-blue))] transition-colors"
              >
                <Github className="w-4 h-4" />
                4mohdisa
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function HomePage() {
  return (
    <ImageViewerProvider>
      <NanoApp />
    </ImageViewerProvider>
  )
}
