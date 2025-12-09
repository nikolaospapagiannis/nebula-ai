'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  Calendar,
  Clock,
  Users,
  FileText,
  Download,
  Share2,
  ChevronLeft,
  Copy,
  CheckCircle,
  AlertCircle,
  Bot,
  Sparkles,
  Target,
  TrendingUp,
  MessageSquare,
  Loader2,
  Scissors
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { CardGlass, CardGlassContent, CardGlassHeader, CardGlassTitle } from '@/components/ui/card-glass';
import { useAuth } from '@/contexts/AuthContext';
import apiClient from '@/lib/api';
import { formatDateTime, formatDuration, getPlatformIcon, getSentimentEmoji } from '@/lib/utils';
import { MeetingPlayer } from '@/components/meetings/MeetingPlayer';
import { SyncedTranscript } from '@/components/meetings/SyncedTranscript';
import { MeetingTabs, TabType } from '@/components/meetings/MeetingTabs';
import { useSyncedPlayback, TranscriptSegment as SyncedTranscriptSegment } from '@/hooks/useSyncedPlayback';

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
  const [activeTab, setActiveTab] = useState<TabType>('transcript');
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const meetingId = params?.id as string;

  // Convert transcript segments to synced format
  const syncedSegments: SyncedTranscriptSegment[] = meeting?.transcript?.segments.map(seg => ({
    id: seg.id,
    speaker: seg.speaker,
    text: seg.text,
    startTime: seg.startTime,
    endTime: seg.endTime,
    confidence: seg.confidence,
  })) || [];

  // Use synced playback hook
  const { currentSegment, seekToSegment, activeSegmentIndex } = useSyncedPlayback({
    segments: syncedSegments,
    videoRef,
  });

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

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

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
    <div className="min-h-screen bg-[#0a0a1a] flex flex-col">
      {/* Header */}
      <header className="bg-slate-900/40 backdrop-blur-sm border-b border-[#1e293b] sticky top-0 z-10">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
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

      <main className="flex-1 flex flex-col max-w-[1920px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Meeting Info Header */}
        <CardGlass className="shrink-0">
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
        </CardGlass>

        {/* Split View: Player and Content */}
        <div className="flex-1 flex gap-6 min-h-0 overflow-hidden">
          {/* Left: Video Player */}
          <div className="flex-1 flex flex-col min-w-0">
            <CardGlass padding="none" className="h-full flex flex-col">
              <div className="flex-1">
                <MeetingPlayer
                  recordingUrl={meeting.recording?.url}
                  isVideo={true}
                  onTimeUpdate={handleTimeUpdate}
                  className="h-full"
                />
              </div>
            </CardGlass>
          </div>

          {/* Right: Tabbed Content with Transcript */}
          <div className="w-[480px] flex flex-col min-h-0">
            <CardGlass padding="none" className="flex-1 flex flex-col min-h-0">
              {/* Tabs */}
              <MeetingTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                counts={{
                  actionItems: meeting.analysis?.actionItems?.length || 0,
                  comments: 0,
                  clips: 0,
                }}
              />

              {/* Tab Content */}
              <div className="flex-1 overflow-hidden">
                {activeTab === 'transcript' && meeting.transcript && (
                  <SyncedTranscript
                    segments={syncedSegments}
                    currentSegment={currentSegment}
                    activeSegmentIndex={activeSegmentIndex}
                    onSegmentClick={seekToSegment}
                    meetingTitle={meeting.title}
                  />
                )}

                {activeTab === 'summary' && meeting.analysis && (
                  <div className="h-full overflow-y-auto p-6 space-y-6">
                    {/* Summary */}
                    <div>
                      <h3 className="flex items-center text-lg font-semibold text-white mb-3">
                        <Sparkles className="h-5 w-5 mr-2 text-purple-400" />
                        Summary
                      </h3>
                      <p className="text-slate-300 leading-relaxed">{meeting.analysis.summary}</p>
                    </div>

                    {/* Key Points */}
                    <div>
                      <h3 className="flex items-center text-lg font-semibold text-white mb-3">
                        <Target className="h-5 w-5 mr-2 text-teal-400" />
                        Key Points
                      </h3>
                      <ul className="space-y-2">
                        {meeting.analysis.keyPoints.map((point, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="h-4 w-4 text-emerald-400 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-slate-300">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Decisions */}
                    {meeting.analysis.decisions && meeting.analysis.decisions.length > 0 && (
                      <div>
                        <h3 className="flex items-center text-lg font-semibold text-white mb-3">
                          <CheckCircle className="h-5 w-5 mr-2 text-green-400" />
                          Decisions Made
                        </h3>
                        <ul className="space-y-2">
                          {meeting.analysis.decisions.map((decision, index) => (
                            <li key={index} className="flex items-start">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-400 mr-2 mt-2 flex-shrink-0" />
                              <span className="text-slate-300">{decision}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Next Steps */}
                    {meeting.analysis.nextSteps && meeting.analysis.nextSteps.length > 0 && (
                      <div>
                        <h3 className="flex items-center text-lg font-semibold text-white mb-3">
                          <Target className="h-5 w-5 mr-2 text-blue-400" />
                          Next Steps
                        </h3>
                        <ul className="space-y-2">
                          {meeting.analysis.nextSteps.map((step, index) => (
                            <li key={index} className="flex items-start">
                              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/30 mr-2 mt-0.5 flex-shrink-0">
                                <span className="text-xs text-blue-400">{index + 1}</span>
                              </div>
                              <span className="text-slate-300">{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'action-items' && meeting.analysis && (
                  <div className="h-full overflow-y-auto p-6">
                    <div className="space-y-3">
                      {meeting.analysis.actionItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-start justify-between p-4 bg-slate-800/40 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors"
                        >
                          <div className="flex items-start space-x-3 flex-1">
                            <input
                              type="checkbox"
                              checked={item.status === 'completed'}
                              readOnly
                              className="mt-1 rounded border-slate-600 bg-slate-800 text-purple-500 focus:ring-purple-500/50"
                            />
                            <div className="flex-1">
                              <p className="text-slate-200 font-medium mb-1">{item.description}</p>
                              {item.assignee && (
                                <p className="text-sm text-slate-400">Assigned to: {item.assignee}</p>
                              )}
                              {item.dueDate && (
                                <p className="text-sm text-slate-500 mt-1">
                                  Due: {formatDateTime(item.dueDate)}
                                </p>
                              )}
                            </div>
                          </div>
                          <span
                            className={`px-2 py-1 text-xs rounded-full font-medium ${
                              item.priority === 'high'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : item.priority === 'medium'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            }`}
                          >
                            {item.priority}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'comments' && (
                  <div className="h-full flex items-center justify-center p-6">
                    <div className="text-center text-slate-500">
                      <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Comments feature coming soon</p>
                    </div>
                  </div>
                )}

                {activeTab === 'clips' && (
                  <div className="h-full flex items-center justify-center p-6">
                    <div className="text-center text-slate-500">
                      <Scissors className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Clips feature coming soon</p>
                    </div>
                  </div>
                )}

                {activeTab === 'insights' && meeting.analysis && (
                  <div className="h-full overflow-y-auto p-6 space-y-6">
                    {/* Topics */}
                    <div>
                      <h3 className="flex items-center text-lg font-semibold text-white mb-3">
                        <MessageSquare className="h-5 w-5 mr-2 text-blue-400" />
                        Topics Discussed
                      </h3>
                      <div className="space-y-3">
                        {meeting.analysis.topics.map((topic, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-slate-800/40 border border-slate-700 rounded-lg"
                          >
                            <span className="text-slate-300 font-medium">{topic.name}</span>
                            <div className="flex items-center space-x-3">
                              <span className="text-sm text-slate-400">{topic.mentions} mentions</span>
                              <div className="w-24 bg-slate-700 rounded-full h-2">
                                <div
                                  className="bg-gradient-to-r from-purple-500 to-teal-500 h-2 rounded-full"
                                  style={{ width: `${topic.relevance * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Sentiment */}
                    <div>
                      <h3 className="flex items-center text-lg font-semibold text-white mb-3">
                        <TrendingUp className="h-5 w-5 mr-2 text-green-400" />
                        Sentiment Analysis
                      </h3>
                      <div className="p-6 bg-slate-800/40 border border-slate-700 rounded-lg">
                        <div className="text-center">
                          <div className="text-5xl mb-3">
                            {getSentimentEmoji(meeting.analysis.sentiment)}
                          </div>
                          <p className="text-lg text-slate-200 font-medium mb-2">
                            {meeting.analysis.sentiment > 0.6
                              ? 'Positive'
                              : meeting.analysis.sentiment > 0.2
                              ? 'Neutral'
                              : 'Negative'}
                          </p>
                          <div className="mt-4 bg-slate-700 rounded-full h-3">
                            <div
                              className={`h-3 rounded-full transition-all ${
                                meeting.analysis.sentiment > 0.6
                                  ? 'bg-emerald-500'
                                  : meeting.analysis.sentiment > 0.2
                                  ? 'bg-amber-500'
                                  : 'bg-red-500'
                              }`}
                              style={{ width: `${(meeting.analysis.sentiment + 1) * 50}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Attendee Stats */}
                    <div>
                      <h3 className="flex items-center text-lg font-semibold text-white mb-3">
                        <Users className="h-5 w-5 mr-2 text-purple-400" />
                        Participation
                      </h3>
                      <div className="space-y-2">
                        {meeting.attendees
                          .filter((a) => a.speakingTime && a.speakingTime > 0)
                          .sort((a, b) => (b.speakingTime || 0) - (a.speakingTime || 0))
                          .map((attendee) => (
                            <div
                              key={attendee.id}
                              className="flex items-center justify-between p-3 bg-slate-800/40 border border-slate-700 rounded-lg"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-teal-500 rounded-full flex items-center justify-center text-xs text-white font-medium">
                                  {attendee.name[0]}
                                </div>
                                <span className="text-slate-200">{attendee.name}</span>
                              </div>
                              <div className="flex items-center space-x-3">
                                <span className="text-sm text-slate-400">
                                  {formatDuration(attendee.speakingTime || 0)}
                                </span>
                                <div className="w-24 bg-slate-700 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-purple-500 to-teal-500 h-2 rounded-full"
                                    style={{
                                      width: `${
                                        ((attendee.speakingTime || 0) / meeting.duration) * 100
                                      }%`,
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardGlass>
          </div>
        </div>
      </main>
    </div>
  );
}
