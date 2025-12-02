import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/lib/theme-context'
import { Analytics } from '@vercel/analytics/next'

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: 'Nano - AI Image Editor',
  description: 'Transform your images with AI-powered editing. Upload any photo and describe the changes you want - powered by Google Gemini AI.',
  keywords: ['AI image editing', 'image transformation', 'Google Gemini AI', 'AI art generation', 'photo editing', 'Nano', 'AI editor'],
  authors: [{ name: 'Mohammed Isa' }],
  creator: 'Mohammed Isa',
  publisher: 'Nano',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  // Basic meta tags
  metadataBase: new URL('https://nano-edit.vercel.app'),
  alternates: {
    canonical: '/',
  },

  // Open Graph / Facebook
  openGraph: {
    type: 'website',
    url: '/',
    title: 'Nano - AI Image Editor',
    description: 'Transform your images with AI-powered editing. Upload any photo and describe the changes you want - powered by Google Gemini AI.',
    siteName: 'Nano',
    images: [
      {
        url: '/logo-icon.png',
        width: 512,
        height: 512,
        alt: 'Nano - AI Image Editor',
      },
    ],
    locale: 'en_US',
  },

  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'Nano - AI Image Editor',
    description: 'Transform your images with AI-powered editing. Upload any photo and describe the changes you want - powered by Google Gemini AI.',
    images: ['/logo-icon.png'],
    creator: '@4mohdisa',
  },

  // Favicons and icons
  icons: {
    icon: [
      { url: '/favicon/favicon.ico', sizes: 'any' },
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/favicon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'android-chrome-192x192', url: '/favicon/android-chrome-192x192.png' },
      { rel: 'android-chrome-512x512', url: '/favicon/android-chrome-512x512.png' },
    ],
  },

  // Manifest
  manifest: '/favicon/site.webmanifest',

  // Additional meta tags
  other: {
    'theme-color': '#0D0D0F',
    'msapplication-TileColor': '#0D0D0F',
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
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon/favicon-16x16.png" type="image/png" sizes="16x16" />
        <link rel="icon" href="/favicon/favicon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/favicon/apple-touch-icon.png" />
        <link rel="manifest" href="/favicon/site.webmanifest" />
        <meta name="theme-color" content="#0D0D0F" />
      </head>
      <body className={`${inter.className} dark antialiased`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
