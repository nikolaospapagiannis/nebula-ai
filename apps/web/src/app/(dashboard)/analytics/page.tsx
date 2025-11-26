'use client';

import { BarChart3, TrendingUp, Users, Clock, Calendar, MessageSquare } from 'lucide-react';
import { CardGlass, CardGlassContent, CardGlassHeader, CardGlassTitle, CardGlassDescription } from '@/components/ui/card-glass';

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a1a] p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-slate-400 mt-1">Track meeting trends, participation, and insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <CardGlass padding="none">
          <CardGlassContent className="p-6 pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-blue-500/20 border border-blue-500/30 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-400" />
              </div>
              <span className="text-xs text-emerald-400 font-medium">+12%</span>
            </div>
            <p className="text-2xl font-bold text-white">0</p>
            <p className="text-sm text-slate-400">Total Meetings</p>
          </CardGlassContent>
        </CardGlass>

        <CardGlass padding="none">
          <CardGlassContent className="p-6 pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-purple-500/20 border border-purple-500/30 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-purple-400" />
              </div>
              <span className="text-xs text-emerald-400 font-medium">+8%</span>
            </div>
            <p className="text-2xl font-bold text-white">0h</p>
            <p className="text-sm text-slate-400">Total Duration</p>
          </CardGlassContent>
        </CardGlass>

        <CardGlass padding="none">
          <CardGlassContent className="p-6 pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-emerald-500/20 border border-emerald-500/30 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-emerald-400" />
              </div>
              <span className="text-xs text-emerald-400 font-medium">+5%</span>
            </div>
            <p className="text-2xl font-bold text-white">0</p>
            <p className="text-sm text-slate-400">Participants</p>
          </CardGlassContent>
        </CardGlass>

        <CardGlass padding="none">
          <CardGlassContent className="p-6 pt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-orange-500/20 border border-orange-500/30 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-orange-400" />
              </div>
              <span className="text-xs text-emerald-400 font-medium">+15%</span>
            </div>
            <p className="text-2xl font-bold text-white">0</p>
            <p className="text-sm text-slate-400">Transcripts</p>
          </CardGlassContent>
        </CardGlass>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <CardGlass padding="none">
          <CardGlassHeader className="p-6 pb-4">
            <CardGlassTitle>Meeting Trends</CardGlassTitle>
            <CardGlassDescription>Meetings over time</CardGlassDescription>
          </CardGlassHeader>
          <CardGlassContent className="p-6 pt-0">
            <div className="h-64 flex items-center justify-center bg-[#0a0a1a]/50 rounded-lg border-2 border-dashed border-[#1e293b]">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-slate-500 mx-auto mb-2" />
                <p className="text-slate-300">No data available</p>
                <p className="text-sm text-slate-500">Start recording meetings to see trends</p>
              </div>
            </div>
          </CardGlassContent>
        </CardGlass>

        <CardGlass padding="none">
          <CardGlassHeader className="p-6 pb-4">
            <CardGlassTitle>Participation Rate</CardGlassTitle>
            <CardGlassDescription>Average participation by attendees</CardGlassDescription>
          </CardGlassHeader>
          <CardGlassContent className="p-6 pt-0">
            <div className="h-64 flex items-center justify-center bg-[#0a0a1a]/50 rounded-lg border-2 border-dashed border-[#1e293b]">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-slate-500 mx-auto mb-2" />
                <p className="text-slate-300">No data available</p>
                <p className="text-sm text-slate-500">Participation data will appear here</p>
              </div>
            </div>
          </CardGlassContent>
        </CardGlass>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CardGlass padding="none">
          <CardGlassHeader className="p-6 pb-4">
            <CardGlassTitle>Top Speakers</CardGlassTitle>
            <CardGlassDescription>Most active participants</CardGlassDescription>
          </CardGlassHeader>
          <CardGlassContent className="p-6 pt-0">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-teal-500/20 border border-teal-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-teal-400" />
              </div>
              <p className="text-slate-300">No speaker data yet</p>
              <p className="text-sm text-slate-500">Record meetings to track speaker engagement</p>
            </div>
          </CardGlassContent>
        </CardGlass>

        <CardGlass padding="none">
          <CardGlassHeader className="p-6 pb-4">
            <CardGlassTitle>Meeting Topics</CardGlassTitle>
            <CardGlassDescription>Most discussed topics</CardGlassDescription>
          </CardGlassHeader>
          <CardGlassContent className="p-6 pt-0">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-cyan-500/20 border border-cyan-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-cyan-400" />
              </div>
              <p className="text-slate-300">No topics tracked yet</p>
              <p className="text-sm text-slate-500">AI will extract topics from your meetings</p>
            </div>
          </CardGlassContent>
        </CardGlass>
      </div>
    </div>
  );
}
