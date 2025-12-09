'use client';

import { useState, useMemo } from 'react';
import {
  Search, Star, Download, TrendingUp, Shield, Clock, Users,
  FileText, Mail, Calendar, Target, Brain, MessageSquare,
  BarChart3, Zap, Code, Bot, Sparkles, PenTool, Database
} from 'lucide-react';
import { CardGlass, CardGlassContent, CardGlassDescription, CardGlassHeader, CardGlassTitle } from '@/components/ui/card-glass';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export type AIApp = {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  icon: any;
  color: string;
  category: string;
  tags: string[];
  rating: number;
  downloads: number;
  installed: boolean;
  enabled: boolean;
  isPremium?: boolean;
  isNew?: boolean;
  isTrending?: boolean;
  author: string;
  version: string;
  updatedAt: string;
  features?: string[];
  requirements?: string[];
  outputFormats?: string[];
  customizable?: boolean;
};

const marketplaceApps: AIApp[] = [
  {
    id: 'meeting-summarizer',
    name: 'Meeting Summarizer',
    description: 'Generate concise summaries of your meetings automatically',
    longDescription: 'Advanced AI-powered meeting summarizer that creates structured summaries with key points, action items, and decisions made during meetings.',
    icon: FileText,
    color: 'blue',
    category: 'Productivity',
    tags: ['summary', 'notes', 'documentation'],
    rating: 4.8,
    downloads: 12500,
    installed: false,
    enabled: false,
    isNew: false,
    author: 'Nebula AI',
    version: '2.1.0',
    updatedAt: '2024-01-15',
    features: ['Auto-formatting', 'Key points extraction', 'Action items', 'Decision tracking'],
    outputFormats: ['Markdown', 'PDF', 'Docx'],
    customizable: true
  },
  {
    id: 'action-tracker',
    name: 'Action Items Tracker',
    description: 'Extract and track action items from meeting transcripts',
    icon: Target,
    color: 'orange',
    category: 'Productivity',
    tags: ['tasks', 'tracking', 'follow-up'],
    rating: 4.7,
    downloads: 8900,
    installed: false,
    enabled: false,
    isTrending: true,
    author: 'Nebula AI',
    version: '1.8.2',
    updatedAt: '2024-01-10',
    features: ['Automatic assignment', 'Due date detection', 'Priority levels', 'Integration with task managers'],
    requirements: ['Meeting transcription enabled'],
    customizable: true
  },
  {
    id: 'email-composer',
    name: 'Smart Email Composer',
    description: 'Draft follow-up emails based on meeting notes',
    icon: Mail,
    color: 'purple',
    category: 'Communication',
    tags: ['email', 'follow-up', 'automation'],
    rating: 4.6,
    downloads: 7200,
    installed: false,
    enabled: false,
    isPremium: true,
    author: 'Nebula AI',
    version: '3.0.1',
    updatedAt: '2024-01-20',
    features: ['Multiple templates', 'Personalization', 'Attachment suggestions', 'Send scheduling'],
    outputFormats: ['HTML', 'Plain text'],
    customizable: true
  },
  {
    id: 'calendar-scheduler',
    name: 'Calendar Scheduler',
    description: 'Smart scheduling assistant for your meetings',
    icon: Calendar,
    color: 'green',
    category: 'Productivity',
    tags: ['scheduling', 'calendar', 'availability'],
    rating: 4.9,
    downloads: 15300,
    installed: true,
    enabled: true,
    author: 'Nebula AI',
    version: '2.5.0',
    updatedAt: '2024-01-18',
    features: ['Conflict detection', 'Time zone handling', 'Buffer time management', 'Recurring meetings'],
    requirements: ['Calendar integration'],
    customizable: false
  },
  {
    id: 'topic-analyzer',
    name: 'Topic Analyzer',
    description: 'Identify key topics and themes across meetings',
    icon: Brain,
    color: 'pink',
    category: 'Analytics',
    tags: ['analysis', 'topics', 'themes', 'insights'],
    rating: 4.5,
    downloads: 5600,
    installed: false,
    enabled: false,
    isNew: true,
    author: 'Nebula AI',
    version: '1.0.0',
    updatedAt: '2024-01-22',
    features: ['Topic clustering', 'Trend analysis', 'Word clouds', 'Cross-meeting insights'],
    outputFormats: ['JSON', 'CSV', 'Charts'],
    customizable: true
  },
  {
    id: 'sentiment-analysis',
    name: 'Sentiment Analysis',
    description: 'Analyze the sentiment and tone of conversations',
    icon: MessageSquare,
    color: 'teal',
    category: 'Analytics',
    tags: ['sentiment', 'emotion', 'tone', 'analysis'],
    rating: 4.4,
    downloads: 6800,
    installed: false,
    enabled: false,
    isPremium: true,
    author: 'Nebula AI',
    version: '1.5.3',
    updatedAt: '2024-01-12',
    features: ['Real-time analysis', 'Speaker-level sentiment', 'Emotion detection', 'Trend tracking'],
    customizable: false
  },
  {
    id: 'insights-generator',
    name: 'Insights Generator',
    description: 'Generate actionable insights from meeting data',
    icon: BarChart3,
    color: 'indigo',
    category: 'Analytics',
    tags: ['insights', 'recommendations', 'analysis'],
    rating: 4.7,
    downloads: 9100,
    installed: false,
    enabled: false,
    author: 'Nebula AI',
    version: '2.2.1',
    updatedAt: '2024-01-19',
    features: ['Pattern recognition', 'Recommendation engine', 'Performance metrics', 'Goal tracking'],
    outputFormats: ['Dashboard', 'Report', 'Email digest'],
    customizable: true
  },
  {
    id: 'smart-search',
    name: 'Smart Search',
    description: 'AI-powered search across all your transcripts',
    icon: Search,
    color: 'cyan',
    category: 'Productivity',
    tags: ['search', 'query', 'find', 'discover'],
    rating: 4.8,
    downloads: 11200,
    installed: true,
    enabled: false,
    author: 'Nebula AI',
    version: '2.8.0',
    updatedAt: '2024-01-21',
    features: ['Semantic search', 'Natural language queries', 'Filters', 'Search history'],
    customizable: false
  },
  {
    id: 'code-snippet-extractor',
    name: 'Code Snippet Extractor',
    description: 'Automatically extract and format code snippets from technical meetings',
    icon: Code,
    color: 'amber',
    category: 'Development',
    tags: ['code', 'development', 'snippets', 'technical'],
    rating: 4.6,
    downloads: 3400,
    installed: false,
    enabled: false,
    isNew: true,
    author: 'Developer Tools Inc',
    version: '1.1.0',
    updatedAt: '2024-01-23',
    features: ['Syntax highlighting', 'Language detection', 'Git integration', 'Code formatting'],
    outputFormats: ['Markdown', 'Gist', 'Repository'],
    customizable: true
  },
  {
    id: 'ai-coach',
    name: 'AI Meeting Coach',
    description: 'Get real-time coaching and feedback on your meeting performance',
    icon: Bot,
    color: 'violet',
    category: 'Coaching',
    tags: ['coaching', 'feedback', 'improvement', 'performance'],
    rating: 4.9,
    downloads: 8700,
    installed: false,
    enabled: false,
    isPremium: true,
    isTrending: true,
    author: 'Nebula AI',
    version: '3.1.0',
    updatedAt: '2024-01-24',
    features: ['Real-time feedback', 'Speaking metrics', 'Engagement scoring', 'Improvement tips'],
    requirements: ['Video recording enabled'],
    customizable: true
  },
  {
    id: 'transcript-editor',
    name: 'Smart Transcript Editor',
    description: 'AI-assisted editing and correction of meeting transcripts',
    icon: PenTool,
    color: 'rose',
    category: 'Productivity',
    tags: ['editing', 'transcription', 'correction', 'formatting'],
    rating: 4.5,
    downloads: 5900,
    installed: false,
    enabled: false,
    author: 'Nebula AI',
    version: '1.6.2',
    updatedAt: '2024-01-16',
    features: ['Auto-correction', 'Speaker identification', 'Punctuation', 'Formatting'],
    customizable: false
  },
  {
    id: 'knowledge-base',
    name: 'Knowledge Base Builder',
    description: 'Automatically build a searchable knowledge base from meetings',
    icon: Database,
    color: 'emerald',
    category: 'Knowledge',
    tags: ['knowledge', 'documentation', 'wiki', 'database'],
    rating: 4.7,
    downloads: 4200,
    installed: false,
    enabled: false,
    isPremium: true,
    isNew: true,
    author: 'Knowledge Systems',
    version: '1.0.2',
    updatedAt: '2024-01-25',
    features: ['Auto-categorization', 'Tag generation', 'Cross-referencing', 'Version control'],
    outputFormats: ['Wiki', 'Notion', 'Confluence'],
    customizable: true
  }
];

