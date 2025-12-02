import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Disclaimer - Nano',
  description: 'Disclaimer for Nano AI Image Editor',
}

export default function Disclaimer() {
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
          <h1 className="text-4xl font-bold text-white mb-8">Disclaimer</h1>
          <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

          <div className="prose prose-invert max-w-none space-y-8">
            <section className="nano-card p-6">
              <h2 className="text-xl font-semibold text-white mb-4">General Disclaimer</h2>
              <p className="text-muted-foreground leading-relaxed">
                Nano is an AI-powered image editing tool provided for informational and creative purposes only. The Service is provided "as is" without any warranties, express or implied. We make no representations or warranties of any kind regarding the accuracy, reliability, or completeness of the AI-generated content.
              </p>
            </section>

            <section className="nano-card p-6">
              <h2 className="text-xl font-semibold text-white mb-4">AI-Generated Content</h2>
              <div className="text-muted-foreground leading-relaxed space-y-4">
                <p>The images produced by Nano are generated using artificial intelligence (Google Gemini AI). Please be aware that:</p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>AI-generated results may not always be accurate or meet your expectations</li>
                  <li>The AI may produce unexpected, imperfect, or unintended results</li>
                  <li>Generated images may contain artifacts, distortions, or errors</li>
                  <li>The quality of results depends on input image quality and prompt clarity</li>
                </ul>
              </div>
            </section>

            <section className="nano-card p-6">
              <h2 className="text-xl font-semibold text-white mb-4">No Professional Advice</h2>
              <p className="text-muted-foreground leading-relaxed">
                Nano is not a substitute for professional image editing services. The Service should not be relied upon for critical applications where accuracy is essential. For professional, commercial, or mission-critical projects, we recommend consulting with professional designers or photographers.
              </p>
            </section>

            <section className="nano-card p-6">
              <h2 className="text-xl font-semibold text-white mb-4">User Responsibility</h2>
              <div className="text-muted-foreground leading-relaxed space-y-4">
                <p>Users are solely responsible for:</p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>The content they upload and the prompts they provide</li>
                  <li>Ensuring they have the right to use and modify uploaded images</li>
                  <li>Verifying the appropriateness of generated content before use</li>
                  <li>Compliance with applicable laws and regulations</li>
                  <li>Any consequences arising from the use of generated content</li>
                </ul>
              </div>
            </section>

            <section className="nano-card p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Copyright and Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                Users must ensure they have proper rights to any images uploaded to the Service. We are not responsible for any copyright infringement or intellectual property violations resulting from user-uploaded content. AI-generated modifications may be subject to various intellectual property considerations that users should evaluate independently.
              </p>
            </section>

            <section className="nano-card p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Third-Party Services</h2>
              <p className="text-muted-foreground leading-relaxed">
                Nano relies on third-party services, including Google Gemini AI, for image processing. We are not responsible for the availability, accuracy, or policies of these third-party services. Users should review the terms and privacy policies of these services.
              </p>
            </section>

            <section className="nano-card p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                To the fullest extent permitted by applicable law, Nano and its creators shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or other intangible losses, resulting from your use or inability to use the Service.
              </p>
            </section>

            <section className="nano-card p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Ethical Use</h2>
              <div className="text-muted-foreground leading-relaxed space-y-4">
                <p>We strongly encourage ethical use of AI image editing technology. Users should:</p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Not create misleading or deceptive content (deepfakes)</li>
                  <li>Respect the privacy and rights of individuals depicted in images</li>
                  <li>Disclose when images have been AI-modified when appropriate</li>
                  <li>Not use the Service for harassment, defamation, or harmful purposes</li>
                </ul>
              </div>
            </section>

            <section className="nano-card p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Changes to This Disclaimer</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify this Disclaimer at any time. Changes will be effective immediately upon posting. Your continued use of the Service constitutes acceptance of any modifications.
              </p>
            </section>

            <section className="nano-card p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Contact</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have questions about this Disclaimer, please contact us through our GitHub repository at{' '}
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
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link href="/disclaimer" className="text-white">Disclaimer</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

