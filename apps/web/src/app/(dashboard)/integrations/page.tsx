'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Video,
  MessageSquare,
  Database,
  Settings,
  Check,
  X,
  Link2,
  Loader2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { CardGlass, CardGlassContent, CardGlassDescription, CardGlassHeader, CardGlassTitle } from '@/components/ui/card-glass';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/api';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'video' | 'calendar' | 'crm' | 'communication' | 'productivity';
  icon: any;
  connected: boolean;
  lastSync?: string;
  accountInfo?: {
    email?: string;
    name?: string;
  };
  features: string[];
  setupTime: string;
}

const integrations: Integration[] = [
  {
    id: 'zoom',
    name: 'Zoom',
    description: 'Automatically record and transcribe Zoom meetings',
    category: 'video',
    icon: Video,
    connected: false,
    features: ['Auto-join meetings', 'Real-time transcription', 'Cloud recording', 'Speaker identification'],
    setupTime: '2 minutes',
  },
  {
    id: 'teams',
    name: 'Microsoft Teams',
    description: 'Integrate with Microsoft Teams for seamless meeting capture',
    category: 'video',
    icon: Video,
    connected: false,
    features: ['Bot integration', 'Channel notifications', 'File sync', 'Calendar sync'],
    setupTime: '5 minutes',
  },
  {
    id: 'google-meet',
    name: 'Google Meet',
    description: 'Record and analyze Google Meet conversations',
    category: 'video',
    icon: Video,
    connected: false,
    features: ['Chrome extension', 'Drive integration', 'Auto-transcription', 'Calendar sync'],
    setupTime: '3 minutes',
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Sync your calendar for automatic meeting detection',
    category: 'calendar',
    icon: Calendar,
    connected: true,
    lastSync: '2025-01-10T10:30:00',
    accountInfo: { email: 'user@gmail.com' },
    features: ['Auto-detection', 'Meeting reminders', 'Attendee sync', 'Recurring events'],
    setupTime: '1 minute',
  },
  {
    id: 'outlook',
    name: 'Outlook Calendar',
    description: 'Connect your Outlook calendar for meeting scheduling',
    category: 'calendar',
    icon: Calendar,
    connected: false,
    features: ['Exchange sync', 'Meeting rooms', 'Attendee availability', 'Event updates'],
    setupTime: '2 minutes',
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    description: 'Sync meeting insights with your CRM',
    category: 'crm',
    icon: Database,
    connected: true,
    lastSync: '2025-01-10T09:15:00',
    accountInfo: { name: 'Acme Corp' },
    features: ['Contact sync', 'Deal tracking', 'Activity logging', 'Custom fields'],
    setupTime: '10 minutes',
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'Automatically log meetings and insights in HubSpot',
    category: 'crm',
    icon: Database,
    connected: false,
    features: ['Contact enrichment', 'Deal association', 'Timeline events', 'Custom properties'],
    setupTime: '5 minutes',
  },
  {
    id: 'slack',
    name: 'Slack',
    description: 'Share meeting summaries and action items in Slack',
    category: 'communication',
    icon: MessageSquare,
    connected: true,
    lastSync: '2025-01-10T11:00:00',
    accountInfo: { name: 'Acme Workspace' },
    features: ['Channel notifications', 'DM summaries', 'Bot commands', 'Thread replies'],
    setupTime: '2 minutes',
  },
  {
    id: 'notion',
    name: 'Notion',
    description: 'Export meeting notes and action items to Notion',
    category: 'productivity',
    icon: Database,
    connected: false,
    features: ['Page creation', 'Database sync', 'Template support', 'Rich formatting'],
    setupTime: '3 minutes',
  },
];

