import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Terms of Service - Nano',
  description: 'Terms of Service for Nano AI Image Editor',
}

export default function TermsOfService() {
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
          <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

          <div className="prose prose-invert max-w-none space-y-8">
            <section className="nano-card p-6">
              <h2 className="text-xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using Nano ("the Service"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service.
              </p>
            </section>

            <section className="nano-card p-6">
              <h2 className="text-xl font-semibold text-white mb-4">2. Description of Service</h2>
              <p className="text-muted-foreground leading-relaxed">
                Nano is an AI-powered image editing service that allows users to upload images and describe desired edits in natural language. The Service uses Google Gemini AI to process and generate edited images based on user prompts.
              </p>
            </section>

            <section className="nano-card p-6">
              <h2 className="text-xl font-semibold text-white mb-4">3. User Responsibilities</h2>
              <ul className="text-muted-foreground leading-relaxed space-y-2 list-disc list-inside">
                <li>You must be at least 13 years old to use this Service</li>
                <li>You are responsible for all content you upload to the Service</li>
                <li>You must not upload illegal, harmful, or copyrighted content without permission</li>
                <li>You must not use the Service to generate harmful, offensive, or misleading content</li>
                <li>You must not attempt to reverse engineer, hack, or disrupt the Service</li>
              </ul>
            </section>

            <section className="nano-card p-6">
              <h2 className="text-xl font-semibold text-white mb-4">4. Intellectual Property</h2>
              <div className="text-muted-foreground leading-relaxed space-y-4">
                <p><strong className="text-white">Your Content:</strong> You retain ownership of the images you upload. By using the Service, you grant us a limited license to process your images for the purpose of providing the editing service.</p>
                <p><strong className="text-white">Generated Content:</strong> AI-generated edits are provided for your personal or commercial use. However, you are responsible for ensuring your use of generated content complies with applicable laws.</p>
                <p><strong className="text-white">Our Service:</strong> The Nano brand, logo, and service design are our intellectual property and may not be used without permission.</p>
              </div>
            </section>

            <section className="nano-card p-6">
              <h2 className="text-xl font-semibold text-white mb-4">5. Prohibited Uses</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">You agree not to use the Service to:</p>
              <ul className="text-muted-foreground leading-relaxed space-y-2 list-disc list-inside">
                <li>Create deepfakes or misleading media intended to deceive</li>
                <li>Generate content that violates any person's privacy or rights</li>
                <li>Create illegal, harmful, threatening, or discriminatory content</li>
                <li>Infringe on copyrights, trademarks, or other intellectual property rights</li>
                <li>Distribute malware or engage in any malicious activities</li>
                <li>Overload, damage, or impair the Service</li>
              </ul>
            </section>

            <section className="nano-card p-6">
              <h2 className="text-xl font-semibold text-white mb-4">6. Service Availability</h2>
              <p className="text-muted-foreground leading-relaxed">
                We strive to provide reliable service but do not guarantee uninterrupted access. The Service may be temporarily unavailable due to maintenance, updates, or circumstances beyond our control. We reserve the right to modify, suspend, or discontinue the Service at any time.
              </p>
            </section>

            <section className="nano-card p-6">
              <h2 className="text-xl font-semibold text-white mb-4">7. Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE SERVICE.
              </p>
            </section>

            <section className="nano-card p-6">
              <h2 className="text-xl font-semibold text-white mb-4">8. Indemnification</h2>
              <p className="text-muted-foreground leading-relaxed">
                You agree to indemnify and hold harmless Nano and its creators from any claims, damages, losses, or expenses arising from your use of the Service or violation of these Terms.
              </p>
            </section>

            <section className="nano-card p-6">
              <h2 className="text-xl font-semibold text-white mb-4">9. Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to terminate or suspend your access to the Service at any time, without prior notice, for conduct that we believe violates these Terms or is harmful to other users or the Service.
              </p>
            </section>

            <section className="nano-card p-6">
              <h2 className="text-xl font-semibold text-white mb-4">10. Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update these Terms from time to time. Continued use of the Service after changes constitutes acceptance of the new Terms. We encourage you to review these Terms periodically.
              </p>
            </section>

            <section className="nano-card p-6">
              <h2 className="text-xl font-semibold text-white mb-4">11. Contact</h2>
              <p className="text-muted-foreground leading-relaxed">
                For questions about these Terms, please contact us through our GitHub repository at{' '}
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
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="text-white">Terms</Link>
              <Link href="/disclaimer" className="hover:text-white transition-colors">Disclaimer</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

