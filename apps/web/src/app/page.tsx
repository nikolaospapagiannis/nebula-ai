'use client';

import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Star, Shield, CheckCircle2, Mic, Globe, Users, Zap, FileText, Brain, BarChart3, TrendingUp, Search, Lock, Sparkles, ChevronRight, ArrowRight, Calendar, CheckCircle } from 'lucide-react';
import { CardGlass } from '@/components/ui/card-glass';
import { Button } from '@/components/ui/button-v2';
import { cn } from '@/lib/utils';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#000211]">
      <Navigation />

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 gradient-hero"></div>
        <div className="container-ff relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* G2 Badge */}
            <div className="inline-flex items-center gap-3 bg-[#0a0a1a]/60 border border-[#1e293b] rounded-full px-4 py-2 mb-6">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="paragraph-s text-[#cbd5e1]">Rated 4.8 / 5</span>
              <span className="text-[#1e293b]">•</span>
              <div className="flex items-center gap-2">
                <Shield size={14} className="text-[#7a5af8]" />
                <span className="paragraph-s text-[#cbd5e1]">SOC 2 Type II</span>
              </div>
            </div>

            <h1 className="heading-xl text-white mb-6">
              The #1 AI Teammate For Your{' '}
              <span className="gradient-text">Meetings</span>
            </h1>

            <p className="paragraph-l text-[#cbd5e1] mb-8 max-w-2xl mx-auto">
              Transcribe, summarize, search, and analyze all your team conversations
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/register" className="button-primary">
                Get Started Free
              </Link>
              <Link href="/register" className="button-secondary">
                Request Demo
              </Link>
            </div>

            <p className="paragraph-s text-[#94a3b8]">
              <span className="font-semibold text-white">800,000+ companies</span> use Fireflies
            </p>
          </div>

          {/* Video Placeholder */}
          <div className="mt-16 max-w-5xl mx-auto">
            <div className="relative rounded-3 overflow-hidden border border-[#1e293b] bg-[#0a0a1a] aspect-video flex items-center justify-center group cursor-pointer hover:border-[#7a5af8] transition-colors">
              <div className="w-16 h-16 rounded-full bg-[#7a5af8] flex items-center justify-center group-hover:scale-110 transition-transform">
                <div className="w-0 h-0 border-l-8 border-l-white border-t-6 border-t-transparent border-b-6 border-b-transparent ml-1"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="py-24 px-4 bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              More Than Just Transcription
            </h2>
            <p className="text-xl text-slate-400">
              Built on multi-model ensemble architecture for unmatched accuracy
            </p>
          </div>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Large Feature Card - Spans 2 columns */}
            <CardGlass
              variant="elevated"
              hover
              className="md:col-span-2 p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30 flex items-center justify-center">
                  <Globe className="w-6 h-6 text-teal-400" />
                </div>
                <h3 className="text-2xl font-bold text-white">
                  150+ Languages with Dialect Support
                </h3>
              </div>
              <p className="text-slate-400 mb-6">
                Our Whisper + DeepSpeech ensemble detects accents automatically.
                From French Canadian to Brazilian Portuguese, we catch every nuance.
              </p>
              <div className="flex flex-wrap gap-2">
                {['English', 'Spanish', 'Mandarin', 'German', 'Hindi', 'Arabic', 'French'].map(lang => (
                  <span key={lang} className="px-3 py-1 bg-slate-800/50 border border-white/10 rounded-full text-sm text-slate-300">
                    {lang}
                  </span>
                ))}
                <span className="px-3 py-1 bg-teal-500/20 border border-teal-500/30 rounded-full text-sm text-teal-300 font-semibold">
                  +143 more
                </span>
              </div>
            </CardGlass>

            {/* Tall Feature Card - Right side */}
            <CardGlass
              variant="default"
              hover
              className="md:row-span-2 p-8 bg-gradient-to-br from-slate-900/50 to-slate-800/30 relative overflow-hidden"
            >
              {/* Glow effect */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl"></div>

              <div className="relative z-10">
                <Zap className="w-10 h-10 text-teal-400 mb-6" />
                <h3 className="text-2xl font-bold text-white mb-3">
                  Real-Time Processing
                </h3>
                <p className="text-slate-400 mb-8">
                  &lt;100ms latency using WebRTC and WebSocket architecture.
                  See the transcript appear as you speak.
                </p>

                {/* Live metrics */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <span className="text-sm text-slate-400">Processing Time</span>
                    <span className="text-lg font-mono font-bold text-emerald-400">0.08s</span>
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <span className="text-sm text-slate-400">Accuracy</span>
                    <span className="text-lg font-mono font-bold text-emerald-400">98.2%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Concurrent Users</span>
                    <span className="text-lg font-mono font-bold text-cyan-400">100K+</span>
                  </div>
                </div>
              </div>
            </CardGlass>

            {/* Bottom Feature Cards */}
            <CardGlass variant="default" hover className="p-8">
              <BarChart3 className="w-10 h-10 text-purple-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">
                Predictive Deal Scoring
              </h3>
              <p className="text-sm text-slate-400">
                ML models analyze sentiment and topic evolution to predict deal success probability in real-time.
              </p>
            </CardGlass>

            <CardGlass variant="default" hover className="p-8">
              <Search className="w-10 h-10 text-amber-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">
                Semantic Search
              </h3>
              <p className="text-sm text-slate-400">
                Don't just search keywords. Ask "What was the budget decision?" and get the exact moment.
              </p>
            </CardGlass>
          </div>
        </div>
      </section>

      {/* Conversation Intelligence */}
      <section className="py-19 px-4 bg-[#0a0a1a]">
        <div className="container-ff">
          <div className="text-center mb-12">
            <h2 className="heading-l text-white mb-3">Conversation Intelligence</h2>
            <p className="paragraph-l text-[#cbd5e1]">Analyze talk-time, sentiment, and topics</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <SmallCard
              icon={<BarChart3 className="text-[#7a5af8] w-8 h-8 mb-3" />}
              title="Speaker Analytics"
              description="Track talk-time and participation rates"
            />
            <SmallCard
              icon={<TrendingUp className="text-[#7a5af8] w-8 h-8 mb-3" />}
              title="Sentiment Analysis"
              description="Understand meeting tone and engagement"
            />
            <SmallCard
              icon={<Search className="text-[#7a5af8] w-8 h-8 mb-3" />}
              title="Topic Tracking"
              description="Monitor key discussion points"
            />
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-24 px-4 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Why Modern Teams Choose Fireff-v2
            </h2>
            <p className="text-xl text-slate-400">
              30% more features at 25% lower cost than competitors
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-800">
                  <th className="py-6 px-6 text-left text-slate-400 font-medium text-sm uppercase tracking-wider">
                    Feature
                  </th>
                  <th className="py-6 px-6 text-center bg-gradient-to-b from-teal-500/10 to-transparent">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-lg">
                      <Sparkles className="w-4 h-4" />
                      <span className="font-bold text-white">Fireff-v2</span>
                    </div>
                  </th>
                  <th className="py-6 px-6 text-center text-slate-500 font-medium">
                    Fireflies.ai
                  </th>
                  <th className="py-6 px-6 text-center text-slate-500 font-medium">
                    Otter.ai
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    feature: 'Transcription Accuracy',
                    us: '98% (Ensemble)',
                    them: '95%',
                    other: '90%',
                    highlight: true
                  },
                  {
                    feature: 'Languages Supported',
                    us: '150+ with Dialects',
                    them: '100+',
                    other: 'English Only',
                    highlight: true
                  },
                  {
                    feature: 'Video Recording',
                    us: 'All Plans',
                    them: 'Business+ Only',
                    other: 'Not Available',
                    highlight: false
                  },
                  {
                    feature: 'Real-time Latency',
                    us: '<100ms',
                    them: 'Standard',
                    other: 'Standard',
                    highlight: true
                  },
                  {
                    feature: 'Mobile App',
                    us: 'iOS & Android (Offline)',
                    them: 'Yes',
                    other: 'iOS Only',
                    highlight: false
                  },
                  {
                    feature: 'API Access',
                    us: 'GraphQL + REST + WebSocket',
                    them: 'Limited',
                    other: 'Limited',
                    highlight: false
                  },
                ].map((row, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-5 px-6 font-medium text-white">
                      {row.feature}
                    </td>
                    <td className={cn(
                      "py-5 px-6 text-center font-bold bg-teal-500/5",
                      row.highlight ? "text-teal-400" : "text-white"
                    )}>
                      {row.us}
                    </td>
                    <td className="py-5 px-6 text-center text-slate-400">
                      {row.them}
                    </td>
                    <td className="py-5 px-6 text-center text-slate-500">
                      {row.other}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom CTA */}
          <div className="mt-12 text-center">
            <Button variant="gradient-primary" size="lg">
              See Full Comparison
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Elevated Pricing Section */}
      <section className="py-24 px-4 bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Enterprise Power, Startup Pricing
            </h2>
            <p className="text-xl text-slate-400">
              Save up to 30% compared to competitors. No hidden fees.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 lg:gap-8">
            {/* Free Tier */}
            <CardGlass variant="subtle" className="p-8">
              <h3 className="text-lg font-semibold text-white mb-2">Free</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold text-white">$0</span>
                <span className="text-slate-400">/mo</span>
              </div>
              <p className="text-sm text-slate-400 mb-6">
                For individuals getting started
              </p>
              <Button variant="ghost-glass" className="w-full mb-8">
                Get Started
              </Button>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2 text-slate-300">
                  <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  1,000 mins/mo
                </li>
                <li className="flex items-start gap-2 text-slate-300">
                  <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  5 users max
                </li>
                <li className="flex items-start gap-2 text-slate-300">
                  <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  Basic AI summaries
                </li>
              </ul>
            </CardGlass>

            {/* Pro Tier */}
            <CardGlass variant="default" className="p-8 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full text-xs font-bold text-white">
                BEST VALUE
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Pro</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">$8</span>
                <span className="text-slate-400">/user/mo</span>
              </div>
              <p className="text-sm text-slate-400 mb-6">
                Perfect for small teams
              </p>
              <Button variant="gradient-primary" className="w-full mb-8">
                Start Free Trial
              </Button>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2 text-slate-300">
                  <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  Unlimited minutes
                </li>
                <li className="flex items-start gap-2 text-slate-300">
                  <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  AI action items
                </li>
                <li className="flex items-start gap-2 text-slate-300">
                  <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  CRM integrations
                </li>
                <li className="flex items-start gap-2 text-slate-300">
                  <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  Video recording
                </li>
              </ul>
            </CardGlass>

            {/* Business Tier - Elevated */}
            <CardGlass
              variant="elevated"
              gradient
              className="p-8 md:-translate-y-4 relative border-teal-500/50"
            >
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-full text-xs font-bold text-white flex items-center gap-1">
                <Star className="w-3 h-3 fill-white" />
                POPULAR
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Business</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold text-white">$15</span>
                <span className="text-slate-400">/user/mo</span>
              </div>
              <p className="text-sm text-slate-400 mb-6">
                For growing organizations
              </p>
              <Button variant="gradient-primary" size="lg" className="w-full mb-8">
                Get Started
              </Button>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2 text-white">
                  <CheckCircle className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                  Everything in Pro
                </li>
                <li className="flex items-start gap-2 text-white">
                  <CheckCircle className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                  Speaker analytics
                </li>
                <li className="flex items-start gap-2 text-white">
                  <CheckCircle className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                  API access
                </li>
                <li className="flex items-start gap-2 text-white">
                  <CheckCircle className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                  Priority support
                </li>
                <li className="flex items-start gap-2 text-white">
                  <CheckCircle className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" />
                  Custom retention
                </li>
              </ul>
            </CardGlass>

            {/* Enterprise Tier */}
            <CardGlass variant="subtle" className="p-8">
              <h3 className="text-lg font-semibold text-white mb-2">Enterprise</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold text-white">$29</span>
                <span className="text-slate-400">/user/mo</span>
              </div>
              <p className="text-sm text-slate-400 mb-6">
                Security & control
              </p>
              <Button variant="ghost-glass" className="w-full mb-8">
                Contact Sales
              </Button>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2 text-slate-300">
                  <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  SSO & MFA
                </li>
                <li className="flex items-start gap-2 text-slate-300">
                  <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  Dedicated CSM
                </li>
                <li className="flex items-start gap-2 text-slate-300">
                  <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  HIPAA / SOC2
                </li>
                <li className="flex items-start gap-2 text-slate-300">
                  <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                  Custom SLAs
                </li>
              </ul>
            </CardGlass>
          </div>
        </div>
      </section>

      {/* Trust & Compliance */}
      <section className="py-24 px-4 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-bold text-teal-400 uppercase tracking-wider mb-4">
              Bank-Grade Security
            </p>
            <h2 className="text-4xl font-bold text-white mb-4">
              Compliance Built Into Our DNA
            </h2>
            <p className="text-xl text-slate-400">
              Trusted by Fortune 500 companies and healthcare organizations
            </p>
          </div>

          {/* Compliance Badges */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-16">
            {[
              { name: 'SOC 2 Type II', icon: Shield },
              { name: 'HIPAA', icon: Lock },
              { name: 'GDPR', icon: Shield },
              { name: 'ISO 27001', icon: Lock },
              { name: 'CCPA', icon: Shield },
              { name: 'FedRAMP Ready', icon: Lock },
            ].map((badge) => (
              <CardGlass
                key={badge.name}
                variant="default"
                hover
                className="p-6 text-center group"
              >
                <badge.icon className="w-10 h-10 text-slate-400 group-hover:text-teal-400 transition-colors mx-auto mb-3" />
                <h4 className="font-bold text-white text-sm">{badge.name}</h4>
              </CardGlass>
            ))}
          </div>

          {/* Enterprise CTA Card */}
          <CardGlass
            variant="elevated"
            gradient
            className="p-12 relative overflow-hidden"
          >
            {/* Background glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl"></div>

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="text-center lg:text-left">
                <h3 className="text-3xl font-bold text-white mb-3">
                  Ready for Private Cloud Deployment?
                </h3>
                <p className="text-lg text-slate-300 max-w-2xl">
                  We offer on-premise and private VPC deployments for regulated industries.
                  Complete data sovereignty with zero external dependencies.
                </p>
              </div>
              <div className="flex-shrink-0">
                <Button variant="gradient-primary" size="lg">
                  Talk to Solutions Team
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </CardGlass>
        </div>
      </section>
      {/* Testimonial */}
      <section className="py-19 px-4 bg-[#0a0a1a]">
        <div className="container-ff max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star key={i} size={20} className="fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <blockquote className="heading-m text-white font-normal italic mb-6">
            "Fireflies has transformed how our team handles meetings. We save hours every week and never miss important details."
          </blockquote>
          <p className="paragraph-m text-[#94a3b8]">
            — Sarah Chen, VP of Sales at TechCorp
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-4 bg-gradient-to-b from-slate-950 to-slate-900 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-teal-500/20 via-cyan-500/20 to-purple-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Transform Your Meetings Today
          </h2>
          <p className="text-xl text-slate-300 mb-12">
            Join 800,000+ companies using AI-powered meeting intelligence.
            Start free, upgrade anytime.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Button variant="gradient-primary" size="xl">
              Start Free Trial
              <Sparkles className="w-5 h-5 ml-2" />
            </Button>
            <Button variant="glassmorphism" size="xl">
              Schedule Demo
              <Calendar className="w-5 h-5 ml-2" />
            </Button>
          </div>

          <p className="text-sm text-slate-400">
            No credit card required · 1,000 free minutes · Cancel anytime
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function LargeFeatureCard({
  icon,
  title,
  description,
  features
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
}) {
  return (
    <div className="card-ff">
      {icon}
      <h3 className="heading-m text-white mb-3">{title}</h3>
      <p className="paragraph-m text-[#cbd5e1] mb-4">{description}</p>
      <ul className="space-y-2">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <CheckCircle2 className="text-green-400 w-5 h-5 mt-0.5 flex-shrink-0" />
            <span className="paragraph-s text-[#cbd5e1]">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SmallCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="card-ff">
      {icon}
      <h3 className="heading-s text-white mb-2">{title}</h3>
      <p className="paragraph-s text-[#94a3b8]">{description}</p>
    </div>
  );
}

function SecurityBadge({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="text-center">
      <div className="card-ff">
        <div className="text-[#7a5af8] w-10 h-10 mx-auto mb-3">
          {icon}
        </div>
        <h4 className="paragraph-m text-white font-semibold">{title}</h4>
      </div>
    </div>
  );
}
