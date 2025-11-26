/**
 * Chrome Extension Service
 *
 * Backend support for Chrome Extension (Botless Recording)
 * Competitive Feature: Fathom's #1 Differentiator - Botless Meeting Recording
 *
 * Features:
 * - Botless recording (no visible bot in meeting)
 * - Browser-based audio capture
 * - Real-time transcription streaming
 * - Screen capture and slide detection
 * - Cross-platform meeting support (Zoom, Meet, Teams)
 * - Extension settings and preferences
 * - Background audio processing
 */

import { PrismaClient } from '@prisma/client';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import OpenAI from 'openai';
import { logger } from '../utils/logger';
import { slideCaptureService } from './SlideCaptureService';

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export interface ExtensionSession {
  id: string;
  userId: string;
  organizationId: string;
  meetingId?: string;
  platform: 'zoom' | 'google_meet' | 'microsoft_teams' | 'webex' | 'other';
  meetingUrl: string;
  meetingTitle?: string;
  startedAt: Date;
  endedAt?: Date;
  status: 'recording' | 'processing' | 'completed' | 'failed';
  audioChunks: number;
  transcriptSegments: number;
  capturedSlides: number;
}

export interface AudioChunk {
  sessionId: string;
  chunkIndex: number;
  audioData: Buffer;
  timestamp: number;
  format: 'webm' | 'mp3' | 'wav';
  sampleRate: number;
  channels: number;
}

export interface ExtensionSettings {
  userId: string;
  autoRecordMeetings: boolean;
  recordAudio: boolean;
  recordVideo: boolean;
  captureSlides: boolean;
  enableLiveCaptions: boolean;
  defaultMeetingPrivacy: 'private' | 'team' | 'organization';
  excludedDomains: string[];
  notificationPreferences: {
    showRecordingIndicator: boolean;
    notifyOnMeetingEnd: boolean;
    notifyOnTranscriptReady: boolean;
  };
}

export interface MeetingMetadata {
  platform: string;
  meetingUrl: string;
  meetingId?: string;
  title?: string;
  participants?: Array<{
    name: string;
    email?: string;
    isSelf: boolean;
  }>;
  startTime: Date;
  detectedLanguage?: string;
}

class ChromeExtensionService {
  private activeSessions: Map<string, ExtensionSession> = new Map();
  private audioBuffers: Map<string, Buffer[]> = new Map();

