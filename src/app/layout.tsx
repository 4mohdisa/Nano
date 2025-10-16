import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/lib/theme-context'
import { AuthProvider } from '@/lib/auth-context'
import { Analytics } from '@vercel/analytics/next'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'PixelPrompt - AI Image Editing',
  description: 'Transform your images with AI-powered editing using natural language prompts. Powered by Google Gemini AI.',
  keywords: ['AI image editing', 'natural language editing', 'image transformation', 'Google Gemini AI', 'AI art generation', 'photo editing', 'PixelPrompt'],
  authors: [{ name: 'Mohammed Isa' }],
  creator: 'Mohammed Isa',
  publisher: 'PixelPrompt',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  // Basic meta tags
  metadataBase: new URL('https://pixelprompt.app'), // Replace with your actual domain
  alternates: {
    canonical: '/',
  },

  // Open Graph / Facebook
  openGraph: {
    type: 'website',
    url: '/',
    title: 'PixelPrompt - AI Image Editing',
    description: 'Transform your images with AI-powered editing using natural language prompts. Powered by Google Gemini AI.',
    siteName: 'PixelPrompt',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'PixelPrompt - AI Image Editing',
      },
    ],
    locale: 'en_US',
  },

  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'PixelPrompt - AI Image Editing',
    description: 'Transform your images with AI-powered editing using natural language prompts. Powered by Google Gemini AI.',
    images: ['/og-image.jpg'],
    creator: '@4mohdisa',
  },

  // Favicons and icons
  icons: {
    icon: '/favicon.ico',
  },

  // Additional meta tags
  other: {
    'theme-color': '#000000',
    'msapplication-TileColor': '#000000',
    'msapplication-config': '/browserconfig.xml',
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Verification (add your actual verification codes)
  verification: {
    google: 'your-google-site-verification-code',
    yandex: 'your-yandex-verification-code',
    // Note: Bing verification is handled through other means
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} dark antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
