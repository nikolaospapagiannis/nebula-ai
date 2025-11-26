'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { Check, X } from 'lucide-react';

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);

  const tiers = [
    {
      name: 'Free',
      price: { monthly: 0, annual: 0 },
      description: 'Perfect for individuals',
      features: [
        'Unlimited transcription',
        'Limited AI summaries',
        '800 mins storage per seat',
        'Basic search',
        'Chrome extension',
      ],
      cta: 'Get Started Free',
      href: '/register',
      popular: false,
    },
    {
      name: 'Pro',
      price: { monthly: 18, annual: 10 },
      description: 'For professionals',
      features: [
        'Everything in Free',
        'Unlimited AI summaries',
        '8,000 mins storage',
        'Advanced search',
        'Video recording',
        'Conversation intelligence',
        'CRM integrations',
      ],
      cta: 'Start Pro Trial',
      href: '/register?plan=pro',
      popular: false,
    },
    {
      name: 'Business',
      price: { monthly: 29, annual: 19 },
      description: 'For growing teams',
      features: [
        'Everything in Pro',
        'Unlimited storage',
        'Video playback',
        'Topic tracking',
        'Sentiment analysis',
        'Team analytics',
        'Priority support',
      ],
      cta: 'Start Business Trial',
      href: '/register?plan=business',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: { monthly: 39, annual: 39 },
      description: 'For large organizations',
      features: [
        'Everything in Business',
        'SSO & SCIM',
        'HIPAA compliance',
        'Private cloud storage',
        'Dedicated account manager',
        'Custom integrations',
        'SLA guarantees',
      ],
      cta: 'Contact Sales',
      href: '/register?plan=enterprise',
      popular: false,
    },
  ];

  const featureComparison = [
    { category: 'Usage', features: [
      { name: 'Transcription minutes', free: '800/seat', pro: '8,000/seat', business: 'Unlimited', enterprise: 'Unlimited' },
      { name: 'AI summaries', free: 'Limited', pro: 'Unlimited', business: 'Unlimited', enterprise: 'Unlimited' },
    ]},
    { category: 'Recording & Playback', features: [
      { name: 'Video recording', free: false, pro: true, business: true, enterprise: true },
      { name: 'Audio files upload', free: true, pro: true, business: true, enterprise: true },
    ]},
    { category: 'AI & Notes', features: [
      { name: 'Action items', free: true, pro: true, business: true, enterprise: true },
      { name: 'Custom note templates', free: false, pro: true, business: true, enterprise: true },
      { name: 'AskFred AI', free: 'Limited', pro: 'Full', business: 'Full', enterprise: 'Full' },
    ]},
    { category: 'Analytics', features: [
      { name: 'Speaker analytics', free: false, pro: true, business: true, enterprise: true },
      { name: 'Sentiment analysis', free: false, pro: false, business: true, enterprise: true },
      { name: 'Topic tracking', free: false, pro: false, business: true, enterprise: true },
    ]},
    { category: 'Security', features: [
      { name: 'SOC 2 Type II', free: true, pro: true, business: true, enterprise: true },
      { name: 'GDPR compliant', free: true, pro: true, business: true, enterprise: true },
      { name: 'HIPAA compliant', free: false, pro: false, business: false, enterprise: true },
      { name: 'SSO & SCIM', free: false, pro: false, business: false, enterprise: true },
    ]},
  ];

  return (
    <div className="min-h-screen bg-[#000207]">
      <Navigation />

      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">Simple, transparent pricing</h1>
            <p className="text-xl text-gray-400 mb-8">Choose the perfect plan for your team</p>

            {/* Annual/Monthly Toggle */}
            <div className="flex items-center justify-center gap-4 mb-12">
              <span className={`text-lg ${!isAnnual ? 'text-white font-semibold' : 'text-gray-400'}`}>Monthly</span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className="relative w-16 h-8 bg-[#1a1a1a] rounded-full transition-colors"
              >
                <div className={`absolute top-1 left-1 w-6 h-6 bg-[#7a5af8] rounded-full transition-transform ${isAnnual ? 'translate-x-8' : ''}`}></div>
              </button>
              <span className={`text-lg ${isAnnual ? 'text-white font-semibold' : 'text-gray-400'}`}>
                Annual <span className="text-green-400 text-sm">(Save 44%)</span>
              </span>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative bg-[#0B0D12] border ${tier.popular ? 'border-[#7a5af8]' : 'border-[#1a1a1a]'} rounded-2xl p-8`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#7a5af8] text-white px-4 py-1 rounded-full text-sm font-semibold">
                    MOST POPULAR
                  </div>
                )}
                <h3 className="text-2xl font-bold text-white mb-2">{tier.name}</h3>
                <p className="text-gray-400 mb-6">{tier.description}</p>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-white">${isAnnual ? tier.price.annual : tier.price.monthly}</span>
                  <span className="text-gray-400">/month</span>
                </div>
                <Link
                  href={tier.href}
                  className={`block text-center w-full py-3 rounded-lg font-semibold transition-colors mb-8 ${
                    tier.popular
                      ? 'bg-[#7a5af8] text-white hover:bg-[#6938ef]'
                      : 'bg-[#1a1a1a] text-white hover:bg-[#2a2a2a]'
                  }`}
                >
                  {tier.cta}
                </Link>
                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <Check className="text-green-400 w-5 h-5 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Feature Comparison Table */}
          <div className="bg-[#0B0D12] border border-[#1a1a1a] rounded-2xl overflow-hidden">
            <div className="p-8 border-b border-[#1a1a1a]">
              <h2 className="text-3xl font-bold text-white">Compare all features</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1a1a1a]">
                    <th className="text-left p-4 text-gray-400 font-normal">Feature</th>
                    <th className="p-4 text-white font-semibold">Free</th>
                    <th className="p-4 text-white font-semibold">Pro</th>
                    <th className="p-4 text-white font-semibold">Business</th>
                    <th className="p-4 text-white font-semibold">Enterprise</th>
                  </tr>
                </thead>
                <tbody>
                  {featureComparison.map((section) => (
                    <React.Fragment key={section.category}>
                      <tr>
                        <td colSpan={5} className="p-4 bg-[#0a0a0a] text-[#0e29fc] font-semibold">{section.category}</td>
                      </tr>
                      {section.features.map((feature, idx) => (
                        <tr key={`${section.category}-${idx}`} className="border-b border-[#1a1a1a]">
                          <td className="p-4 text-gray-300">{feature.name}</td>
                          <td className="p-4 text-center">
                            {typeof feature.free === 'boolean' ? (
                              feature.free ? <Check className="text-green-400 w-5 h-5 mx-auto" /> : <X className="text-gray-600 w-5 h-5 mx-auto" />
                            ) : <span className="text-gray-400">{feature.free}</span>}
                          </td>
                          <td className="p-4 text-center">
                            {typeof feature.pro === 'boolean' ? (
                              feature.pro ? <Check className="text-green-400 w-5 h-5 mx-auto" /> : <X className="text-gray-600 w-5 h-5 mx-auto" />
                            ) : <span className="text-gray-400">{feature.pro}</span>}
                          </td>
                          <td className="p-4 text-center">
                            {typeof feature.business === 'boolean' ? (
                              feature.business ? <Check className="text-green-400 w-5 h-5 mx-auto" /> : <X className="text-gray-600 w-5 h-5 mx-auto" />
                            ) : <span className="text-gray-400">{feature.business}</span>}
                          </td>
                          <td className="p-4 text-center">
                            {typeof feature.enterprise === 'boolean' ? (
                              feature.enterprise ? <Check className="text-green-400 w-5 h-5 mx-auto" /> : <X className="text-gray-600 w-5 h-5 mx-auto" />
                            ) : <span className="text-gray-400">{feature.enterprise}</span>}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