interface AppMarketplaceProps {
  onInstallApp?: (app: AIApp) => void;
  onConfigureApp?: (app: AIApp) => void;
  installedApps?: string[];
}

export default function AppMarketplace({ onInstallApp, onConfigureApp, installedApps = [] }: AppMarketplaceProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [activeTab, setActiveTab] = useState('all');

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'Productivity', label: 'Productivity' },
    { value: 'Analytics', label: 'Analytics' },
    { value: 'Communication', label: 'Communication' },
    { value: 'Development', label: 'Development' },
    { value: 'Coaching', label: 'Coaching' },
    { value: 'Knowledge', label: 'Knowledge' }
  ];

  const filteredApps = useMemo(() => {
    let apps = [...marketplaceApps];

    // Filter by tab
    if (activeTab === 'installed') {
      apps = apps.filter(app => installedApps.includes(app.id) || app.installed);
    } else if (activeTab === 'trending') {
      apps = apps.filter(app => app.isTrending);
    } else if (activeTab === 'new') {
      apps = apps.filter(app => app.isNew);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      apps = apps.filter(app =>
        app.name.toLowerCase().includes(query) ||
        app.description.toLowerCase().includes(query) ||
        app.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      apps = apps.filter(app => app.category === selectedCategory);
    }

    // Sort
    switch (sortBy) {
      case 'popular':
        apps.sort((a, b) => b.downloads - a.downloads);
        break;
      case 'rating':
        apps.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        apps.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
      case 'name':
        apps.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return apps;
  }, [searchQuery, selectedCategory, sortBy, activeTab, installedApps]);

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
      amber: { bg: 'bg-amber-500/20', text: 'text-white', icon: 'text-amber-400', border: 'border-amber-500/30' },
      violet: { bg: 'bg-violet-500/20', text: 'text-white', icon: 'text-violet-400', border: 'border-violet-500/30' },
      rose: { bg: 'bg-rose-500/20', text: 'text-white', icon: 'text-rose-400', border: 'border-rose-500/30' },
      emerald: { bg: 'bg-emerald-500/20', text: 'text-white', icon: 'text-emerald-400', border: 'border-emerald-500/30' },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">AI Apps Marketplace</h2>
            <p className="text-sm text-slate-400">Discover and install AI-powered apps to enhance your meetings</p>
          </div>
          <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
            {marketplaceApps.length} Apps Available
          </Badge>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search apps by name, category, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-slate-900/50 border-white/10 text-white placeholder:text-slate-500"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[180px] bg-slate-900/50 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[140px] bg-slate-900/50 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="name">Name (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-900/50 border border-white/10">
          <TabsTrigger value="all">All Apps</TabsTrigger>
          <TabsTrigger value="installed">Installed</TabsTrigger>
          <TabsTrigger value="trending">
            <TrendingUp className="h-4 w-4 mr-1" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="new">
            <Sparkles className="h-4 w-4 mr-1" />
            New
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {/* Apps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApps.map((app) => {
              const Icon = app.icon;
              const colors = getColorClasses(app.color);
              const isInstalled = installedApps.includes(app.id) || app.installed;

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
                      <div className="flex items-center gap-2">
                        {app.isPremium && (
                          <Badge className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-400 border-amber-500/30 text-xs">
                            <Zap className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        )}
                        {app.isNew && (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                            New
                          </Badge>
                        )}
                        {app.isTrending && (
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-xs">
                            <TrendingUp className="h-3 w-3" />
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardGlassTitle className="text-lg text-white flex items-center gap-2">
                      {app.name}
                      {app.customizable && (
                        <Shield className="h-4 w-4 text-slate-500" title="Customizable" />
                      )}
                    </CardGlassTitle>
                    <CardGlassDescription className="text-slate-400">{app.description}</CardGlassDescription>

                    {/* Stats */}
                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        <span>{app.rating}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        <span>{app.downloads.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>v{app.version}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mt-3">
                      {app.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs border-white/10 text-slate-400">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardGlassHeader>
                  <CardGlassContent className="p-6 pt-0">
                    <div className="flex gap-2">
                      {isInstalled ? (
                        <>
                          <Button
                            variant="outline"
                            className="flex-1 border-green-500/30 text-green-400 hover:bg-green-500/10"
                            onClick={() => onConfigureApp?.(app)}
                          >
                            Configure
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-400 hover:text-red-400"
                          >
                            Uninstall
                          </Button>
                        </>
                      ) : (
                        <Button
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white border-0"
                          onClick={() => onInstallApp?.(app)}
                        >
                          Install App
                        </Button>
                      )}
                    </div>
                  </CardGlassContent>
                </CardGlass>
              );
            })}
          </div>

          {filteredApps.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 text-slate-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No apps found</h3>
              <p className="text-slate-400">Try adjusting your search or filters</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}