export default function IntegrationsPage() {
  const router = useRouter();
  const { user: _user } = useAuth();
  const [filter, setFilter] = useState<string>('all');
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const [integrationsList, setIntegrationsList] = useState(integrations);

  const categories = [
    { id: 'all', name: 'All Integrations', count: integrationsList.length },
    { id: 'video', name: 'Video Conferencing', count: integrationsList.filter(i => i.category === 'video').length },
    { id: 'calendar', name: 'Calendar', count: integrationsList.filter(i => i.category === 'calendar').length },
    { id: 'crm', name: 'CRM', count: integrationsList.filter(i => i.category === 'crm').length },
    { id: 'communication', name: 'Communication', count: integrationsList.filter(i => i.category === 'communication').length },
    { id: 'productivity', name: 'Productivity', count: integrationsList.filter(i => i.category === 'productivity').length },
  ];

  const filteredIntegrations = filter === 'all'
    ? integrationsList
    : integrationsList.filter(i => i.category === filter);

  const handleConnect = async (integrationId: string) => {
    setIsConnecting(integrationId);
    try {
      // Simulate OAuth flow
      await new Promise(resolve => setTimeout(resolve, 2000));

      setIntegrationsList(prev => prev.map(integration =>
        integration.id === integrationId
          ? { ...integration, connected: true, lastSync: new Date().toISOString() }
          : integration
      ));

      // Show success toast
    } catch (error) {
      console.error('Failed to connect integration:', error);
      // Show error toast
    } finally {
      setIsConnecting(null);
    }
  };

  const handleDisconnect = async (integrationId: string) => {
    if (!confirm('Are you sure you want to disconnect this integration?')) {
      return;
    }

    try {
      await apiClient.disconnectIntegration(integrationId);

      setIntegrationsList(prev => prev.map(integration =>
        integration.id === integrationId
          ? { ...integration, connected: false, lastSync: undefined, accountInfo: undefined }
          : integration
      ));

      // Show success toast
    } catch (error) {
      console.error('Failed to disconnect integration:', error);
      // Show error toast
    }
  };

  const connectedCount = integrationsList.filter(i => i.connected).length;

  return (
    <div className="min-h-screen bg-[#0a0a1a]">
      {/* Header */}
      <header className="bg-slate-900/40 backdrop-blur-sm border-b border-[#1e293b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-slate-400 hover:text-white flex items-center transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Dashboard
              </button>
              <h1 className="text-xl font-semibold text-white">Integrations</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-400">
                {connectedCount} of {integrationsList.length} connected
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <CardGlass padding="none">
            <div className="p-6">
              <p className="text-sm font-medium text-slate-400 mb-2">Connected</p>
              <div className="text-2xl font-bold text-white">{connectedCount}</div>
              <p className="text-xs text-slate-500 mt-1">Active integrations</p>
            </div>
          </CardGlass>

          <CardGlass padding="none">
            <div className="p-6">
              <p className="text-sm font-medium text-slate-400 mb-2">Last Sync</p>
              <div className="text-2xl font-bold text-white">2m ago</div>
              <p className="text-xs text-green-400 mt-1">All systems operational</p>
            </div>
          </CardGlass>

          <CardGlass padding="none">
            <div className="p-6">
              <p className="text-sm font-medium text-slate-400 mb-2">Data Synced</p>
              <div className="text-2xl font-bold text-white">45.2K</div>
              <p className="text-xs text-slate-500 mt-1">Records this month</p>
            </div>
          </CardGlass>

          <CardGlass padding="none">
            <div className="p-6">
              <p className="text-sm font-medium text-slate-400 mb-2">API Calls</p>
              <div className="text-2xl font-bold text-white">128K</div>
              <p className="text-xs text-slate-500 mt-1">This month</p>
            </div>
          </CardGlass>
        </div>

        {/* Category Filter */}
        <div className="mb-6">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setFilter(category.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 border ${
                  filter === category.id
                    ? 'bg-purple-600 text-white border-purple-500'
                    : 'bg-slate-900/50 text-slate-300 border-white/10 hover:bg-slate-800/50 hover:border-white/20'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIntegrations.map((integration) => {
            const Icon = integration.icon;
            return (
              <CardGlass
                key={integration.id}
                hover
                padding="none"
                className={integration.connected ? 'border-green-500/30' : ''}
              >
                <CardGlassHeader className="p-6 pb-4 border-b-0">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-slate-800/60 rounded-lg border border-white/10">
                        <Icon className="h-6 w-6 text-slate-300" />
                      </div>
                      <div>
                        <CardGlassTitle className="text-lg text-white">{integration.name}</CardGlassTitle>
                        {integration.connected && (
                          <div className="flex items-center mt-1">
                            <Check className="h-3 w-3 text-green-400 mr-1" />
                            <span className="text-xs text-green-400">Connected</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {integration.connected && (
                      <button
                        onClick={() => handleDisconnect(integration.id)}
                        className="text-slate-500 hover:text-red-400 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </CardGlassHeader>
                <CardGlassContent className="p-6 pt-0">
                  <CardGlassDescription className="mb-4 text-slate-400">
                    {integration.description}
                  </CardGlassDescription>

                  {integration.connected && integration.accountInfo && (
                    <div className="mb-4 p-3 bg-slate-800/40 rounded-lg border border-white/5">
                      <p className="text-sm text-slate-300">
                        {integration.accountInfo.email || integration.accountInfo.name}
                      </p>
                      {integration.lastSync && (
                        <p className="text-xs text-slate-500 mt-1">
                          Last synced: {new Date(integration.lastSync).toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="mb-4">
                    <p className="text-xs font-medium text-slate-400 mb-2">Features:</p>
                    <div className="space-y-1">
                      {integration.features.slice(0, 3).map((feature, index) => (
                        <div key={index} className="flex items-center text-xs text-slate-400">
                          <Check className="h-3 w-3 text-teal-400 mr-1" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      Setup time: {integration.setupTime}
                    </span>
                    {integration.connected ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/integrations/${integration.id}/settings`)}
                        className="border-white/10 text-slate-300 hover:bg-slate-800/50 hover:border-white/20"
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        Configure
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleConnect(integration.id)}
                        disabled={isConnecting === integration.id}
                        className="bg-purple-600 hover:bg-purple-700 text-white border-0"
                      >
                        {isConnecting === integration.id ? (
                          <>
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <Link2 className="h-3 w-3 mr-1" />
                            Connect
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardGlassContent>
              </CardGlass>
            );
          })}
        </div>

        {/* Help Section */}
        <CardGlass className="mt-8 bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-purple-500/20">
          <div className="p-6">
            <h3 className="flex items-center text-white font-semibold mb-2">
              <AlertCircle className="h-5 w-5 mr-2 text-purple-400" />
              Need Help?
            </h3>
            <p className="text-sm text-slate-300 mb-4">
              Having trouble connecting an integration? Check out our documentation or contact support.
            </p>
            <div className="flex space-x-4">
              <Button
                variant="outline"
                size="sm"
                className="border-white/10 text-slate-300 hover:bg-slate-800/50 hover:border-white/20"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Documentation
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-white/10 text-slate-300 hover:bg-slate-800/50 hover:border-white/20"
              >
                Contact Support
              </Button>
            </div>
          </div>
        </CardGlass>
      </main>
    </div>
  );
}
