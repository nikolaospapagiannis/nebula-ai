'use client'

import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#030014]">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
        <p className="text-gray-400 mb-12">Last updated: March 5, 2026</p>

        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
            <p>By accessing or using Nebula AI, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use our services.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
            <p>Nebula AI provides AI-powered meeting intelligence, including real-time transcription, sentiment analysis, coaching, and analytics. Features may vary by subscription plan.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. User Accounts</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate information when creating an account and promptly update any changes.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Acceptable Use</h2>
            <p>You agree not to misuse our services, including attempting to gain unauthorized access, interfering with other users, or using the platform for any unlawful purpose. All meeting participants must be informed that AI analysis is active.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Intellectual Property</h2>
            <p>You retain ownership of your meeting content. Nebula AI retains ownership of the platform, its features, and any AI models. We do not use your meeting content to train our models without explicit consent.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Subscription and Billing</h2>
            <p>Paid plans are billed according to the pricing displayed at the time of purchase. You may cancel your subscription at any time. Refunds are handled in accordance with our refund policy.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Limitation of Liability</h2>
            <p>Nebula AI is provided &quot;as is&quot; without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">8. Termination</h2>
            <p>We reserve the right to suspend or terminate accounts that violate these terms. Upon termination, your right to use the service ceases immediately.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">9. Contact</h2>
            <p>For questions about these terms, contact us at{' '}
              <a href="mailto:legal@nebula-ai.com" className="text-[#7a5af8] hover:text-[#9945ff]">legal@nebula-ai.com</a>.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800">
          <Link href="/register" className="text-[#7a5af8] hover:text-[#9945ff]">
            &larr; Back to Registration
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
