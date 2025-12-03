'use client'

import { useEffect, useState, createContext, useContext, ReactNode } from 'react'
import { X, Download, ExternalLink, ZoomIn, ZoomOut, HelpCircle } from 'lucide-react'

interface ImageViewerProps {
  src: string
  alt: string
  onClose: () => void
  downloadUrl?: string
  externalUrl?: string
}

export function ImageViewer({ src, alt, onClose, downloadUrl, externalUrl }: ImageViewerProps) {
  const [zoom, setZoom] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [showHelp, setShowHelp] = useState(false)
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })

  // Zoom controls
  const zoomIn = () => setZoom(prev => Math.min(prev * 1.25, 4))
  const zoomOut = () => setZoom(prev => Math.max(prev / 1.25, 0.25))
  const resetZoom = () => setZoom(1)

  // Double click to reset zoom
  const handleImageDoubleClick = () => {
    resetZoom()
  }

  // Reset loading state when src changes
  useEffect(() => {
    setIsLoading(true)
    setImageDimensions({ width: 0, height: 0 })
    setZoom(1)
  }, [src])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      } else if (event.key === '+' || event.key === '=') {
        event.preventDefault()
        zoomIn()
      } else if (event.key === '-' || event.key === '_') {
        event.preventDefault()
        zoomOut()
      } else if (event.key === '0') {
        event.preventDefault()
        resetZoom()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [onClose])

  // Handle click outside
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  const handleDownload = () => {
    if (downloadUrl) {
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `nano-image-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight })
    setIsLoading(false)
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl"
      onClick={handleBackdropClick}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-20 rounded-full bg-white/10 hover:bg-white/20 p-3 text-white transition-all duration-200"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Action buttons */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 flex-wrap">
        {downloadUrl && (
          <button
            onClick={handleDownload}
            className="rounded-full bg-white/10 hover:bg-white/20 p-3 text-white transition-all duration-200"
            title="Download Image"
          >
            <Download className="h-5 w-5" />
          </button>
        )}
        {externalUrl && (
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-white/10 hover:bg-white/20 p-3 text-white transition-all duration-200"
            title="Open Original"
          >
            <ExternalLink className="h-5 w-5" />
          </a>
        )}

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-white/10 rounded-full px-2 py-1">
          <button
            onClick={zoomOut}
            className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
            title="Zoom Out (-)"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button
            onClick={resetZoom}
            className="px-3 py-1 text-white hover:bg-white/10 rounded-full text-sm font-medium transition-colors min-w-[60px] text-center"
            title="Reset Zoom (0)"
          >
            {Math.round(zoom * 100)}%
          </button>
          <button
            onClick={zoomIn}
            className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
            title="Zoom In (+)"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors ml-1"
            title="Show Help"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Help Overlay */}
      {showHelp && (
        <div className="absolute top-20 left-4 z-30 bg-black/90 backdrop-blur-xl rounded-2xl p-5 max-w-xs border border-white/10">
          <div className="text-white text-sm space-y-3">
            <h3 className="font-semibold text-base mb-3">Keyboard Shortcuts</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white/70">Zoom In</span>
                <kbd className="px-2 py-1 bg-white/10 rounded text-xs">+</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70">Zoom Out</span>
                <kbd className="px-2 py-1 bg-white/10 rounded text-xs">-</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70">Reset Zoom</span>
                <kbd className="px-2 py-1 bg-white/10 rounded text-xs">0</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70">Close</span>
                <kbd className="px-2 py-1 bg-white/10 rounded text-xs">ESC</kbd>
              </div>
            </div>
            <p className="text-xs text-white/50 pt-2 border-t border-white/10">
              Double-click image to reset zoom
            </p>
          </div>
        </div>
      )}

      {/* Image container */}
      <div 
        className="relative w-full h-full flex items-center justify-center p-4 sm:p-8 lg:p-16 overflow-auto"
        onClick={handleBackdropClick}
      >
        {/* Loading spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="w-12 h-12 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
          </div>
        )}

        {/* Image wrapper with zoom */}
        <div
          className="relative flex items-center justify-center"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
            transition: 'transform 0.2s ease-out'
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            onLoad={handleImageLoad}
            onDoubleClick={handleImageDoubleClick}
            className="max-w-[85vw] max-h-[85vh] w-auto h-auto object-contain rounded-lg shadow-2xl cursor-pointer select-none"
            style={{
              opacity: isLoading ? 0 : 1,
              transition: 'opacity 0.3s ease-out'
            }}
            draggable={false}
          />
        </div>

        {/* Image info overlay - fixed at bottom */}
        {!isLoading && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-black/80 backdrop-blur-sm rounded-full px-6 py-3 max-w-[90vw]">
            <div className="flex items-center gap-4 text-sm">
              <p className="text-white font-medium truncate">{alt}</p>
              {imageDimensions.width > 0 && (
                <span className="text-white/50 whitespace-nowrap">
                  {imageDimensions.width} × {imageDimensions.height}
                </span>
              )}
              {zoom !== 1 && (
                <span className="text-white/50 whitespace-nowrap">
                  {Math.round(zoom * 100)}%
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface ImageViewerContextType {
  showImage: (src: string, alt: string, downloadUrl?: string, externalUrl?: string) => void
  hideImage: () => void
}

const ImageViewerContext = createContext<ImageViewerContextType | undefined>(undefined)

export function ImageViewerProvider({ children }: { children: ReactNode }) {
  const [viewerState, setViewerState] = useState<{
    isOpen: boolean
    src: string
    alt: string
    downloadUrl?: string
    externalUrl?: string
  }>({
    isOpen: false,
    src: '',
    alt: '',
  })

  const showImage = (src: string, alt: string, downloadUrl?: string, externalUrl?: string) => {
    setViewerState({
      isOpen: true,
      src,
      alt,
      downloadUrl,
      externalUrl,
    })
  }

  const hideImage = () => {
    setViewerState(prev => ({ ...prev, isOpen: false }))
  }

  return (
    <ImageViewerContext.Provider value={{ showImage, hideImage }}>
      {children}
      {viewerState.isOpen && (
        <ImageViewer
          src={viewerState.src}
          alt={viewerState.alt}
          downloadUrl={viewerState.downloadUrl}
          externalUrl={viewerState.externalUrl}
          onClose={hideImage}
        />
      )}
    </ImageViewerContext.Provider>
  )
}

export function useImageViewer() {
  const context = useContext(ImageViewerContext)
  if (context === undefined) {
    throw new Error('useImageViewer must be used within an ImageViewerProvider')
  }
  return context
}
