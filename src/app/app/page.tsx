'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UploadView } from '@/components/upload-view'
import { EditorView } from '@/components/editor-view'
import { HistoryView } from '@/components/history-view'
import { ImageViewerProvider } from '@/components/image-viewer'
import { Upload, History, Wand2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('upload')
  const [pendingEditorItems, setPendingEditorItems] = useState(0)

  // Listen for new editor items and switch to editor tab
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      console.log('Dashboard: Storage event received:', {
        key: e.key,
        newValue: e.newValue ? e.newValue.substring(0, 100) + '...' : null,
        oldValue: e.oldValue
      })

      if (e.key === 'pendingEditorItem' && e.newValue) {
        console.log('Dashboard: Switching to editor tab due to pending item')
        setActiveTab('editor')
        updatePendingCount()
      } else if (e.key === 'editHistory') {
        updatePendingCount()
      }
    }

    const updatePendingCount = () => {
      const pendingItem = localStorage.getItem('pendingEditorItem')
      const count = pendingItem ? 1 : 0
      console.log('Dashboard: Updating pending count:', { pendingItem: !!pendingItem, count })
      setPendingEditorItems(count)
    }

    // Initial count
    updatePendingCount()

    window.addEventListener('storage', handleStorageChange)

    // Also check for pending items on mount
    const pendingItem = localStorage.getItem('pendingEditorItem')
    console.log('Dashboard: Initial pending item check:', { pendingItem: !!pendingItem, data: pendingItem ? JSON.parse(pendingItem).post?.title : null })
    if (pendingItem) {
      console.log('Dashboard: Setting initial tab to editor due to existing pending item')
      setActiveTab('editor')
    }

    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Handle tab change with confirmation if there are pending items
  const handleTabChange = (tab: string) => {
    if (tab !== 'editor' && pendingEditorItems > 0) {
      const confirmChange = confirm(
        `You have ${pendingEditorItems} item(s) ready for editing in the Editor tab. Switch to Editor tab to continue?`
      )
      if (confirmChange) {
        setActiveTab('editor')
        return
      } else {
        // Clear pending item if user chooses not to go to editor
        localStorage.removeItem('pendingEditorItem')
        setPendingEditorItems(0)
      }
    }
    setActiveTab(tab)
  }

  return (
    <ImageViewerProvider>
      <div className="min-h-screen bg-background">
        {/* Ambient Background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-[hsl(var(--nano-blue))] rounded-full blur-[200px] opacity-10" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[hsl(var(--nano-purple))] rounded-full blur-[200px] opacity-10" />
        </div>

        {/* Header */}
        <header className="relative z-10 nano-glass border-b border-white/5">
          <div className="nano-container py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                </Link>
                <div className="h-6 w-px bg-border/50" />
                <Link href="/" className="flex items-center gap-3">
                  <Image
                    src="/logo-icon.png"
                    alt="Nano Logo"
                    width={36}
                    height={36}
                    className="rounded-xl"
                  />
                  <span className="text-xl font-bold text-white">Nano</span>
                </Link>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground hidden sm:inline">AI Image Editor</span>
                <span className="text-xs text-muted-foreground px-2 py-1 rounded-full bg-secondary/50">v1.0</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 nano-container py-8">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="grid grid-cols-3 w-full max-w-md">
                <TabsTrigger
                  value="upload"
                  className="flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  <span className="hidden sm:inline">Upload</span>
                </TabsTrigger>
                <TabsTrigger
                  value="editor"
                  className="flex items-center justify-center gap-2 relative"
                >
                  <Wand2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Editor</span>
                  {pendingEditorItems > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs font-bold rounded-full bg-[hsl(var(--nano-red))] text-white animate-pulse">
                      {pendingEditorItems}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="flex items-center justify-center gap-2"
                >
                  <History className="w-4 h-4" />
                  <span className="hidden sm:inline">History</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="upload" className="nano-fade-in">
              <UploadView />
            </TabsContent>

            <TabsContent value="editor" className="nano-fade-in">
              <EditorView />
            </TabsContent>

            <TabsContent value="history" className="nano-fade-in">
              <HistoryView />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </ImageViewerProvider>
  )
}