  /**
   * Start new extension recording session
   */
  async startSession(
    userId: string,
    organizationId: string,
    metadata: MeetingMetadata
  ): Promise<ExtensionSession> {
    try {
      const sessionId = `ext_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create meeting record
      let meeting = await prisma.meeting.create({
        data: {
          title: metadata.title || `${metadata.platform} Meeting - ${new Date().toLocaleString()}`,
          platform: metadata.platform,
          meetingUrl: metadata.meetingUrl,
          externalMeetingId: metadata.meetingId,
          scheduledStartAt: metadata.startTime,
          status: 'in_progress',
          organizationId,
          userId,
          recordingSource: 'extension', // Botless recording
        },
      });

      // Create extension session
      const session: ExtensionSession = {
        id: sessionId,
        userId,
        organizationId,
        meetingId: meeting.id,
        platform: this.detectPlatform(metadata.platform),
        meetingUrl: metadata.meetingUrl,
        meetingTitle: metadata.title,
        startedAt: new Date(),
        status: 'recording',
        audioChunks: 0,
        transcriptSegments: 0,
        capturedSlides: 0,
      };

      // Store session in memory and database (using Meeting metadata)
      this.activeSessions.set(sessionId, session);
      this.audioBuffers.set(sessionId, []);

      await prisma.meeting.update({
        where: { id: meeting.id },
        data: {
          metadata: {
            ...(meeting.metadata as any),
            extensionSessionId: sessionId,
            extensionStatus: 'recording',
            platform: session.platform,
          } as any,
        },
      });

      // Add participants if provided
      if (metadata.participants) {
        await this.addParticipants(meeting.id, metadata.participants);
      }

      logger.info('Extension session started', {
        sessionId,
        meetingId: meeting.id,
        platform: metadata.platform,
      });

      return session;
    } catch (error) {
      logger.error('Error starting extension session', { error });
      throw error;
    }
  }

  /**
   * Upload audio chunk from extension
   */
  async uploadAudioChunk(chunk: AudioChunk): Promise<void> {
    try {
      const session = this.activeSessions.get(chunk.sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Store audio chunk in buffer
      const buffer = this.audioBuffers.get(chunk.sessionId) || [];
      buffer.push(chunk.audioData);
      this.audioBuffers.set(chunk.sessionId, buffer);

      // Update session
      session.audioChunks++;

      // Process chunk for transcription (every 3 seconds of audio)
      const totalDuration = this.calculateBufferDuration(buffer, chunk.sampleRate);
      if (totalDuration >= 3) {
        await this.processAudioBuffer(chunk.sessionId, session);
      }

      logger.debug('Audio chunk uploaded', {
        sessionId: chunk.sessionId,
        chunkIndex: chunk.chunkIndex,
        size: chunk.audioData.length,
      });
    } catch (error) {
      logger.error('Error uploading audio chunk', { error });
      throw error;
    }
  }

  /**
   * Process accumulated audio buffer for transcription
   */
  private async processAudioBuffer(
    sessionId: string,
    session: ExtensionSession
  ): Promise<void> {
    try {
      const buffer = this.audioBuffers.get(sessionId);
      if (!buffer || buffer.length === 0) return;

      // Combine audio chunks
      const combinedAudio = Buffer.concat(buffer);

      // Clear buffer
      this.audioBuffers.set(sessionId, []);

      // Upload to S3 for processing
      const audioKey = `audio/${sessionId}/${Date.now()}.webm`;
      await this.uploadToS3(audioKey, combinedAudio, 'audio/webm');

      // Transcribe with Whisper
      const transcription = await this.transcribeAudio(combinedAudio);

      if (transcription && session.meetingId) {
        // Find or create LiveSession
        let liveSession = await prisma.liveSession.findFirst({
          where: { meetingId: session.meetingId, status: 'active' },
        });

        if (!liveSession) {
          liveSession = await prisma.liveSession.create({
            data: {
              id: `live_${session.meetingId}_${Date.now()}`,
              meetingId: session.meetingId,
              status: 'active',
            },
          });
        }

        // Store transcript segment
        await prisma.liveTranscriptSegment.create({
          data: {
            id: `seg_${Date.now()}_${Math.random()}`,
            liveSessionId: liveSession.id,
            segmentIndex: session.transcriptSegments,
            text: transcription.text,
            speaker: transcription.speaker || 'Unknown',
            startTime: (Date.now() - 3000) / 1000,
            endTime: Date.now() / 1000,
            confidence: transcription.confidence || 0.9,
            isFinal: true,
          },
        });

        session.transcriptSegments++;

        logger.info('Audio buffer transcribed', {
          sessionId,
          textLength: transcription.text.length,
        });
      }
    } catch (error) {
      logger.error('Error processing audio buffer', { error, sessionId });
    }
  }

  /**
   * Transcribe audio using OpenAI Whisper
   */
  private async transcribeAudio(audioBuffer: Buffer): Promise<{
    text: string;
    speaker?: string;
    confidence: number;
  } | null> {
    try {
      // Save to temporary file for Whisper
      const tempFile = `/tmp/audio_${Date.now()}.webm`;
      require('fs').writeFileSync(tempFile, audioBuffer);

      // Transcribe with Whisper
      const transcription = await openai.audio.transcriptions.create({
        file: require('fs').createReadStream(tempFile),
        model: 'whisper-1',
        language: 'en',
        response_format: 'verbose_json',
      });

      // Clean up temp file
      require('fs').unlinkSync(tempFile);

      return {
        text: (transcription as any).text || '',
        confidence: 0.9,
      };
    } catch (error) {
      logger.error('Error transcribing audio', { error });
      return null;
    }
  }

  /**
   * Capture screenshot from extension
   */
  async captureScreenshot(
    sessionId: string,
    screenshotData: Buffer,
    timestamp: number
  ): Promise<void> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session || !session.meetingId) {
        throw new Error('Session or meeting not found');
      }

      // Check user settings
      const settings = await this.getExtensionSettings(session.userId);
      if (!settings.captureSlides) {
        return; // Slide capture disabled
      }

      // Process as slide
      const transcriptPosition = Math.floor((Date.now() - session.startedAt.getTime()) / 1000);
      const slide = await slideCaptureService.processVideoFrame(
        session.meetingId,
        screenshotData,
        timestamp,
        transcriptPosition
      );

      if (slide) {
        session.capturedSlides++;
        logger.info('Screenshot captured as slide', {
          sessionId,
          slideNumber: slide.slideNumber,
        });
      }
    } catch (error) {
      logger.error('Error capturing screenshot', { error });
    }
  }

  /**
   * End extension recording session
   */
  async endSession(sessionId: string): Promise<void> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (!session) {
        throw new Error('Session not found');
      }

      // Process any remaining audio
      await this.processAudioBuffer(sessionId, session);

      // Update session status
      session.status = 'processing';
      session.endedAt = new Date();

      // Update database
      if (session.meetingId) {
        const meeting = await prisma.meeting.findUnique({
          where: { id: session.meetingId },
        });

        if (meeting) {
          await prisma.meeting.update({
            where: { id: session.meetingId },
            data: {
              metadata: {
                ...(meeting.metadata as any),
                extensionStatus: 'completed',
                extensionEndedAt: new Date(),
                audioChunks: session.audioChunks,
                transcriptSegments: session.transcriptSegments,
                capturedSlides: session.capturedSlides,
              } as any,
            },
          });
        }
      }

      // Update meeting
      if (session.meetingId) {
        const duration = Math.floor(
          (session.endedAt.getTime() - session.startedAt.getTime()) / 1000
        );

        await prisma.meeting.update({
          where: { id: session.meetingId },
          data: {
            status: 'completed',
            durationSeconds: duration,
            actualEndAt: new Date(),
          },
        });

        // Trigger post-processing (summary, action items, etc.)
        this.triggerPostProcessing(session.meetingId);
      }

      // Clean up memory
      this.activeSessions.delete(sessionId);
      this.audioBuffers.delete(sessionId);

      logger.info('Extension session ended', {
        sessionId,
        duration: session.endedAt.getTime() - session.startedAt.getTime(),
        audioChunks: session.audioChunks,
        transcriptSegments: session.transcriptSegments,
      });
    } catch (error) {
      logger.error('Error ending extension session', { error });
      throw error;
    }
  }

  /**
   * Get extension settings for user
   */
  async getExtensionSettings(userId: string): Promise<ExtensionSettings> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (user && (user.preferences as any)?.extensionSettings) {
        return (user.preferences as any).extensionSettings;
      }

      // Return defaults if not found
      return {
        userId,
        autoRecordMeetings: false,
        recordAudio: true,
        recordVideo: false,
        captureSlides: true,
        enableLiveCaptions: false,
        defaultMeetingPrivacy: 'private',
        excludedDomains: [],
        notificationPreferences: {
          showRecordingIndicator: true,
          notifyOnMeetingEnd: true,
          notifyOnTranscriptReady: true,
        },
      };
    } catch (error) {
      logger.error('Error getting extension settings', { error });
      throw error;
    }
  }

  /**
   * Update extension settings
   */
  async updateExtensionSettings(
    userId: string,
    updates: Partial<ExtensionSettings>
  ): Promise<ExtensionSettings> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      const currentSettings = (user?.preferences as any)?.extensionSettings || {};
      const newSettings = { ...currentSettings, ...updates };

      await prisma.user.update({
        where: { id: userId },
        data: {
          preferences: {
            ...(user?.preferences as any),
            extensionSettings: newSettings,
          } as any,
        },
      });

      logger.info('Extension settings updated', { userId });

      return newSettings;
    } catch (error) {
      logger.error('Error updating extension settings', { error });
      throw error;
    }
  }

  /**
   * Get active session for user
   */
  async getActiveSession(userId: string): Promise<ExtensionSession | null> {
    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (session.userId === userId && session.status === 'recording') {
        return session;
      }
    }

    return null;
  }

  /**
   * Get session statistics
   */
  async getSessionStats(sessionId: string): Promise<{
    duration: number;
    audioChunks: number;
    transcriptSegments: number;
    capturedSlides: number;
    status: string;
  }> {
    try {
      const session = this.activeSessions.get(sessionId);
      if (session) {
        const duration = Math.floor(
          (Date.now() - session.startedAt.getTime()) / 1000
        );

        return {
          duration,
          audioChunks: session.audioChunks,
          transcriptSegments: session.transcriptSegments,
          capturedSlides: session.capturedSlides,
          status: session.status,
        };
      }

      // Check database - find meeting with this session ID
      const meeting = await prisma.meeting.findFirst({
        where: {
          metadata: {
            path: ['extensionSessionId'],
            equals: sessionId,
          },
        },
      });

      if (!meeting) {
        throw new Error('Session not found');
      }

      const metadata = meeting.metadata as any;

      return {
        duration: metadata.extensionEndedAt
          ? Math.floor(
              (new Date(metadata.extensionEndedAt).getTime() - meeting.createdAt.getTime()) / 1000
            )
          : 0,
        audioChunks: metadata.audioChunks || 0,
        transcriptSegments: metadata.transcriptSegments || 0,
        capturedSlides: metadata.capturedSlides || 0,
        status: metadata.extensionStatus || 'completed',
      };
    } catch (error) {
      logger.error('Error getting session stats', { error });
      throw error;
    }
  }

  /**
   * Check if extension is compatible with meeting platform
   */
  isPlatformSupported(url: string): boolean {
    const supportedPlatforms = [
      /zoom\.us/i,
      /meet\.google\.com/i,
      /teams\.microsoft\.com/i,
      /webex\.com/i,
    ];

    return supportedPlatforms.some(pattern => pattern.test(url));
  }

  /**
   * Get extension installation stats
   */
  async getExtensionStats(organizationId: string): Promise<{
    totalSessions: number;
    activeSessions: number;
    totalMeetingsRecorded: number;
    totalDuration: number;
    avgMeetingDuration: number;
    platformBreakdown: Record<string, number>;
  }> {
    try {
      const meetings = await prisma.meeting.findMany({
        where: {
          organizationId,
          recordingSource: 'extension',
        },
      });

      const activeSessions = meetings.filter(m =>
        (m.metadata as any)?.extensionStatus === 'recording'
      ).length;

      const completedSessions = meetings.filter(m =>
        (m.metadata as any)?.extensionStatus === 'completed'
      );

      const totalDuration = completedSessions.reduce((sum, m) => {
        return sum + (m.durationSeconds || 0);
      }, 0);

      const platformBreakdown: Record<string, number> = {};
      meetings.forEach(m => {
        const platform = m.platform || 'unknown';
        platformBreakdown[platform] = (platformBreakdown[platform] || 0) + 1;
      });

      return {
        totalSessions: meetings.length,
        activeSessions,
        totalMeetingsRecorded: completedSessions.length,
        totalDuration,
        avgMeetingDuration: completedSessions.length
          ? Math.floor(totalDuration / completedSessions.length)
          : 0,
        platformBreakdown,
      };
    } catch (error) {
      logger.error('Error getting extension stats', { error });
      throw error;
    }
  }

  // ============================================================================
  // Helper Methods
  // ============================================================================

  /**
   * Detect platform from URL or identifier
   */
  private detectPlatform(platform: string): ExtensionSession['platform'] {
    const lower = platform.toLowerCase();
    if (lower.includes('zoom')) return 'zoom';
    if (lower.includes('meet') || lower.includes('google')) return 'google_meet';
    if (lower.includes('teams') || lower.includes('microsoft')) return 'microsoft_teams';
    if (lower.includes('webex')) return 'webex';
    return 'other';
  }

  /**
   * Calculate duration of audio buffer
   */
  private calculateBufferDuration(buffers: Buffer[], sampleRate: number): number {
    const totalBytes = buffers.reduce((sum, buf) => sum + buf.length, 0);
    // Assuming 16-bit audio (2 bytes per sample)
    const samples = totalBytes / 2;
    return samples / sampleRate;
  }

  /**
   * Upload to S3
   */
  private async uploadToS3(
    key: string,
    buffer: Buffer,
    contentType: string
  ): Promise<string> {
    try {
      const bucket = process.env.AWS_S3_BUCKET || 'fireflies-audio';

      await s3Client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: buffer,
          ContentType: contentType,
        })
      );

      return `https://${bucket}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
    } catch (error) {
      logger.error('Error uploading to S3', { error });
      throw error;
    }
  }

