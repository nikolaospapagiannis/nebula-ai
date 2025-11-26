'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Calendar,
  Clock,
  Users,
  FileText,
  Download,
  Share2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  ChevronLeft,
  Copy,
  CheckCircle,
  AlertCircle,
  Bot,
  Sparkles,
  Target,
  TrendingUp,
  MessageSquare
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { CardGlass, CardGlassContent, CardGlassHeader, CardGlassTitle } from '@/components/ui/card-glass';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/api';
import { formatDateTime, formatDuration, getPlatformIcon, getSentimentEmoji } from '@/lib/utils';

interface TranscriptSegment {
  id: string;
  speaker: string;
  text: string;
  startTime: number;
  endTime: number;
  confidence: number;
}

interface ActionItem {
  id: string;
  description: string;
  assignee?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
}

interface Topic {
  name: string;
  relevance: number;
  mentions: number;
}

interface MeetingDetail {
  id: string;
  title: string;
  scheduledStartAt: string;
  scheduledEndAt: string;
  actualStartAt?: string;
  actualEndAt?: string;
  duration: number;
  status: string;
  platform: string;
  meetingUrl?: string;
  recordingUrl?: string;
  attendees: {
    id: string;
    name: string;
    email: string;
    role: string;
    speakingTime?: number;
  }[];
  transcript?: {
    id: string;
    segments: TranscriptSegment[];
    wordCount: number;
    language: string;
  };
  analysis?: {
    summary: string;
    keyPoints: string[];
    actionItems: ActionItem[];
    sentiment: number;
    topics: Topic[];
    nextSteps: string[];
    decisions: string[];
  };
  recording?: {
    id: string;
    url: string;
    duration: number;
    size: number;
  };
}

