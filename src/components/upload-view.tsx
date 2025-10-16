'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Upload, Wand2, X, Image as ImageIcon, Loader2, CheckCircle } from 'lucide-react'
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
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 mobile-container">
      {/* Header Section */}
      <div className="text-center py-8 sm:py-16 px-4 bg-gradient-to-b from-transparent via-muted/10 to-transparent mobile-container">
        <div className="flex flex-col items-center justify-center space-y-4 mb-6 sm:mb-8">
          <div className="flex items-center justify-center space-x-3 sm:space-x-4">
            <div className="relative flex-shrink-0">
              <Wand2 className="h-8 w-8 sm:h-12 sm:w-12 text-primary animate-pulse" />
              <div className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-yellow-500 rounded-full animate-ping opacity-75"></div>
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent mobile-responsive-large">
              Fixtral
            </h1>
          </div>
        </div>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 sm:mb-12 leading-relaxed mobile-responsive-text px-4 sm:px-0">
          AI-Powered Image Editor - Upload your image and describe the edits you want
        </p>

        {/* Workflow Steps */}
        <div className="flex justify-center px-4">
          <div className="flex flex-row items-center justify-center space-x-2 sm:space-x-4 sm:space-x-6 bg-gradient-to-r from-muted/30 via-muted/50 to-muted/30 p-3 sm:p-6 rounded-2xl border shadow-lg backdrop-blur-sm w-full max-w-md sm:max-w-none mx-auto">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-7 h-7 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shadow-lg touch-target">
                1
              </div>
              <span className="text-xs sm:text-sm font-semibold">Upload</span>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-xs sm:text-sm font-bold text-muted-foreground px-1 sm:px-2">→</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-7 h-7 sm:w-10 sm:h-10 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shadow-lg touch-target">
                2
              </div>
              <span className="text-xs sm:text-sm font-semibold">Edit</span>
            </div>
            <div className="flex items-center justify-center">
              <span className="text-xs sm:text-sm font-bold text-muted-foreground px-1 sm:px-2">→</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-7 h-7 sm:w-10 sm:h-10 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shadow-lg touch-target">
                3
              </div>
              <span className="text-xs sm:text-sm font-semibold">Save</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upload Interface */}
      <Card className="border-primary/20 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
          <CardTitle className="flex items-center space-x-3">
            <Upload className="h-6 w-6 text-primary" />
            <span>Upload & Edit Your Image</span>
          </CardTitle>
          <CardDescription>
            Upload an image and describe the edits you want AI to make
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Image Upload Area */}
          <div className="space-y-2">
            <Label htmlFor="image-upload" className="text-base font-semibold">
              1. Upload Image
            </Label>

            {!uploadedImage ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-muted-foreground/20 rounded-xl p-8 sm:p-12 text-center hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 cursor-pointer group"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-4 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
                    <Upload className="h-10 w-10 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-semibold">Drop your image here or click to browse</p>
                    <p className="text-sm text-muted-foreground">
                      Supports PNG, JPG, WEBP (max 10MB)
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative border rounded-xl overflow-hidden group">
                <div
                  className="relative aspect-video cursor-pointer"
                  onClick={() => showImage(uploadedImage.preview, uploadedImage.name, uploadedImage.preview)}
                >
                  <Image
                    src={uploadedImage.preview}
                    alt={uploadedImage.name}
                    fill
                    className="object-contain bg-muted"
                    unoptimized
                  />
                </div>
                <div className="absolute top-2 right-2 flex space-x-2">
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      removeImage()
                    }}
                    className="shadow-lg"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="p-4 bg-card border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <ImageIcon className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">{uploadedImage.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(uploadedImage.size)}
                        </p>
                      </div>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Prompt Input */}
          <div className="space-y-2">
            <Label htmlFor="edit-prompt" className="text-base font-semibold">
              2. Describe Your Edits
            </Label>
            <Textarea
              id="edit-prompt"
              placeholder="Example: Remove the person in the background, enhance the colors to make them more vibrant, add a sunset sky..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px] resize-none"
              disabled={!uploadedImage}
            />
            <p className="text-sm text-muted-foreground">
              Be specific about what changes you want - the more detail, the better the result!
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={sendToEditor}
              disabled={!uploadedImage || !prompt.trim() || isProcessing}
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold px-8 py-4 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Wand2 className="mr-3 h-5 w-5" />
                  Continue to Editor
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tips Section */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-4 flex items-center space-x-2">
            <Wand2 className="h-5 w-5 text-primary" />
            <span>Tips for Better Results</span>
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start space-x-2">
              <span className="text-primary font-bold">•</span>
              <span>Be specific about what you want to change (e.g., "remove the blue car" instead of "remove object")</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-primary font-bold">•</span>
              <span>Describe the desired style or mood (e.g., "make it look more professional" or "add a vintage filter")</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-primary font-bold">•</span>
              <span>Use high-quality images for best results (clear, well-lit photos work best)</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-primary font-bold">•</span>
              <span>You'll have a chance to refine your prompt in the Editor before generating</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
