'use client';

import { useState } from 'react';
import { Shield, Key, Users, CheckCircle, Copy, AlertTriangle, Settings } from 'lucide-react';
import { CardGlass } from '@/components/ui/card-glass';
import { Button } from '@/components/ui/button-v2';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

export default function SSOSettingsPage() {
  const [provider, setProvider] = useState<'okta' | 'azure_ad' | 'auth0' | 'google_workspace' | 'custom_saml'>('okta');
  const [ssoEnabled, setSsoEnabled] = useState(false);
  const [enforceSSO, setEnforceSSO] = useState(false);
  const [scimEnabled, setScimEnabled] = useState(false);
  const [jitProvisioning, setJitProvisioning] = useState(true);

  const stats = {
    activeSessions: 24,
    totalUsers: 156,
    jitProvisionedUsers: 89,
    scimUsers: 67
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-6 w-6 text-teal-400" />
            <h1 className="text-3xl font-bold text-white">SSO Configuration</h1>
          </div>
          <p className="text-slate-400">Configure single sign-on for your organization using Okta, Auth0, Azure AD, or custom SAML 2.0</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <CardGlass variant="default" hover>
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Active Sessions</span>
                <Users className="w-5 h-5 text-teal-400" />
              </div>
              <span className="text-3xl font-bold text-white">{stats.activeSessions}</span>
            </div>
          </CardGlass>

          <CardGlass variant="default" hover>
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Total Users</span>
                <Shield className="w-5 h-5 text-purple-400" />
              </div>
              <span className="text-3xl font-bold text-white">{stats.totalUsers}</span>
            </div>
          </CardGlass>

          <CardGlass variant="default" hover>
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">JIT Provisioned</span>
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <span className="text-3xl font-bold text-white">{stats.jitProvisionedUsers}</span>
            </div>
          </CardGlass>

          <CardGlass variant="default" hover>
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">SCIM Users</span>
                <Users className="w-5 h-5 text-cyan-400" />
              </div>
              <span className="text-3xl font-bold text-white">{stats.scimUsers}</span>
            </div>
          </CardGlass>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <CardGlass variant="default" hover>
              <div className="flex items-center gap-2 mb-6">
                <Key className="w-5 h-5 text-teal-400" />
                <h2 className="text-xl font-semibold text-white">Identity Provider</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Provider Type
                  </label>
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value as any)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 outline-none transition-all"
                  >
                    <option value="okta">Okta</option>
                    <option value="auth0">Auth0</option>
                    <option value="azure_ad">Azure AD</option>
                    <option value="google_workspace">Google Workspace</option>
                    <option value="custom_saml">Custom SAML 2.0</option>
                  </select>
                </div>

                {provider === 'okta' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Okta Domain
                      </label>
                      <input
                        type="text"
                        placeholder="your-domain.okta.com"
                        className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 outline-none transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Client ID
                        </label>
                        <input
                          type="text"
                          placeholder="Enter client ID"
                          className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 outline-none transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                          Client Secret
                        </label>
                        <input
                          type="password"
                          placeholder="Enter client secret"
                          className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        API Token
                      </label>
                      <input
                        type="password"
                        placeholder="Enter API token"
                        className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 outline-none transition-all"
                      />
                      <p className="text-xs text-slate-500 mt-2">Required for user provisioning and group sync</p>
                    </div>
                  </>
                )}

                <div className="space-y-3 pt-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-white/5">
                    <div>
                      <div className="text-sm font-medium text-slate-200">Enable SSO</div>
                      <div className="text-xs text-slate-500 mt-1">Allow users to login via single sign-on</div>
                    </div>
                    <Switch
                      checked={ssoEnabled}
                      onCheckedChange={setSsoEnabled}
                      className="data-[state=checked]:bg-teal-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-white/5">
                    <div>
                      <div className="text-sm font-medium text-slate-200">Enforce SSO</div>
                      <div className="text-xs text-slate-500 mt-1">Require all users to login via SSO</div>
                    </div>
                    <Switch
                      checked={enforceSSO}
                      onCheckedChange={setEnforceSSO}
                      className="data-[state=checked]:bg-purple-500"
                      disabled={!ssoEnabled}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="gradient-primary" size="default">
                    Save Configuration
                  </Button>
                  <Button variant="ghost-glass" size="default">
                    Test Connection
                  </Button>
                </div>
              </div>
            </CardGlass>

            <CardGlass variant="default" hover>
              <div className="flex items-center gap-2 mb-6">
                <Settings className="w-5 h-5 text-purple-400" />
                <h2 className="text-xl font-semibold text-white">SAML 2.0 Configuration</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Entity ID
                  </label>
                  <input
                    type="text"
                    placeholder="https://your-domain.com/saml/metadata"
                    className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    SSO URL (Sign-In URL)
                  </label>
                  <input
                    type="text"
                    placeholder="https://idp.example.com/sso"
                    className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    X.509 Certificate
                  </label>
                  <textarea
                    className="w-full h-32 px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 outline-none transition-all font-mono text-xs"
                    placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
                  />
                  <p className="text-xs text-slate-500 mt-2">Paste your Identity Provider's X.509 certificate</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/30 border border-white/5">
                  <h3 className="font-medium text-slate-200 mb-3">Your SAML Endpoints</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs font-medium text-slate-400 mb-1">ACS URL (Reply URL):</div>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 px-3 py-2 rounded-lg bg-slate-900/50 border border-white/5 text-teal-300 text-xs">
                          https://your-domain.com/api/sso/saml/acs/org-id
                        </code>
                        <Button variant="ghost-glass" size="sm" onClick={() => copyToClipboard('https://your-domain.com/api/sso/saml/acs/org-id')}>
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-slate-400 mb-1">Metadata URL:</div>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 px-3 py-2 rounded-lg bg-slate-900/50 border border-white/5 text-teal-300 text-xs">
                          https://your-domain.com/api/sso/saml/metadata/org-id
                        </code>
                        <Button variant="ghost-glass" size="sm" onClick={() => copyToClipboard('https://your-domain.com/api/sso/saml/metadata/org-id')}>
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardGlass>
          </div>

          <div className="space-y-6">
            <CardGlass variant="default" hover>
              <div className="flex items-center gap-2 mb-6">
                <Users className="w-5 h-5 text-cyan-400" />
                <h2 className="text-xl font-semibold text-white">SCIM Provisioning</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-white/5">
                  <div>
                    <div className="text-sm font-medium text-slate-200">Enable SCIM 2.0</div>
                    <div className="text-xs text-slate-500 mt-1">Automatic user provisioning</div>
                  </div>
                  <Switch
                    checked={scimEnabled}
                    onCheckedChange={setScimEnabled}
                    className="data-[state=checked]:bg-cyan-500"
                  />
                </div>

                {scimEnabled && (
                  <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                    <h4 className="text-sm font-semibold text-cyan-300 mb-3">SCIM Configuration</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-slate-400 mb-1">Base URL:</div>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 px-2 py-1 rounded bg-slate-900/50 text-cyan-300 text-xs">
                            https://api.your-domain.com/scim/v2
                          </code>
                          <Button variant="ghost-glass" size="xs" onClick={() => copyToClipboard('https://api.your-domain.com/scim/v2')}>
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 mb-1">Bearer Token:</div>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 px-2 py-1 rounded bg-slate-900/50 text-cyan-300 text-xs truncate">
                            scim_prod_abc123def456...
                          </code>
                          <Button variant="ghost-glass" size="xs">
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-slate-800/30 border border-white/5">
                  <h4 className="text-sm font-semibold text-slate-200 mb-2">Supported Operations</h4>
                  <ul className="space-y-1 text-xs text-slate-400">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      User Creation
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      User Updates
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      User Deactivation
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      Group Management
                    </li>
                  </ul>
                </div>
              </div>
            </CardGlass>

            <CardGlass variant="default" hover>
              <div className="flex items-center gap-2 mb-6">
                <Shield className="w-5 h-5 text-green-400" />
                <h2 className="text-xl font-semibold text-white">JIT Provisioning</h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-white/5">
                  <div>
                    <div className="text-sm font-medium text-slate-200">Enable JIT</div>
                    <div className="text-xs text-slate-500 mt-1">Create users on first login</div>
                  </div>
                  <Switch
                    checked={jitProvisioning}
                    onCheckedChange={setJitProvisioning}
                    className="data-[state=checked]:bg-green-500"
                  />
                </div>

                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                  <h4 className="text-sm font-semibold text-green-300 mb-2">Attribute Mapping</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Email:</span>
                      <span className="text-slate-300">email, emailAddress</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">First Name:</span>
                      <span className="text-slate-300">firstName, givenName</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Last Name:</span>
                      <span className="text-slate-300">lastName, familyName</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardGlass>

            <CardGlass variant="default" className="border-amber-500/30 bg-gradient-to-br from-amber-500/5 to-amber-500/10">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-semibold text-white">Security Notice</h3>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Enabling SSO affects all users in your organization. Test your configuration thoroughly before enforcing SSO for all users.
              </p>
            </CardGlass>
          </div>
        </div>
      </div>
    </div>
  );
}
