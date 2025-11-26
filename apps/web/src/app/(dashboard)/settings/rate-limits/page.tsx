'use client';

import { useState } from 'react';
import { Shield, Activity, TrendingUp, Clock, AlertTriangle, Settings, BarChart3 } from 'lucide-react';
import { CardGlass } from '@/components/ui/card-glass';
import { Button } from '@/components/ui/button-v2';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

export default function RateLimitsPage() {
  const [globalEnabled, setGlobalEnabled] = useState(true);
  const [perUserEnabled, setPerUserEnabled] = useState(true);
  const [adaptiveEnabled, setAdaptiveEnabled] = useState(false);

  const currentUsage = {
    requests: 45234,
    limit: 100000,
    percentage: 45,
    resetIn: '14h 23m'
  };

  const endpoints = [
    { path: '/api/meetings', requests: 12453, limit: 50000, status: 'healthy' },
    { path: '/api/transcriptions', requests: 8932, limit: 30000, status: 'healthy' },
    { path: '/api/uploads', requests: 23849, limit: 25000, status: 'warning' },
    { path: '/api/users', requests: 567, limit: 10000, status: 'healthy' },
  ];

  const recentBlocks = [
    { ip: '192.168.1.100', reason: 'Rate limit exceeded', endpoint: '/api/uploads', time: '2 minutes ago' },
    { ip: '10.0.0.45', reason: 'Suspicious activity', endpoint: '/api/meetings', time: '15 minutes ago' },
  ];

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-6 w-6 text-teal-400" />
            <h1 className="text-3xl font-bold text-white">Rate Limits</h1>
          </div>
          <p className="text-slate-400">Monitor and configure API rate limits and security settings</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <CardGlass variant="default" hover>
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Current Usage</span>
                <Activity className="w-5 h-5 text-teal-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">{currentUsage.percentage}%</span>
                <span className="text-sm text-slate-500">of limit</span>
              </div>
              <div className="mt-3 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full transition-all"
                  style={{ width: `${currentUsage.percentage}%` }}
                />
              </div>
            </div>
          </CardGlass>

          <CardGlass variant="default" hover>
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Total Requests</span>
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-3xl font-bold text-white">{currentUsage.requests.toLocaleString()}</span>
              <span className="text-sm text-slate-500 mt-2">of {currentUsage.limit.toLocaleString()}</span>
            </div>
          </CardGlass>

          <CardGlass variant="default" hover>
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Reset In</span>
                <Clock className="w-5 h-5 text-cyan-400" />
              </div>
              <span className="text-3xl font-bold text-white">{currentUsage.resetIn}</span>
              <span className="text-sm text-slate-500 mt-2">until next reset</span>
            </div>
          </CardGlass>

          <CardGlass variant="default" hover>
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Blocked Requests</span>
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <span className="text-3xl font-bold text-white">{recentBlocks.length}</span>
              <span className="text-sm text-slate-500 mt-2">in last hour</span>
            </div>
          </CardGlass>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <CardGlass variant="default" hover>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  <h2 className="text-xl font-semibold text-white">Endpoint Usage</h2>
                </div>
                <Button variant="ghost-glass" size="sm">
                  View All
                </Button>
              </div>

              <div className="space-y-4">
                {endpoints.map((endpoint, idx) => {
                  const percentage = (endpoint.requests / endpoint.limit) * 100;
                  const statusColor =
                    endpoint.status === 'healthy' ? 'text-green-400' :
                    endpoint.status === 'warning' ? 'text-amber-400' :
                    'text-rose-400';

                  return (
                    <div key={idx} className="p-4 rounded-xl bg-slate-800/30 border border-white/5 hover:bg-slate-800/50 hover:border-white/10 transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <code className="text-sm font-mono text-teal-300">{endpoint.path}</code>
                          <div className="text-xs text-slate-500 mt-1">
                            {endpoint.requests.toLocaleString()} / {endpoint.limit.toLocaleString()} requests
                          </div>
                        </div>
                        <Badge className={
                          endpoint.status === 'healthy' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                          endpoint.status === 'warning' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                          'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        }>
                          {endpoint.status}
                        </Badge>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            percentage < 70 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                            percentage < 90 ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                            'bg-gradient-to-r from-rose-500 to-red-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>{percentage.toFixed(1)}% used</span>
                        <span>{endpoint.limit - endpoint.requests} remaining</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardGlass>

            <CardGlass variant="default" hover>
              <div className="flex items-center gap-2 mb-6">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <h2 className="text-xl font-semibold text-white">Recent Blocks</h2>
                <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/30">
                  {recentBlocks.length}
                </Badge>
              </div>

              {recentBlocks.length > 0 ? (
                <div className="space-y-3">
                  {recentBlocks.map((block, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 hover:bg-rose-500/20 transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <code className="text-sm font-mono text-rose-300">{block.ip}</code>
                          <div className="text-xs text-slate-400 mt-1">{block.endpoint}</div>
                        </div>
                        <span className="text-xs text-slate-500">{block.time}</span>
                      </div>
                      <div className="text-sm text-slate-300">{block.reason}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Shield className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">No blocked requests in the last hour</p>
                </div>
              )}
            </CardGlass>
          </div>

          <div className="space-y-6">
            <CardGlass variant="default" hover>
              <div className="flex items-center gap-2 mb-6">
                <Settings className="w-5 h-5 text-teal-400" />
                <h2 className="text-xl font-semibold text-white">Configuration</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-white/5">
                  <div>
                    <div className="text-sm font-medium text-slate-200">Global Rate Limiting</div>
                    <div className="text-xs text-slate-500 mt-1">Apply rate limits globally</div>
                  </div>
                  <Switch
                    checked={globalEnabled}
                    onCheckedChange={setGlobalEnabled}
                    className="data-[state=checked]:bg-teal-500"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-white/5">
                  <div>
                    <div className="text-sm font-medium text-slate-200">Per-User Limits</div>
                    <div className="text-xs text-slate-500 mt-1">Individual user rate limits</div>
                  </div>
                  <Switch
                    checked={perUserEnabled}
                    onCheckedChange={setPerUserEnabled}
                    className="data-[state=checked]:bg-purple-500"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-white/5">
                  <div>
                    <div className="text-sm font-medium text-slate-200">Adaptive Limiting</div>
                    <div className="text-xs text-slate-500 mt-1">Adjust limits dynamically</div>
                  </div>
                  <Switch
                    checked={adaptiveEnabled}
                    onCheckedChange={setAdaptiveEnabled}
                    className="data-[state=checked]:bg-cyan-500"
                  />
                </div>

                <div className="pt-4">
                  <Button variant="gradient-primary" size="default" className="w-full">
                    Save Settings
                  </Button>
                </div>
              </div>
            </CardGlass>

            <CardGlass variant="default" hover>
              <div className="flex items-center gap-2 mb-6">
                <Settings className="w-5 h-5 text-purple-400" />
                <h2 className="text-xl font-semibold text-white">Limits</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Global Limit (per hour)
                  </label>
                  <input
                    type="number"
                    defaultValue="100000"
                    className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Per-User Limit (per hour)
                  </label>
                  <input
                    type="number"
                    defaultValue="1000"
                    className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Burst Limit
                  </label>
                  <input
                    type="number"
                    defaultValue="100"
                    className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none transition-all"
                  />
                  <p className="text-xs text-slate-500 mt-2">Maximum requests in a 1-minute window</p>
                </div>
              </div>
            </CardGlass>

            <CardGlass variant="default" className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-amber-500/10">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-semibold text-white">Performance Notice</h3>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Rate limits protect your application from abuse and ensure fair resource allocation. Adjust limits carefully to balance security and usability.
              </p>
            </CardGlass>
          </div>
        </div>
      </div>
    </div>
  );
}
