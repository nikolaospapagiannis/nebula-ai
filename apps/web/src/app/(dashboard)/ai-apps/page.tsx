'use client';

import { Sparkles, Zap, FileText, Mail, Calendar, Target, Brain, MessageSquare, BarChart3, Search } from 'lucide-react';
import { CardGlass, CardGlassContent, CardGlassDescription, CardGlassHeader, CardGlassTitle } from '@/components/ui/card-glass';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function AIAppsPage() {
  const apps = [
    {
      id: 1,
      name: 'Meeting Summarizer',
      description: 'Generate concise summaries of your meetings automatically',
      icon: FileText,
      color: 'blue',
      category: 'Productivity',
      installed: false,
    },
    {
      id: 2,
      name: 'Action Items Tracker',
      description: 'Extract and track action items from meeting transcripts',
      icon: Target,
      color: 'orange',
      category: 'Productivity',
      installed: false,
    },
    {
      id: 3,
      name: 'Email Composer',
      description: 'Draft follow-up emails based on meeting notes',
      icon: Mail,
      color: 'purple',
      category: 'Communication',
      installed: false,
    },
    {
      id: 4,
      name: 'Calendar Scheduler',
      description: 'Smart scheduling assistant for your meetings',
      icon: Calendar,
      color: 'green',
      category: 'Productivity',
      installed: false,
    },
    {
      id: 5,
      name: 'Topic Analyzer',
      description: 'Identify key topics and themes across meetings',
      icon: Brain,
      color: 'pink',
      category: 'Analytics',
      installed: false,
    },
    {
      id: 6,
      name: 'Sentiment Analysis',
      description: 'Analyze the sentiment and tone of conversations',
      icon: MessageSquare,
      color: 'teal',
      category: 'Analytics',
      installed: false,
    },
    {
      id: 7,
      name: 'Insights Generator',
      description: 'Generate actionable insights from meeting data',
      icon: BarChart3,
      color: 'indigo',
      category: 'Analytics',
      installed: false,
    },
    {
      id: 8,
      name: 'Smart Search',
      description: 'AI-powered search across all your transcripts',
      icon: Search,
      color: 'cyan',
      category: 'Productivity',
      installed: false,
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; icon: string; border: string }> = {
      blue: { bg: 'bg-blue-500/20', text: 'text-white', icon: 'text-blue-400', border: 'border-blue-500/30' },
      orange: { bg: 'bg-orange-500/20', text: 'text-white', icon: 'text-orange-400', border: 'border-orange-500/30' },
      purple: { bg: 'bg-purple-500/20', text: 'text-white', icon: 'text-purple-400', border: 'border-purple-500/30' },
      green: { bg: 'bg-green-500/20', text: 'text-white', icon: 'text-green-400', border: 'border-green-500/30' },
      pink: { bg: 'bg-pink-500/20', text: 'text-white', icon: 'text-pink-400', border: 'border-pink-500/30' },
      teal: { bg: 'bg-teal-500/20', text: 'text-white', icon: 'text-teal-400', border: 'border-teal-500/30' },
      indigo: { bg: 'bg-indigo-500/20', text: 'text-white', icon: 'text-indigo-400', border: 'border-indigo-500/30' },
      cyan: { bg: 'bg-cyan-500/20', text: 'text-white', icon: 'text-cyan-400', border: 'border-cyan-500/30' },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-6 w-6 text-purple-400" />
          <h1 className="text-2xl font-bold text-white">AI Apps</h1>
        </div>
        <p className="text-slate-400">
          Enhance your meetings with AI-powered apps and integrations
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search AI apps..."
            className="pl-10 bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500 focus:border-purple-500/50 focus:ring-purple-500/20"
          />
        </div>
      </div>

      {/* Featured Banner */}
      <CardGlass className="mb-6 bg-gradient-to-r from-purple-600/80 to-blue-600/80 border-purple-500/30">
        <div className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-6 w-6 text-white" />
                <h2 className="text-xl font-bold text-white">Unlock AI Superpowers</h2>
              </div>
              <p className="text-purple-100 mb-4">
                Get unlimited access to all AI apps with Pro
              </p>
              <Button className="bg-white text-purple-600 hover:bg-purple-50">
                Upgrade to Pro
              </Button>
            </div>
            <div className="text-6xl opacity-20">
              <Sparkles className="h-24 w-24 text-white" />
            </div>
          </div>
        </div>
      </CardGlass>

      {/* Apps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apps.map((app) => {
          const Icon = app.icon;
          const colors = getColorClasses(app.color);

          return (
            <CardGlass
              key={app.id}
              hover
              padding="none"
              className="group"
            >
              <CardGlassHeader className="p-6 pb-4 border-b-0">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-12 h-12 ${colors.bg} ${colors.border} border rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110`}>
                    <Icon className={`h-6 w-6 ${colors.icon}`} />
                  </div>
                  <span className="text-xs px-3 py-1 bg-slate-800/60 text-slate-300 rounded-full border border-white/10">
                    {app.category}
                  </span>
                </div>
                <CardGlassTitle className="text-lg text-white">{app.name}</CardGlassTitle>
                <CardGlassDescription className="text-slate-400">{app.description}</CardGlassDescription>
              </CardGlassHeader>
              <CardGlassContent className="p-6 pt-0">
                {app.installed ? (
                  <Button
                    variant="outline"
                    className="w-full border-green-500/30 text-green-400 hover:bg-green-500/10 hover:border-green-500/50"
                  >
                    Installed
                  </Button>
                ) : (
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white border-0">
                    Install App
                  </Button>
                )}
              </CardGlassContent>
            </CardGlass>
          );
        })}
      </div>

      {/* Coming Soon */}
      <CardGlass className="mt-6 border-dashed border-slate-700">
        <div className="p-8 text-center">
          <Sparkles className="h-12 w-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">More Apps Coming Soon</h3>
          <p className="text-slate-400">
            We are constantly building new AI-powered tools to enhance your meetings
          </p>
        </div>
      </CardGlass>
    </div>
  );
}
