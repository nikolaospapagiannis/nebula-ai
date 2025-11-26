'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  User, Bell, Lock, CreditCard, Users, Zap, Globe,
  Shield, Mail, ChevronRight, Video, AlertTriangle, Check
} from 'lucide-react';
import { CardGlass } from '@/components/ui/card-glass';
import { Button } from '@/components/ui/button-v2';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

export default function SettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [desktopNotifications, setDesktopNotifications] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [autoRecord, setAutoRecord] = useState(true);
  const [transcriptionEnabled, setTranscriptionEnabled] = useState(true);

  const settingsSections = [
    {
      title: 'Team Management',
      description: 'Invite and manage team members',
      icon: Users,
      href: '/settings/team',
      color: 'teal',
    },
    {
      title: 'Rate Limits',
      description: 'Configure API rate limits and quotas',
      icon: Shield,
      href: '/settings/rate-limits',
      color: 'purple',
    },
    {
      title: 'SSO Configuration',
      description: 'Set up single sign-on for your organization',
      icon: Mail,
      href: '/settings/sso',
      color: 'cyan',
    },
    {
      title: 'Integrations',
      description: 'Connect third-party apps and services',
      icon: Zap,
      href: '/integrations',
      color: 'pink',
    },
  ];

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-slate-400">Manage your account preferences and configuration</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {settingsSections.map((section) => {
            const Icon = section.icon;
            return (
              <Link key={section.title} href={section.href}>
                <CardGlass variant="default" hover className="h-full">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-${section.color}-500 to-${section.color}-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-${section.color}-500/20`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-1">{section.title}</h3>
                        <p className="text-sm text-slate-400">{section.description}</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-500 flex-shrink-0" />
                  </div>
                </CardGlass>
              </Link>
            );
          })}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <CardGlass variant="default" hover className="h-full">
              <div className="flex items-center gap-2 mb-6">
                <User className="w-5 h-5 text-teal-400" />
                <h2 className="text-xl font-semibold text-white">Profile Information</h2>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 outline-none transition-all"
                      placeholder="John Doe"
                      defaultValue="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 outline-none transition-all"
                      placeholder="john@company.com"
                      defaultValue="john@company.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Job Title
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 outline-none transition-all"
                    placeholder="Product Manager"
                    defaultValue="Product Manager"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 outline-none transition-all"
                    placeholder="Acme Inc."
                    defaultValue="Acme Inc."
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="gradient-primary" size="default">
                    <Check className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button variant="ghost-glass" size="default">
                    Cancel
                  </Button>
                </div>
              </div>
            </CardGlass>

            <CardGlass variant="default" hover className="h-full">
              <div className="flex items-center gap-2 mb-6">
                <Bell className="w-5 h-5 text-purple-400" />
                <h2 className="text-xl font-semibold text-white">Notifications</h2>
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                  4 Active
                </Badge>
              </div>

              <div className="space-y-3">
                {[
                  {
                    label: 'Email notifications for new meetings',
                    description: 'Receive emails when new meetings are scheduled',
                    enabled: emailNotifications,
                    setter: setEmailNotifications
                  },
                  {
                    label: 'Desktop notifications for transcriptions',
                    description: 'Get notified when transcriptions are complete',
                    enabled: desktopNotifications,
                    setter: setDesktopNotifications
                  },
                  {
                    label: 'Weekly summary reports',
                    description: 'Receive weekly activity summaries via email',
                    enabled: weeklyReports,
                    setter: setWeeklyReports
                  },
                  {
                    label: 'Marketing emails',
                    description: 'Product updates and company news',
                    enabled: marketingEmails,
                    setter: setMarketingEmails
                  },
                ].map((setting, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-white/5 hover:bg-slate-800/50 hover:border-white/10 transition-all">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-200">{setting.label}</div>
                      <div className="text-xs text-slate-500 mt-1">{setting.description}</div>
                    </div>
                    <Switch
                      checked={setting.enabled}
                      onCheckedChange={setting.setter}
                      className="data-[state=checked]:bg-teal-500"
                    />
                  </div>
                ))}
              </div>
            </CardGlass>

            <CardGlass variant="default" hover className="h-full">
              <div className="flex items-center gap-2 mb-6">
                <Video className="w-5 h-5 text-cyan-400" />
                <h2 className="text-xl font-semibold text-white">Meeting Defaults</h2>
              </div>

              <div className="space-y-3">
                {[
                  {
                    label: 'Auto-record meetings',
                    description: 'Automatically record all meetings by default',
                    enabled: autoRecord,
                    setter: setAutoRecord
                  },
                  {
                    label: 'Enable transcription',
                    description: 'Automatically transcribe meeting recordings',
                    enabled: transcriptionEnabled,
                    setter: setTranscriptionEnabled
                  },
                ].map((setting, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-white/5 hover:bg-slate-800/50 hover:border-white/10 transition-all">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-200">{setting.label}</div>
                      <div className="text-xs text-slate-500 mt-1">{setting.description}</div>
                    </div>
                    <Switch
                      checked={setting.enabled}
                      onCheckedChange={setting.setter}
                      className="data-[state=checked]:bg-cyan-500"
                    />
                  </div>
                ))}
              </div>
            </CardGlass>
          </div>

          <div className="space-y-6">
            <CardGlass variant="default" hover className="h-full">
              <div className="flex items-center gap-2 mb-6">
                <Lock className="w-5 h-5 text-amber-400" />
                <h2 className="text-xl font-semibold text-white">Privacy</h2>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-800/30 border border-white/5">
                  <h3 className="text-sm font-semibold text-slate-200 mb-2">Profile Visibility</h3>
                  <select className="w-full px-3 py-2 rounded-lg bg-slate-800/50 border border-white/10 text-white text-sm focus:ring-2 focus:ring-amber-500/50 outline-none">
                    <option>Public</option>
                    <option>Team Only</option>
                    <option>Private</option>
                  </select>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/30 border border-white/5">
                  <h3 className="text-sm font-semibold text-slate-200 mb-2">Data Retention</h3>
                  <select className="w-full px-3 py-2 rounded-lg bg-slate-800/50 border border-white/10 text-white text-sm focus:ring-2 focus:ring-amber-500/50 outline-none">
                    <option>30 days</option>
                    <option>90 days</option>
                    <option>1 year</option>
                    <option>Forever</option>
                  </select>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/30 border border-white/5">
                  <h3 className="text-sm font-semibold text-slate-200 mb-3">Security Options</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Two-Factor Auth</span>
                      <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                        Enabled
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Session Timeout</span>
                      <span className="text-xs text-slate-300">30 minutes</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardGlass>

            <CardGlass
              variant="default"
              className="border-rose-500/30 bg-gradient-to-br from-rose-500/5 to-rose-500/10"
            >
              <div className="flex items-center gap-2 mb-6">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <h2 className="text-xl font-semibold text-white">Danger Zone</h2>
              </div>

              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30">
                <h3 className="font-semibold text-rose-300 mb-2">Delete Account</h3>
                <p className="text-sm text-slate-400 mb-4">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <Button variant="destructive" size="sm" className="w-full">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </div>
            </CardGlass>
          </div>
        </div>
      </div>
    </div>
  );
}
