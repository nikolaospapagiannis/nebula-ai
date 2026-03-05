'use client'

import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#030014]">
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
        <p className="text-gray-400 mb-12">Last updated: March 5, 2026</p>

        <div className="space-y-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">1. Information We Collect</h2>
            <p>We collect information you provide directly when you create an account, including your name, email address, and organization name. We also collect usage data such as meeting metadata, interaction patterns, and feature usage to improve our services.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">2. How We Use Your Information</h2>
            <p>We use your information to provide and improve Nebula AI&apos;s meeting intelligence services, including real-time transcription, AI-powered analysis, and coaching features. We do not sell your personal data to third parties.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">3. Data Storage and Security</h2>
            <p>Your data is encrypted in transit and at rest. Meeting recordings and transcriptions are stored securely and access is restricted to authorized members of your organization based on role-based access controls.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">4. Data Retention</h2>
            <p>We retain your data for as long as your account is active. You may request deletion of your data at any time by contacting our support team or through your account settings.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">5. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal data. You may also request a portable copy of your data. To exercise these rights, contact us at privacy@nebula-ai.com.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">6. Cookies</h2>
            <p>We use essential cookies to maintain your session and preferences. We do not use third-party tracking cookies without your consent.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-white mb-4">7. Contact Us</h2>
            <p>If you have questions about this privacy policy, please contact us at{' '}
              <a href="mailto:privacy@nebula-ai.com" className="text-[#7a5af8] hover:text-[#9945ff]">privacy@nebula-ai.com</a>.
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