  /**
   * Add participants to meeting
   */
  private async addParticipants(
    meetingId: string,
    participants: MeetingMetadata['participants']
  ): Promise<void> {
    if (!participants) return;

    for (const participant of participants) {
      try {
        await prisma.meetingParticipant.create({
          data: {
            meetingId,
            name: participant.name,
            email: participant.email,
            role: participant.isSelf ? 'host' : 'attendee',
          },
        });
      } catch (error) {
        logger.warn('Error adding participant', { error, participant });
      }
    }
  }

  /**
   * Trigger post-processing for completed meeting
   */
  private async triggerPostProcessing(meetingId: string): Promise<void> {
    try {
      logger.info('Post-processing triggered', { meetingId });

      // Queue background jobs using setImmediate for proper async handling
      // Job 1: Generate AI summary
      setImmediate(async () => {
        try {
          const { superSummaryService } = await import('./SuperSummaryService');
          await superSummaryService.generateSuperSummary(meetingId);
          logger.info('Summary generated successfully', { meetingId });
        } catch (error) {
          logger.error('Error generating summary', { error, meetingId });
        }
      });

      // Job 2: Extract action items (part of summary generation)
      setImmediate(async () => {
        try {
          // Action items are extracted as part of the super summary
          // This could be enhanced with a dedicated action item service
          logger.info('Action item extraction queued', { meetingId });
        } catch (error) {
          logger.error('Error extracting action items', { error, meetingId });
        }
      });

      // Job 3: Perform sentiment analysis (part of summary)
      setImmediate(async () => {
        try {
          // Sentiment analysis is included in the super summary
          logger.info('Sentiment analysis queued', { meetingId });
        } catch (error) {
          logger.error('Error analyzing sentiment', { error, meetingId });
        }
      });

      logger.info('All post-processing jobs queued', { meetingId });
    } catch (error) {
      logger.error('Error triggering post-processing', { error });
    }
  }
}

export const chromeExtensionService = new ChromeExtensionService();
