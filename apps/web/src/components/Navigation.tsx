'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, ChevronDown, Sparkles, Zap, Users, Briefcase, Code, Video, Calendar, MessageSquare } from 'lucide-react';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#000211]/95 blur-backdrop border-b border-[#1e293b]">
      <div className="container-ff">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#7a5af8] to-[#9945ff] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <span className="text-lg font-semibold text-white">Fireflies.ai</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <MegaMenuItem
              title="Product"
              isActive={activeMenu === 'product'}
              onMouseEnter={() => setActiveMenu('product')}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <ProductMenu />
            </MegaMenuItem>

            <MegaMenuItem
              title="Solutions"
              isActive={activeMenu === 'solutions'}
              onMouseEnter={() => setActiveMenu('solutions')}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <SolutionsMenu />
            </MegaMenuItem>

            <MegaMenuItem
              title="Integration"
              isActive={activeMenu === 'integration'}
              onMouseEnter={() => setActiveMenu('integration')}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <IntegrationMenu />
            </MegaMenuItem>

            <MegaMenuItem
              title="Resources"
              isActive={activeMenu === 'resources'}
              onMouseEnter={() => setActiveMenu('resources')}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <ResourcesMenu />
            </MegaMenuItem>

            <Link href="/pricing" className="paragraph-s text-[#cbd5e1] hover:text-white transition-colors">
              Pricing
            </Link>
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/login" className="paragraph-s text-[#cbd5e1] hover:text-white transition-colors font-medium px-4 py-2">
              Login
            </Link>
            <Link href="/register" className="button-dark button-small">
              Request Demo
            </Link>
            <Link href="/register" className="button-primary button-small">
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-white p-2"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-[#0a0a1a] border-t border-[#1e293b]">
          <div className="container-ff py-4 space-y-3">
            <Link href="/product" className="block paragraph-m text-[#cbd5e1] hover:text-white py-2">Product</Link>
            <Link href="/solutions" className="block paragraph-m text-[#cbd5e1] hover:text-white py-2">Solutions</Link>
            <Link href="/integration" className="block paragraph-m text-[#cbd5e1] hover:text-white py-2">Integration</Link>
            <Link href="/resources" className="block paragraph-m text-[#cbd5e1] hover:text-white py-2">Resources</Link>
            <Link href="/pricing" className="block paragraph-m text-[#cbd5e1] hover:text-white py-2">Pricing</Link>
            <div className="pt-4 border-t border-[#1e293b] space-y-3">
              <Link href="/login" className="block text-center button-dark w-full">Login</Link>
              <Link href="/register" className="block text-center button-primary w-full">Get Started</Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

function MegaMenuItem({
  title,
  children,
  isActive,
  onMouseEnter,
  onMouseLeave
}: {
  title: string;
  children: React.ReactNode;
  isActive: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  return (
    <>
      <div
        className="relative"
        onMouseEnter={onMouseEnter}
      >
        <button className="flex items-center gap-1 paragraph-s text-[#cbd5e1] hover:text-white transition-colors">
          <span>{title}</span>
          <ChevronDown size={14} className={`transform transition-transform ${isActive ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isActive && (
        <div
          className="megamenu active"
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
        >
          <div className="container-ff">
            {children}
          </div>
        </div>
      )}
    </>
  );
}

function ProductMenu() {
  return (
    <div className="grid grid-cols-2 gap-12">
      <div className="space-y-2">
        <MenuItem icon={<Zap size={16} />} title="Features" href="/features" />
        <MenuItem icon={<Sparkles size={16} />} title="Live Assist" badge="NEW" href="/live-assist" />
        <MenuItem icon={<Code size={16} />} title="Desktop App" badge="NEW" href="/desktop" />
        <MenuItem icon={<Briefcase size={16} />} title="Fireflies AI Apps" href="/apps" />
        <MenuItem icon={<Users size={16} />} title="Mobile App" href="/mobile" />
        <MenuItem icon={<Video size={16} />} title="Chrome extension" href="/chrome" />
        <MenuItem icon={<Calendar size={16} />} title="API" href="/api" />
      </div>
      <div className="card-ff">
        <div className="mb-3">
          <span className="megamenu-badge">NEW</span>
        </div>
        <h3 className="heading-s text-white mb-2">Live Assist</h3>
        <p className="paragraph-s mb-4">Get live meeting assistance and real-time insights during your calls</p>
        <Link href="/live-assist" className="paragraph-s text-[#7a5af8] hover:text-[#9945ff] font-medium">
          Learn more →
        </Link>
      </div>
    </div>
  );
}

function SolutionsMenu() {
  return (
    <div className="grid grid-cols-3 gap-8">
      <div className="space-y-2">
        <MenuItem icon={<Briefcase size={16} />} title="Sales" href="/solutions/sales" />
        <MenuItem icon={<Users size={16} />} title="Recruiting" href="/solutions/recruiting" />
        <MenuItem icon={<MessageSquare size={16} />} title="Marketing" href="/solutions/marketing" />
        <MenuItem icon={<Zap size={16} />} title="Product & Research" href="/solutions/product" />
      </div>
      <div className="space-y-2">
        <MenuItem icon={<Code size={16} />} title="Engineering" href="/solutions/engineering" />
        <MenuItem icon={<Briefcase size={16} />} title="Venture Capital" href="/solutions/vc" />
        <MenuItem icon={<Calendar size={16} />} title="Finance" href="/solutions/finance" />
        <MenuItem icon={<Users size={16} />} title="Healthcare" href="/solutions/healthcare" />
      </div>
      <div className="card-ff">
        <h3 className="heading-s text-white mb-2">Success Stories</h3>
        <p className="paragraph-s mb-4">See how teams save 15+ hours per week with Fireflies</p>
        <Link href="/customers" className="paragraph-s text-[#7a5af8] hover:text-[#9945ff] font-medium">
          Read stories →
        </Link>
      </div>
    </div>
  );
}

function IntegrationMenu() {
  return (
    <div className="grid grid-cols-3 gap-8">
      <div className="space-y-2">
        <MenuItem icon={<Video size={16} />} title="Video conferencing" href="/integrations/video" />
        <MenuItem icon={<Calendar size={16} />} title="Calendar" href="/integrations/calendar" />
        <MenuItem icon={<Briefcase size={16} />} title="CRM" href="/integrations/crm" />
        <MenuItem icon={<Code size={16} />} title="Project management" href="/integrations/pm" />
      </div>
      <div className="space-y-2">
        <MenuItem icon={<MessageSquare size={16} />} title="Collaboration" href="/integrations/collaboration" />
        <MenuItem icon={<Users size={16} />} title="Dialers" href="/integrations/dialers" />
        <MenuItem icon={<Zap size={16} />} title="Storage" href="/integrations/storage" />
        <MenuItem icon={<Sparkles size={16} />} title="Zapier & API" href="/integrations/zapier" />
      </div>
      <div className="card-ff">
        <h3 className="heading-s text-white mb-2">60+ Integrations</h3>
        <p className="paragraph-s mb-4">Connect Fireflies with your favorite tools</p>
        <Link href="/integrations" className="paragraph-s text-[#7a5af8] hover:text-[#9945ff] font-medium">
          View all →
        </Link>
      </div>
    </div>
  );
}

function ResourcesMenu() {
  return (
    <div className="grid grid-cols-3 gap-8">
      <div className="space-y-2">
        <MenuItem title="Blog" href="/blog" />
        <MenuItem title="Help Center" href="/help" />
        <MenuItem title="Customer Stories" href="/customers" />
        <MenuItem title="Fireflies University" href="/university" />
      </div>
      <div className="space-y-2">
        <MenuItem title="Security & Privacy" href="/security" />
        <MenuItem title="Partnerships" href="/partnerships" />
        <MenuItem title="Webinars" href="/webinars" />
        <MenuItem title="Status" href="/status" />
      </div>
      <div className="card-ff">
        <h3 className="heading-s text-white mb-2">AI Meeting Guide</h3>
        <p className="paragraph-s mb-4">Complete guide to responsible AI meeting assistants</p>
        <Link href="/guide" className="paragraph-s text-[#7a5af8] hover:text-[#9945ff] font-medium">
          Download free →
        </Link>
      </div>
    </div>
  );
}

function MenuItem({
  icon,
  title,
  href,
  badge
}: {
  icon?: React.ReactNode;
  title: string;
  href: string;
  badge?: string;
}) {
  return (
    <Link href={href} className="megamenu-item">
      {icon && <span className="text-[#7a5af8]">{icon}</span>}
      <span>{title}</span>
      {badge && <span className="megamenu-badge">{badge}</span>}
    </Link>
  );
}
