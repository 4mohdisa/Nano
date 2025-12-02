import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Privacy Policy - Nano',
  description: 'Privacy Policy for Nano AI Image Editor',
}

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="nano-glass border-b border-white/5">
        <div className="nano-container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
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
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="nano-container py-12 lg:py-20">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

          <div className="prose prose-invert max-w-none space-y-8">
            <section className="nano-card p-6">
              <h2 className="text-xl font-semibold text-white mb-4">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                Welcome to Nano ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information when you use our AI-powered image editing service.
              </p>
            </section>

            <section className="nano-card p-6">
              <h2 className="text-xl font-semibold text-white mb-4">2. Information We Collect</h2>
              <div className="text-muted-foreground leading-relaxed space-y-4">
                <p><strong className="text-white">Images:</strong> When you upload images for editing, they are temporarily processed by our AI service (Google Gemini) and are not permanently stored on our servers.</p>
                <p><strong className="text-white">Local Storage:</strong> Your edit history is stored locally in your browser using localStorage and IndexedDB. This data never leaves your device unless you explicitly choose to sync it.</p>
                <p><strong className="text-white">Usage Data:</strong> We may collect anonymous usage statistics to improve our service, such as feature usage patterns and error reports.</p>
              </div>
            </section>

            <section className="nano-card p-6">
              <h2 className="text-xl font-semibold text-white mb-4">3. How We Use Your Information</h2>
              <ul className="text-muted-foreground leading-relaxed space-y-2 list-disc list-inside">
                <li>To provide and maintain our image editing service</li>
                <li>To process your image editing requests through our AI systems</li>
                <li>To improve and optimize our service</li>
                <li>To respond to your inquiries and support requests</li>
              </ul>
            </section>

            <section className="nano-card p-6">
              <h2 className="text-xl font-semibold text-white mb-4">4. Third-Party Services</h2>
              <div className="text-muted-foreground leading-relaxed space-y-4">
                <p><strong className="text-white">Google Gemini AI:</strong> We use Google's Gemini AI service to process image edits. Your images are sent to Google's servers for processing. Please refer to Google's privacy policy for more information about how they handle data.</p>
                <p><strong className="text-white">Vercel Analytics:</strong> We use Vercel Analytics to collect anonymous usage statistics. This helps us understand how users interact with our service.</p>
              </div>
            </section>

            <section className="nano-card p-6">
              <h2 className="text-xl font-semibold text-white mb-4">5. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement appropriate technical and organizational measures to protect your data. However, no method of transmission over the Internet or electronic storage is 100% secure. We cannot guarantee absolute security but strive to use commercially acceptable means to protect your information.
              </p>
            </section>

            <section className="nano-card p-6">
              <h2 className="text-xl font-semibold text-white mb-4">6. Your Rights</h2>
              <ul className="text-muted-foreground leading-relaxed space-y-2 list-disc list-inside">
                <li>Access and delete your locally stored data at any time through your browser settings</li>
                <li>Clear your edit history from the History tab</li>
                <li>Opt out of analytics by using browser privacy features</li>
              </ul>
            </section>

            <section className="nano-card p-6">
              <h2 className="text-xl font-semibold text-white mb-4">7. Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.
              </p>
            </section>

            <section className="nano-card p-6">
              <h2 className="text-xl font-semibold text-white mb-4">8. Changes to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </section>

            <section className="nano-card p-6">
              <h2 className="text-xl font-semibold text-white mb-4">9. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us through our GitHub repository at{' '}
                <a href="https://github.com/4mohdisa" target="_blank" rel="noopener noreferrer" className="text-[hsl(var(--nano-blue))] hover:underline">
                  github.com/4mohdisa
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>

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
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/privacy" className="text-white">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link href="/disclaimer" className="hover:text-white transition-colors">Disclaimer</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