export default function MeetingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user, isLoading: authLoading } = useAuth();
  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'transcript' | 'analysis' | 'recording'>('transcript');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedSpeaker, setSelectedSpeaker] = useState<string | null>(null);

  const meetingId = params?.id as string;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user && meetingId) {
      fetchMeetingDetail();
    }
  }, [user, authLoading, router, meetingId]);

  const fetchMeetingDetail = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getMeetingDetail(meetingId);
      setMeeting(data);
    } catch (error) {
      console.error('Failed to fetch meeting detail:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadTranscript = async () => {
    if (!meeting?.transcript) return;

    try {
      const data = await apiClient.downloadTranscript(meetingId, 'pdf');
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${meeting.title}-transcript.pdf`;
      a.click();
    } catch (error) {
      console.error('Failed to download transcript:', error);
    }
  };

  const handleShareMeeting = async () => {
    try {
      const shareUrl = `${window.location.origin}/meetings/${meetingId}/shared`;
      await navigator.clipboard.writeText(shareUrl);
      // Show success toast
    } catch (error) {
      console.error('Failed to share meeting:', error);
    }
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Show success toast
  };

  const filteredSegments = meeting?.transcript?.segments.filter(segment => {
    if (selectedSpeaker && segment.speaker !== selectedSpeaker) return false;
    if (searchQuery && !segment.text.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const speakers = meeting?.transcript?.segments
    .map(s => s.speaker)
    .filter((v, i, a) => a.indexOf(v) === i);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="min-h-screen bg-[#0a0a1a] flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400">Meeting not found</p>
          <Button className="mt-4" onClick={() => router.push('/meetings')}>
            Back to Meetings
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a]">
      {/* Header */}
      <header className="bg-slate-900/40 backdrop-blur-sm border-b border-[#1e293b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/meetings')}
                className="text-slate-400 hover:text-white flex items-center transition-colors"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Meetings
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={handleDownloadTranscript}
                className="border-[#1e293b] bg-slate-900/40 text-slate-300 hover:bg-slate-800/60 hover:text-white hover:border-purple-500/50"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                variant="outline"
                onClick={handleShareMeeting}
                className="border-[#1e293b] bg-slate-900/40 text-slate-300 hover:bg-slate-800/60 hover:text-white hover:border-purple-500/50"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Meeting Info */}
        <CardGlass className="mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="text-3xl">
                {getPlatformIcon(meeting.platform)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{meeting.title}</h1>
                <div className="flex items-center space-x-6 mt-2 text-sm text-slate-400">
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDateTime(meeting.scheduledStartAt)}
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {formatDuration(meeting.duration)}
                  </span>
                  <span className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {meeting.attendees.length} attendees
                  </span>
                </div>
              </div>
            </div>
            <span className={`px-3 py-1 text-sm rounded-full ${
              meeting.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
              meeting.status === 'in_progress' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
              'bg-slate-700/50 text-slate-400 border border-slate-600/30'
            }`}>
              {meeting.status}
            </span>
          </div>

          {/* Attendees */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-slate-300 mb-2">Attendees</h3>
            <div className="flex flex-wrap gap-2">
              {meeting.attendees.map((attendee) => (
                <div key={attendee.id} className="flex items-center space-x-2 bg-slate-800/60 border border-[#1e293b] rounded-full px-3 py-1">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-teal-500 rounded-full flex items-center justify-center text-xs text-white font-medium">
                    {attendee.name[0]}
                  </div>
                  <span className="text-sm text-slate-300">{attendee.name}</span>
                  {attendee.speakingTime && (
                    <span className="text-xs text-slate-500">
                      ({formatDuration(attendee.speakingTime)})
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardGlass>

        {/* Tabs */}
        <CardGlass padding="none" className="mb-6">
          <div className="border-b border-[#1e293b]">
            <div className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('transcript')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'transcript'
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="inline h-4 w-4 mr-2" />
                Transcript
              </button>
              <button
                onClick={() => setActiveTab('analysis')}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'analysis'
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Bot className="inline h-4 w-4 mr-2" />
                AI Analysis
              </button>
              {meeting.recording && (
                <button
                  onClick={() => setActiveTab('recording')}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === 'recording'
                      ? 'border-purple-500 text-purple-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Play className="inline h-4 w-4 mr-2" />
                  Recording
                </button>
              )}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'transcript' && meeting.transcript && (
              <div>
                {/* Transcript Controls */}
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center space-x-4">
                    <input
                      type="text"
                      placeholder="Search transcript..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="px-4 py-2 bg-slate-800/60 border border-[#1e293b] rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50"
                    />
                    <select
                      value={selectedSpeaker || ''}
                      onChange={(e) => setSelectedSpeaker(e.target.value || null)}
                      className="px-4 py-2 bg-slate-800/60 border border-[#1e293b] rounded-lg text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50"
                    >
                      <option value="" className="bg-slate-900">All Speakers</option>
                      {speakers?.map(speaker => (
                        <option key={speaker} value={speaker} className="bg-slate-900">{speaker}</option>
                      ))}
                    </select>
                  </div>
                  <div className="text-sm text-slate-400">
                    {meeting.transcript.wordCount} words | {meeting.transcript.language}
                  </div>
                </div>

                {/* Transcript Content */}
                <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
                  {filteredSegments?.map((segment) => (
                    <div key={segment.id} className="flex space-x-4 p-3 hover:bg-slate-800/40 rounded-lg transition-colors border border-transparent hover:border-[#1e293b]">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500/30 to-teal-500/30 border border-purple-500/30 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-purple-300">
                            {segment.speaker.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-white">{segment.speaker}</span>
                          <span className="text-xs text-slate-500">
                            {formatDuration(Math.floor(segment.startTime))}
                          </span>
                        </div>
                        <p className="text-slate-300">{segment.text}</p>
                        <button
                          onClick={() => handleCopyToClipboard(segment.text)}
                          className="mt-2 text-xs text-slate-500 hover:text-purple-400 flex items-center transition-colors"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'analysis' && meeting.analysis && (
              <div className="space-y-6">
                {/* Summary */}
                <CardGlass variant="subtle" padding="none">
                  <CardGlassHeader className="px-6 pt-6 border-b-0 pb-4">
                    <CardGlassTitle className="flex items-center text-lg">
                      <Sparkles className="h-5 w-5 mr-2 text-purple-400" />
                      Summary
                    </CardGlassTitle>
                  </CardGlassHeader>
                  <CardGlassContent className="px-6 pb-6 pt-0">
                    <p className="text-slate-300">{meeting.analysis.summary}</p>
                  </CardGlassContent>
                </CardGlass>

                {/* Key Points */}
                <CardGlass variant="subtle" padding="none">
                  <CardGlassHeader className="px-6 pt-6 border-b-0 pb-4">
                    <CardGlassTitle className="flex items-center text-lg">
                      <Target className="h-5 w-5 mr-2 text-teal-400" />
                      Key Points
                    </CardGlassTitle>
                  </CardGlassHeader>
                  <CardGlassContent className="px-6 pb-6 pt-0">
                    <ul className="space-y-2">
                      {meeting.analysis.keyPoints.map((point, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-emerald-400 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-300">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </CardGlassContent>
                </CardGlass>

                {/* Action Items */}
                <CardGlass variant="subtle" padding="none">
                  <CardGlassHeader className="px-6 pt-6 border-b-0 pb-4">
                    <CardGlassTitle className="flex items-center text-lg">
                      <Target className="h-5 w-5 mr-2 text-amber-400" />
                      Action Items
                    </CardGlassTitle>
                  </CardGlassHeader>
                  <CardGlassContent className="px-6 pb-6 pt-0">
                    <div className="space-y-3">
                      {meeting.analysis.actionItems.map((item) => (
                        <div key={item.id} className="flex items-start justify-between p-3 bg-slate-800/40 border border-[#1e293b] rounded-lg">
                          <div className="flex items-start space-x-3">
                            <input
                              type="checkbox"
                              checked={item.status === 'completed'}
                              readOnly
                              className="mt-1 rounded border-slate-600 bg-slate-800 text-purple-500 focus:ring-purple-500/50"
                            />
                            <div>
                              <p className="text-slate-300">{item.description}</p>
                              {item.assignee && (
                                <p className="text-sm text-slate-500 mt-1">Assigned to: {item.assignee}</p>
                              )}
                            </div>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            item.priority === 'high' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                            item.priority === 'medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                            'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {item.priority}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardGlassContent>
                </CardGlass>

                {/* Topics & Sentiment */}
                <div className="grid grid-cols-2 gap-6">
                  <CardGlass variant="subtle" padding="none">
                    <CardGlassHeader className="px-6 pt-6 border-b-0 pb-4">
                      <CardGlassTitle className="flex items-center text-lg">
                        <MessageSquare className="h-5 w-5 mr-2 text-blue-400" />
                        Topics Discussed
                      </CardGlassTitle>
                    </CardGlassHeader>
                    <CardGlassContent className="px-6 pb-6 pt-0">
                      <div className="space-y-3">
                        {meeting.analysis.topics.map((topic, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-slate-300">{topic.name}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-slate-500">{topic.mentions}</span>
                              <div className="w-20 bg-slate-800 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-purple-500 to-teal-500 h-2 rounded-full"
                                  style={{ width: `${topic.relevance * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardGlassContent>
                  </CardGlass>

                  <CardGlass variant="subtle" padding="none">
                    <CardGlassHeader className="px-6 pt-6 border-b-0 pb-4">
                      <CardGlassTitle className="flex items-center text-lg">
                        <TrendingUp className="h-5 w-5 mr-2 text-green-400" />
                        Sentiment Analysis
                      </CardGlassTitle>
                    </CardGlassHeader>
                    <CardGlassContent className="px-6 pb-6 pt-0">
                      <div className="text-center">
                        <div className="text-4xl mb-2">
                          {getSentimentEmoji(meeting.analysis.sentiment)}
                        </div>
                        <p className="text-slate-300">
                          Overall sentiment: {
                            meeting.analysis.sentiment > 0.6 ? 'Positive' :
                            meeting.analysis.sentiment > 0.2 ? 'Neutral' :
                            'Negative'
                          }
                        </p>
                        <div className="mt-4 bg-slate-800 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              meeting.analysis.sentiment > 0.6 ? 'bg-emerald-500' :
                              meeting.analysis.sentiment > 0.2 ? 'bg-amber-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${(meeting.analysis.sentiment + 1) * 50}%` }}
                          />
                        </div>
                      </div>
                    </CardGlassContent>
                  </CardGlass>
                </div>
              </div>
            )}

            {activeTab === 'recording' && meeting.recording && (
              <div>
                <div className="bg-black rounded-lg aspect-video flex items-center justify-center mb-4 border border-[#1e293b]">
                  <video
                    src={meeting.recording.url}
                    controls
                    className="w-full h-full rounded-lg"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Button
                      size="icon"
                      variant="outline"
                      className="border-[#1e293b] bg-slate-800/60 text-slate-300 hover:bg-slate-700/60 hover:text-white hover:border-purple-500/50"
                    >
                      <SkipBack className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-500 hover:to-teal-500 text-white"
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="border-[#1e293b] bg-slate-800/60 text-slate-300 hover:bg-slate-700/60 hover:text-white hover:border-purple-500/50"
                    >
                      <SkipForward className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="border-[#1e293b] bg-slate-800/60 text-slate-300 hover:bg-slate-700/60 hover:text-white hover:border-purple-500/50"
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <a
                    href={meeting.recording.url}
                    download
                    className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Download Recording ({Math.round(meeting.recording.size / 1024 / 1024)} MB)
                  </a>
                </div>
              </div>
            )}
          </div>
        </CardGlass>
      </main>
    </div>
  );
}
