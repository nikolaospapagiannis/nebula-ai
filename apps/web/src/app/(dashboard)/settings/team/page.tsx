'use client';

import { useState } from 'react';
import { Users, UserPlus, Mail, MoreVertical, Crown, Shield, User, Trash2, Send } from 'lucide-react';
import { CardGlass } from '@/components/ui/card-glass';
import { Button } from '@/components/ui/button-v2';
import { Badge } from '@/components/ui/badge';

export default function TeamPage() {
  const [email, setEmail] = useState('');

  const teamMembers = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john@acme.com',
      role: 'Owner',
      avatar: 'JD',
      joinedAt: '2024-01-15',
      status: 'active'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@acme.com',
      role: 'Admin',
      avatar: 'JS',
      joinedAt: '2024-02-20',
      status: 'active'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike@acme.com',
      role: 'Member',
      avatar: 'MJ',
      joinedAt: '2024-03-10',
      status: 'active'
    },
  ];

  const pendingInvites = [
    {
      id: 1,
      email: 'sarah@acme.com',
      role: 'Member',
      invitedAt: '2024-11-20',
      invitedBy: 'John Doe'
    }
  ];

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Owner':
        return <Crown className="h-4 w-4 text-yellow-400" />;
      case 'Admin':
        return <Shield className="h-4 w-4 text-teal-400" />;
      default:
        return <User className="h-4 w-4 text-slate-400" />;
    }
  };

  const getRoleBadgeClass = (role: string) => {
    const badges: Record<string, string> = {
      Owner: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      Admin: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
      Member: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
    };
    return badges[role] || 'bg-slate-500/20 text-slate-300 border-slate-500/30';
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-6 w-6 text-teal-400" />
            <h1 className="text-3xl font-bold text-white">Team Management</h1>
          </div>
          <p className="text-slate-400">Invite and manage your team members</p>
        </div>

        <CardGlass variant="elevated" gradient className="mb-6">
          <div className="flex items-center gap-2 mb-6">
            <Mail className="w-5 h-5 text-teal-400" />
            <h2 className="text-xl font-semibold text-white">Invite Team Member</h2>
          </div>

          <div className="flex gap-4">
            <input
              type="email"
              placeholder="colleague@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 outline-none transition-all"
            />
            <Button variant="gradient-primary" size="default">
              <Send className="w-4 h-4 mr-2" />
              Send Invite
            </Button>
          </div>
          <p className="text-sm text-slate-500 mt-3">
            Team members will receive an email with instructions to join your workspace
          </p>
        </CardGlass>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <CardGlass variant="default" hover>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Total Members</p>
                <p className="text-3xl font-bold text-white">{teamMembers.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardGlass>

          <CardGlass variant="default" hover>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Active Members</p>
                <p className="text-3xl font-bold text-white">{teamMembers.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20">
                <Shield className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardGlass>

          <CardGlass variant="default" hover>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">Pending Invites</p>
                <p className="text-3xl font-bold text-white">{pendingInvites.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Mail className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardGlass>
        </div>

        <CardGlass variant="default" hover>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              <h2 className="text-xl font-semibold text-white">Team Members</h2>
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                {teamMembers.length} Members
              </Badge>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Member</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-400">Joined</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teamMembers.map((member) => (
                  <tr key={member.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                          {member.avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white">{member.name}</span>
                            {getRoleIcon(member.role)}
                          </div>
                          <div className="text-sm text-slate-400">{member.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={getRoleBadgeClass(member.role)}>
                        {member.role}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                        Active
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-slate-400">
                        {new Date(member.joinedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {member.role !== 'Owner' ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost-glass" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost-glass" size="sm" className="text-rose-400 hover:text-rose-300">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs">
                          Owner
                        </Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardGlass>

        {pendingInvites.length > 0 && (
          <CardGlass variant="default" hover className="mt-6">
            <div className="flex items-center gap-2 mb-6">
              <UserPlus className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-semibold text-white">Pending Invitations</h2>
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                {pendingInvites.length}
              </Badge>
            </div>

            <div className="space-y-3">
              {pendingInvites.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-800/30 border border-white/5 hover:bg-slate-800/50 hover:border-white/10 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-700/50 border border-white/10 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <div className="font-medium text-white">{invite.email}</div>
                      <div className="text-sm text-slate-400">
                        Invited by {invite.invitedBy} on {new Date(invite.invitedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getRoleBadgeClass(invite.role)}>
                      {invite.role}
                    </Badge>
                    <Button variant="ghost-glass" size="sm">
                      Resend
                    </Button>
                    <Button variant="ghost-glass" size="sm" className="text-rose-400 hover:text-rose-300">
                      Cancel
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardGlass>
        )}
      </div>
    </div>
  );
}
