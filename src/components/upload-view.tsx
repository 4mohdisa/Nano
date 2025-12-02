'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Upload, Wand2, X, Image as ImageIcon, Loader2, CheckCircle, Sparkles } from 'lucide-react'
import Image from 'next/image'
import { useImageViewer } from './image-viewer'

interface UploadedImage {
  id: string
  file: File
  preview: string
  name: string
  size: number
}

export function UploadView() {
  const [uploadedImage, setUploadedImage] = useState<UploadedImage | null>(null)
  const [prompt, setPrompt] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { showImage } = useImageViewer()

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WEBP)')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image size must be less than 10MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setUploadedImage({
        id: `img_${Date.now()}`,
        file,
        preview: reader.result as string,
        name: file.name,
        size: file.size
      })
    }
    reader.readAsDataURL(file)
  }

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WEBP)')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setUploadedImage({
        id: `img_${Date.now()}`,
        file,
        preview: reader.result as string,
        name: file.name,
        size: file.size
      })
    }
    reader.readAsDataURL(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  // Remove uploaded image
  const removeImage = () => {
    setUploadedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Send to Editor
  const sendToEditor = () => {
    if (!uploadedImage || !prompt.trim()) {
      alert('Please upload an image and enter a prompt')
      return
    }

    setIsProcessing(true)

    // Create editor data with uploaded image
    const editorData = {
      id: `req_${Date.now()}_${uploadedImage.id}`,
      post: {
        id: uploadedImage.id,
        title: uploadedImage.name,
        description: prompt,
        imageUrl: uploadedImage.preview, // base64 data URL
        postUrl: '',
        created_utc: Math.floor(Date.now() / 1000),
        created_date: new Date().toISOString(),
        author: 'You',
        score: 0,
        num_comments: 0,
        subreddit: ''
      },
      analysis: prompt,
      timestamp: new Date().toISOString()
    }

    console.log('Sending to editor:', editorData)
    localStorage.setItem('pendingEditorItem', JSON.stringify(editorData))

    // Force a storage event to trigger tab switch
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'pendingEditorItem',
      newValue: JSON.stringify(editorData),
      oldValue: null,
      storageArea: localStorage
    }))

    // Reset form
    setUploadedImage(null)
    setPrompt('')
    setIsProcessing(false)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }

    alert('Image sent to Editor! The app will switch to the Editor tab automatically.')
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl nano-gradient mb-4">
          <Upload className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-white">
          Upload Your Image
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Drop an image and describe the changes you want AI to make
        </p>
      </div>

      {/* Workflow Steps */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-4 sm:gap-8 p-4 rounded-2xl nano-glass">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[hsl(var(--nano-blue))] flex items-center justify-center text-sm font-bold text-white">
              1
            </div>
            <span className="text-sm font-medium text-white hidden sm:inline">Upload</span>
          </div>
          <div className="w-8 h-px bg-border" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[hsl(var(--nano-purple))]/30 flex items-center justify-center text-sm font-bold text-muted-foreground">
              2
            </div>
            <span className="text-sm font-medium text-muted-foreground hidden sm:inline">Edit</span>
          </div>
          <div className="w-8 h-px bg-border" />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[hsl(var(--nano-green))]/30 flex items-center justify-center text-sm font-bold text-muted-foreground">
              3
            </div>
            <span className="text-sm font-medium text-muted-foreground hidden sm:inline">Save</span>
          </div>
        </div>
      </div>

      {/* Main Upload Card */}
      <div className="nano-card p-6 sm:p-8">
        <div className="space-y-6">
          {/* Upload Area */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[hsl(var(--nano-blue))]/20 flex items-center justify-center text-xs font-bold text-[hsl(var(--nano-blue))]">1</span>
              Upload Image
            </Label>

            {!uploadedImage ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                className="relative border-2 border-dashed border-border/50 rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 hover:border-[hsl(var(--nano-blue))] hover:bg-[hsl(var(--nano-blue))]/5 group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--nano-blue))]/10 flex items-center justify-center group-hover:bg-[hsl(var(--nano-blue))]/20 transition-colors">
                    <Upload className="w-8 h-8 text-[hsl(var(--nano-blue))]" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-white mb-1">Drop your image here</p>
                    <p className="text-sm text-muted-foreground">
                      or click to browse • PNG, JPG, WEBP up to 10MB
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-border/50 bg-secondary/30">
                <div
                  className="relative aspect-video cursor-pointer"
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
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={removeImage}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
                <div className="p-4 border-t border-border/30 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[hsl(var(--nano-green))]/10 flex items-center justify-center">
                      <ImageIcon className="w-5 h-5 text-[hsl(var(--nano-green))]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white truncate max-w-[200px]">{uploadedImage.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(uploadedImage.size)}</p>
                    </div>
                  </div>
                  <CheckCircle className="w-5 h-5 text-[hsl(var(--nano-green))]" />
                </div>
              </div>
            )}
          </div>

          {/* Prompt Input */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[hsl(var(--nano-purple))]/20 flex items-center justify-center text-xs font-bold text-[hsl(var(--nano-purple))]">2</span>
              Describe Your Edits
            </Label>
            <Textarea
              placeholder="Example: Remove the background, enhance colors, add a sunset sky, make it look vintage..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px] bg-secondary/50 border-border/50 focus:border-[hsl(var(--nano-purple))] resize-none text-base"
              disabled={!uploadedImage}
            />
            <p className="text-sm text-muted-foreground">
              Be specific about what changes you want — the more detail, the better the result!
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              onClick={sendToEditor}
              disabled={!uploadedImage || !prompt.trim() || isProcessing}
              className="w-full h-14 text-base font-semibold nano-button"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 mr-3" />
                  Continue to Editor
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Tips Card */}
      <div className="nano-card p-6 border-[hsl(var(--nano-blue))]/20">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[hsl(var(--nano-blue))]/10 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5 text-[hsl(var(--nano-blue))]" />
          </div>
          <div>
            <h3 className="font-semibold text-white mb-3">Tips for Better Results</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-[hsl(var(--nano-blue))]">•</span>
                <span>Be specific about what you want to change (e.g., "remove the blue car" instead of "remove object")</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[hsl(var(--nano-blue))]">•</span>
                <span>Describe the desired style or mood (e.g., "make it look more professional" or "add a vintage filter")</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[hsl(var(--nano-blue))]">•</span>
                <span>Use high-quality images for best results (clear, well-lit photos work best)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[hsl(var(--nano-blue))]">•</span>
                <span>You'll have a chance to refine your prompt in the Editor before generating</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
