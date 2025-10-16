'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserMenu } from '@/components/user-menu'
import { AuthModal } from '@/components/auth-modal'
import { useAuth } from '@/lib/auth-context'
import { ArrowRight, Zap, Shield, Users, Database, User } from 'lucide-react'
import Link from 'next/link'

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { user, loading } = useAuth()

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 mobile-safe-top">
        <div className="container mx-auto px-4 py-4 mobile-container">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mobile-responsive-heading hover:opacity-80 transition-opacity">
                PixelPrompt
              </h1>
              <span className="text-xs sm:text-sm font-medium text-muted-foreground hidden sm:inline">AI</span>
            </Link>
            <div className="flex items-center space-x-2 sm:space-x-4">
              {!loading && (
                user ? (
                  <UserMenu />
                ) : (
                  <Button
                    variant="ghost"
                    onClick={() => setShowAuthModal(true)}
                    className="flex items-center space-x-2 mobile-button touch-target"
                  >
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">Sign In</span>
                  </Button>
                )
              )}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 sm:py-24 pb-20 sm:pb-32 px-4 overflow-hidden mobile-safe-top">
        {/* Self-Hosted Video Background */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/bg.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40 z-10"></div>
        </div>
        <div className="container mx-auto text-center relative z-10 mobile-container">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="flex flex-col items-center justify-center mb-6 sm:mb-8">
              <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mobile-large-heading drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] mb-2">
                PixelPrompt
              </h1>
              <p className="text-xl sm:text-2xl font-semibold text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                AI-Powered Image Editing
              </p>
            </div>

            <p className="text-lg sm:text-xl md:text-2xl text-white max-w-3xl mx-auto mb-8 sm:mb-12 leading-relaxed px-4 sm:px-0 mobile-responsive-text drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              Transform your images with AI-powered editing.
              Upload any photo and describe the changes you want - powered by Google Gemini AI.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 sm:mb-16 px-4 sm:px-0">
              {user ? (
                <Link href="/app">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold px-6 sm:px-8 py-3 sm:py-4 shadow-lg hover:shadow-xl transition-all duration-200 mobile-button w-full sm:w-auto"
                  >
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <Button
                  size="lg"
                  onClick={() => setShowAuthModal(true)}
                  className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold px-6 sm:px-10 py-3 sm:py-4 shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 mobile-button w-full sm:w-auto"
                  style={{ animation: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
                >
                  <Zap className="mr-2 sm:mr-3 h-5 w-5" />
                  <span className="text-sm sm:text-base">🚀 Try for FREE - 2 Generations Daily!</span>
                  <ArrowRight className="ml-2 sm:ml-3 h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-4 sm:left-10 w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full blur-xl animate-pulse z-20"></div>
        <div className="absolute bottom-20 right-4 sm:right-10 w-24 h-24 sm:w-32 sm:h-32 bg-white/10 rounded-full blur-2xl animate-pulse delay-1000 z-20"></div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-20 px-4 mobile-container">
        <div className="container mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 mobile-responsive-large">Powerful AI-Powered Editing</h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mobile-responsive-text">
              Experience the future of image editing with our advanced AI technology
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center p-4 sm:p-6 rounded-xl bg-card/50 border shadow-lg hover:shadow-xl transition-all duration-300 mobile-card touch-target">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Lightning Fast</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Generate edited images in seconds using Google Gemini 2.5 Flash Image Preview
              </p>
            </div>

            <div className="text-center p-4 sm:p-6 rounded-xl bg-card/50 border shadow-lg hover:shadow-xl transition-all duration-300 mobile-card touch-target">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Privacy First</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Your images and data are processed securely with enterprise-grade security
              </p>
            </div>

            <div className="text-center p-4 sm:p-6 rounded-xl bg-card/50 border shadow-lg hover:shadow-xl transition-all duration-300 mobile-card touch-target">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Easy to Use</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Simple drag-and-drop interface with natural language prompts - no technical skills required
              </p>
            </div>

            <div className="text-center p-4 sm:p-6 rounded-xl bg-card/50 border shadow-lg hover:shadow-xl transition-all duration-300 mobile-card touch-target">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Cloud Storage</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Supabase-powered cloud storage with user accounts and cross-device synchronization
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-20 px-4 bg-muted/10 mobile-container">
        <div className="container mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 mobile-responsive-large">How It Works</h2>
            <p className="text-lg sm:text-xl text-muted-foreground mobile-responsive-text">
              Three simple steps to professional image editing
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-8">
            <div className="text-center mobile-card">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-4 shadow-lg touch-target">
                1
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Upload</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Upload your image and describe the edits you want to make
              </p>
            </div>

            <div className="text-center mobile-card">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-4 shadow-lg touch-target">
                2
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Generate</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                AI processes your image and applies the requested edits instantly
              </p>
            </div>

            <div className="text-center mobile-card">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-4 shadow-lg touch-target">
                3
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">Save</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Download your edits and build a portfolio of AI-generated images
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 px-4 mobile-container">
        <div className="container mx-auto text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 mobile-responsive-large">Ready to Transform Your Images?</h2>
            <p className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8 mobile-responsive-text">
              Join thousands of creators using AI to enhance their visual content
            </p>

            <Link href="/app">
              <Button size="lg" className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold px-6 sm:px-8 py-3 sm:py-3 shadow-lg hover:shadow-xl transition-all duration-300 mobile-button w-full sm:w-auto">
                Launch PixelPrompt
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/50 mobile-safe-bottom relative z-0">
        <div className="container mx-auto px-4 py-6 sm:py-8 mobile-container">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">PixelPrompt</span>
              <span className="text-sm text-muted-foreground">v0.2.0</span>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>Powered by Google Gemini AI</p>
            </div>
          </div>

          <div className="text-center mt-6 sm:mt-8 pt-6 sm:pt-8 border-t text-sm text-muted-foreground mobile-responsive-text">
            <p>&copy; 2025 PixelPrompt. Built with Next.js, Tailwind CSS, and Google Gemini AI.</p>
            <p className="mt-2">Made with ❤️ by Mohammed Isa</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          // Redirect to app after successful authentication
          window.location.href = '/app'
        }}
      />
    </div>
  )
}
