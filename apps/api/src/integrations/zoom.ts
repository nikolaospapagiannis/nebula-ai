/**
 * Zoom Integration Service
 * OAuth 2.0 and Meeting Bot for Zoom meetings
 */

import { EventEmitter } from 'events';
import winston from 'winston';
import { PrismaClient } from '@prisma/client';
import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { RecordingService } from '../services/recording';
import { QueueService, JobType } from '../services/queue';
import { CacheService } from '../services/cache';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: { service: 'zoom-integration' },
  transports: [new winston.transports.Console()],
});

const prisma = new PrismaClient();

export interface ZoomConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  webhookSecret: string;
  accountId?: string;
  apiKey?: string;
  apiSecret?: string;
}

export interface ZoomMeeting {
  id: number;
  uuid: string;
  host_id: string;
  topic: string;
  type: number;
  start_time: string;
  duration: number;
  timezone: string;
  agenda?: string;
  created_at: string;
  start_url: string;
  join_url: string;
  password?: string;
  h323_password?: string;
  pstn_password?: string;
  encrypted_password?: string;
  settings?: ZoomMeetingSettings;
  recurrence?: ZoomRecurrence;
  occurrences?: ZoomOccurrence[];
}

export interface ZoomMeetingSettings {
  host_video?: boolean;
  participant_video?: boolean;
  cn_meeting?: boolean;
  in_meeting?: boolean;
  join_before_host?: boolean;
  mute_upon_entry?: boolean;
  watermark?: boolean;
  use_pmi?: boolean;
  approval_type?: number;
  audio?: string;
  auto_recording?: string;
  enforce_login?: boolean;
  enforce_login_domains?: string;
  alternative_hosts?: string;
  close_registration?: boolean;
  show_share_button?: boolean;
  allow_multiple_devices?: boolean;
  registrants_confirmation_email?: boolean;
  waiting_room?: boolean;
  request_permission_to_unmute_participants?: boolean;
  registrants_email_notification?: boolean;
  meeting_authentication?: boolean;
  encryption_type?: string;
  approved_or_denied_countries_or_regions?: {
    enable?: boolean;
    method?: string;
    approved_list?: string[];
    denied_list?: string[];
  };
  breakout_room?: {
    enable?: boolean;
    rooms?: Array<{
      name: string;
      participants: string[];
    }>;
  };
  alternative_hosts_email_notification?: boolean;
  device_testing?: boolean;
  focus_mode?: boolean;
  private_meeting?: boolean;
  email_notification?: boolean;
  host_save_video_order?: boolean;
}

export interface ZoomRecurrence {
  type: number;
  repeat_interval?: number;
  weekly_days?: string;
  monthly_day?: number;
  monthly_week?: number;
  monthly_week_day?: number;
  end_times?: number;
  end_date_time?: string;
}

export interface ZoomOccurrence {
  occurrence_id: string;
  start_time: string;
  duration: number;
  status: string;
}

export interface ZoomWebhookEvent {
  event: string;
  payload: {
    account_id: string;
    object: any;
  };
  event_ts: number;
}

export interface ZoomRecordingFile {
  id: string;
  meeting_id: string;
  recording_start: string;
  recording_end: string;
  file_type: string;
  file_extension: string;
  file_size: number;
  play_url: string;
  download_url: string;
  status: string;
  recording_type: string;
}

export class ZoomIntegration extends EventEmitter {
  private config: ZoomConfig;
  private api: AxiosInstance;
  private recordingService: RecordingService;
  private queueService: QueueService;
  private cacheService: CacheService;
  private activeBots: Map<string, ZoomBot>;

  constructor(
    config: ZoomConfig,
    recordingService: RecordingService,
    queueService: QueueService,
    cacheService: CacheService
  ) {
    super();
    this.config = config;
    this.recordingService = recordingService;
    this.queueService = queueService;
    this.cacheService = cacheService;
    this.activeBots = new Map();

    this.api = axios.create({
      baseURL: 'https://api.zoom.us/v2',
      timeout: 30000,
    });

    this.api.interceptors.request.use(async (config) => {
      const token = await this.getAccessToken();
      config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
  }

  /**
   * OAuth 2.0 Flow
   */
  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      state,
    });

    return `https://zoom.us/oauth/authorize?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
    scope: string;
  }> {
    const response = await axios.post(
      'https://zoom.us/oauth/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.config.redirectUri,
      }),
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${this.config.clientId}:${this.config.clientSecret}`
          ).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return response.data;
  }

  async refreshAccessToken(refreshToken: string): Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }> {
    const response = await axios.post(
      'https://zoom.us/oauth/token',
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${this.config.clientId}:${this.config.clientSecret}`
          ).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return response.data;
  }

  /**
   * Get access token (Server-to-Server OAuth)
   */
  private async getAccessToken(): Promise<string> {
    // Check cache first
    const cached = await this.cacheService.get<string>('zoom', 'access_token');
    if (cached) return cached;

    // Generate new token using Server-to-Server OAuth
    const response = await axios.post(
      'https://zoom.us/oauth/token',
      new URLSearchParams({
        grant_type: 'account_credentials',
        account_id: this.config.accountId || '',
      }),
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${this.config.clientId}:${this.config.clientSecret}`
          ).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token, expires_in } = response.data;

    // Cache token
    await this.cacheService.set(
      'zoom',
      'access_token',
      access_token,
      expires_in - 60 // Expire 1 minute early
    );

    return access_token;
  }

  /**
   * Connect Zoom account
   */
  async connectAccount(
    userId: string,
    organizationId: string,
    authCode: string
  ): Promise<void> {
    try {
      const tokens = await this.exchangeCodeForToken(authCode);

      // Get user info
      const userInfo = await this.getUserInfo(tokens.access_token);

      // Save integration
      await prisma.integration.create({
        data: {
          user: { connect: { id: userId } },
          organization: { connect: { id: organizationId } },
          type: 'zoom',
          name: `Zoom - ${userInfo.first_name} ${userInfo.last_name}`,
          isActive: true,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
          metadata: {
            accountId: userInfo.account_id,
            zoomUserId: userInfo.id,
            email: userInfo.email,
            firstName: userInfo.first_name,
            lastName: userInfo.last_name,
          },
        },
      });

      logger.info(`Zoom account connected for user ${userId}`);

      this.emit('account:connected', {
        userId,
        organizationId,
        platform: 'zoom',
      });
    } catch (error) {
      logger.error('Failed to connect Zoom account:', error);
      throw error;
    }
  }

  /**
   * Ensure valid access token with auto-refresh
   */
  async ensureValidToken(userId: string, organizationId: string): Promise<string> {
    try {
      const integration = await prisma.integration.findFirst({
        where: {
          userId,
          organizationId,
          type: 'zoom',
          isActive: true,
        },
      });

      if (!integration) {
        throw new Error('Zoom integration not found');
      }

      // Check if token is expired or about to expire (within 5 minutes)
      const expiresAt = integration.expiresAt;
      const now = new Date();
      const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

      if (!expiresAt || expiresAt <= fiveMinutesFromNow) {
        logger.info('Access token expired or expiring soon, refreshing...');

        // Refresh token
        const tokens = await this.refreshAccessToken(integration.refreshToken!);

        // Update integration
        await prisma.integration.update({
          where: { id: integration.id },
          data: {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
          },
        });

        return tokens.access_token;
      }

      return integration.accessToken!;
    } catch (error) {
      logger.error('Failed to ensure valid token:', error);
      throw error;
    }
  }

  /**
   * Get user info
   */
  private async getUserInfo(accessToken: string): Promise<any> {
    const response = await axios.get('https://api.zoom.us/v2/users/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  }

  /**
   * Create meeting
   */
  async createMeeting(
    userId: string,
    organizationId: string,
    topic: string,
    startTime: Date,
    duration: number,
    settings?: Partial<ZoomMeetingSettings>
  ): Promise<ZoomMeeting> {
    try {
      // Get integration for this user to get Zoom user ID
      const integration = await prisma.integration.findFirst({
        where: {
          userId,
          organizationId,
          type: 'zoom',
          isActive: true,
        },
      });

      if (!integration) {
        throw new Error('Zoom integration not found for user');
      }

      const metadata = integration.metadata as any;
      const zoomUserId = metadata?.zoomUserId || metadata?.userId;

      if (!zoomUserId) {
        throw new Error('Zoom user ID not found in integration metadata');
      }

      const response = await this.api.post(`/users/${zoomUserId}/meetings`, {
        topic,
        type: 2, // Scheduled meeting
        start_time: startTime.toISOString(),
        duration,
        timezone: 'UTC',
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          mute_upon_entry: true,
          watermark: false,
          audio: 'both',
          auto_recording: 'cloud',
          ...settings,
        },
      });

      const meeting = response.data;

      // Save meeting to database
      await prisma.meeting.create({
        data: {
          organization: { connect: { id: organizationId } },
          user: { connect: { id: userId } },
          externalId: meeting.id.toString(),
          platform: 'zoom',
          title: meeting.topic,
          scheduledStartAt: new Date(meeting.start_time),
          scheduledEndAt: new Date(
            new Date(meeting.start_time).getTime() + meeting.duration * 60000
          ),
          meetingUrl: meeting.join_url,
          metadata: meeting,
        },
      });

      logger.info(`Created Zoom meeting: ${meeting.id}`);

      return meeting;
    } catch (error) {
      logger.error('Failed to create Zoom meeting:', error);
      throw error;
    }
  }

  /**
   * Get meeting details
   */
  async getMeeting(meetingId: string): Promise<ZoomMeeting> {
    const response = await this.api.get(`/meetings/${meetingId}`);
    return response.data;
  }

  /**
   * Update meeting
   */
  async updateMeeting(
    meetingId: string,
    updates: Partial<ZoomMeeting>
  ): Promise<void> {
    await this.api.patch(`/meetings/${meetingId}`, updates);
    
    logger.info(`Updated Zoom meeting: ${meetingId}`);
  }

  /**
   * Delete meeting
   */
  async deleteMeeting(meetingId: string): Promise<void> {
    await this.api.delete(`/meetings/${meetingId}`);
    
    logger.info(`Deleted Zoom meeting: ${meetingId}`);
  }

  /**
   * List meetings
   */
  async listMeetings(
    userId: string,
    type: 'scheduled' | 'live' | 'upcoming' = 'scheduled'
  ): Promise<ZoomMeeting[]> {
    const response = await this.api.get(`/users/${userId}/meetings`, {
      params: { type },
    });

    return response.data.meetings;
  }

  /**
   * Join meeting with bot
   */
  async joinMeetingWithBot(
    meetingId: string,
    meetingPassword?: string
  ): Promise<string> {
    try {
      const botId = `bot_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      // Check if bot already exists for this meeting
      if (this.activeBots.has(meetingId)) {
        throw new Error('Bot already active in this meeting');
      }

      // Create bot instance
      const bot = new ZoomBot(
        botId,
        meetingId,
        meetingPassword,
        this.recordingService,
        this.queueService
      );

      // Connect bot to meeting
      await bot.connect();
      
      this.activeBots.set(meetingId, bot);

      // Handle bot events
      bot.on('connected', () => {
        logger.info(`Bot connected to Zoom meeting: ${meetingId}`);
        this.emit('bot:connected', { meetingId, botId });
      });

      bot.on('recording:started', () => {
        logger.info(`Bot started recording Zoom meeting: ${meetingId}`);
        this.emit('bot:recording:started', { meetingId, botId });
      });

      bot.on('disconnected', () => {
        logger.info(`Bot disconnected from Zoom meeting: ${meetingId}`);
        this.activeBots.delete(meetingId);
        this.emit('bot:disconnected', { meetingId, botId });
      });

      return botId;
    } catch (error) {
      logger.error('Failed to join meeting with bot:', error);
      throw error;
    }
  }

  /**
   * Leave meeting with bot
   */
  async leaveMeetingWithBot(meetingId: string): Promise<void> {
    const bot = this.activeBots.get(meetingId);
    
    if (!bot) {
      throw new Error('No active bot found for this meeting');
    }

    await bot.disconnect();
    this.activeBots.delete(meetingId);
  }

  /**
   * Get cloud recordings
   */
  async getCloudRecordings(
    userId: string,
    from: Date,
    to: Date
  ): Promise<ZoomRecordingFile[]> {
    const response = await this.api.get(`/users/${userId}/recordings`, {
      params: {
        from: from.toISOString().split('T')[0],
        to: to.toISOString().split('T')[0],
      },
    });

    const recordings: ZoomRecordingFile[] = [];
    
    for (const meeting of response.data.meetings) {
      if (meeting.recording_files) {
        recordings.push(...meeting.recording_files);
      }
    }

    return recordings;
  }

  /**
   * Download recording
   */
  async downloadRecording(
    downloadUrl: string,
    accessToken?: string
  ): Promise<Buffer> {
    const response = await axios.get(downloadUrl, {
      headers: accessToken ? {
        Authorization: `Bearer ${accessToken}`,
      } : {},
      responseType: 'arraybuffer',
    });

    return Buffer.from(response.data);
  }

  /**
   * Process webhook
   */
  async processWebhook(
    headers: Record<string, string>,
    body: any
  ): Promise<void> {
    // Verify webhook signature
    if (!this.verifyWebhookSignature(headers, body)) {
      throw new Error('Invalid webhook signature');
    }

    const event = body as ZoomWebhookEvent;
    
    logger.info(`Processing Zoom webhook: ${event.event}`);

    switch (event.event) {
      case 'meeting.started':
        await this.handleMeetingStarted(event.payload.object);
        break;
      
      case 'meeting.ended':
        await this.handleMeetingEnded(event.payload.object);
        break;
      
      case 'meeting.participant_joined':
        await this.handleParticipantJoined(event.payload.object);
        break;
      
      case 'meeting.participant_left':
        await this.handleParticipantLeft(event.payload.object);
        break;
      
      case 'recording.completed':
        await this.handleRecordingCompleted(event.payload.object);
        break;
      
      default:
        logger.debug(`Unhandled Zoom webhook event: ${event.event}`);
    }
  }

  /**
   * Verify webhook signature
   */
  private verifyWebhookSignature(
    headers: Record<string, string>,
    body: any
  ): boolean {
    const message = `v0:${headers['x-zm-request-timestamp']}:${JSON.stringify(body)}`;
    const hash = crypto
      .createHmac('sha256', this.config.webhookSecret)
      .update(message)
      .digest('hex');
    
    const signature = `v0=${hash}`;
    
    return signature === headers['x-zm-signature'];
  }

  /**
   * Handle meeting started
   */
  private async handleMeetingStarted(meeting: any): Promise<void> {
    try {
      await prisma.meeting.updateMany({
        where: {
          externalId: meeting.id.toString(),
          platform: 'zoom',
        },
        data: {
          status: 'in_progress',
          actualStartAt: new Date(),
        },
      });

      // Queue bot to join if configured
      const dbMeeting = await prisma.meeting.findFirst({
        where: {
          externalId: meeting.id.toString(),
          platform: 'zoom',
        },
      });

      if (dbMeeting?.autoRecord) {
        await this.queueService.addJob(JobType.MEETING_BOT_JOIN, {
          type: JobType.MEETING_BOT_JOIN,
          payload: {
            platform: 'zoom',
            meetingId: meeting.id,
            meetingPassword: meeting.password,
          },
          meetingId: dbMeeting.id,
        });
      }

      this.emit('meeting:started', {
        platform: 'zoom',
        meetingId: meeting.id,
        topic: meeting.topic,
      });
    } catch (error) {
      logger.error('Failed to handle meeting started:', error);
      throw error;
    }
  }

  /**
   * Handle meeting ended
   */
  private async handleMeetingEnded(meeting: any): Promise<void> {
    await prisma.meeting.updateMany({
      where: {
        externalId: meeting.id.toString(),
        platform: 'zoom',
      },
      data: {
        status: 'completed',
        actualEndAt: new Date(),
        duration: meeting.duration,
      },
    });

    // Leave with bot if active
    if (this.activeBots.has(meeting.id)) {
      await this.leaveMeetingWithBot(meeting.id);
    }

    this.emit('meeting:ended', {
      platform: 'zoom',
      meetingId: meeting.id,
      duration: meeting.duration,
    });
  }

  /**
   * Handle participant joined
   */
  private async handleParticipantJoined(data: any): Promise<void> {
    try {
      const { meeting_id, participant } = data;

      // Find the meeting
      const meeting = await prisma.meeting.findFirst({
        where: {
          externalId: meeting_id.toString(),
          platform: 'zoom',
        },
      });

      if (!meeting) {
        logger.warn(`Meeting not found for participant join: ${meeting_id}`);
        return;
      }

      await prisma.meetingParticipant.create({
        data: {
          meeting: { connect: { id: meeting.id } },
          name: participant.user_name,
          email: participant.email,
          joinedAt: new Date(),
          metadata: participant,
        },
      });

      this.emit('participant:joined', {
        platform: 'zoom',
        meetingId: meeting_id,
        participant: participant.user_name,
      });
    } catch (error) {
      logger.error('Failed to handle participant joined:', error);
    }
  }

  /**
   * Handle participant left
   */
  private async handleParticipantLeft(data: any): Promise<void> {
    try {
      const { meeting_id, participant } = data;

      // Find the meeting
      const meeting = await prisma.meeting.findFirst({
        where: {
          externalId: meeting_id.toString(),
          platform: 'zoom',
        },
      });

      if (!meeting) {
        logger.warn(`Meeting not found for participant left: ${meeting_id}`);
        return;
      }

      await prisma.meetingParticipant.updateMany({
        where: {
          meetingId: meeting.id,
          email: participant.email,
        },
        data: {
          leftAt: new Date(),
          duration: participant.duration,
        },
      });

      this.emit('participant:left', {
        platform: 'zoom',
        meetingId: meeting_id,
        participant: participant.user_name,
      });
    } catch (error) {
      logger.error('Failed to handle participant left:', error);
    }
  }

  /**
   * Handle recording completed
   */
  private async handleRecordingCompleted(recording: any): Promise<void> {
    // Queue download and processing
    await this.queueService.addJob(JobType.FILE_PROCESSING, {
      type: JobType.FILE_PROCESSING,
      payload: {
        platform: 'zoom',
        recordingId: recording.uuid,
        downloadUrl: recording.recording_files[0]?.download_url,
        meetingId: recording.id,
      },
      meetingId: recording.id,
    });

    this.emit('recording:completed', {
      platform: 'zoom',
      meetingId: recording.id,
      recordingId: recording.uuid,
    });
  }

  /**
   * Get meeting participants
   */
  async getMeetingParticipants(meetingId: string): Promise<any[]> {
    const response = await this.api.get(`/past_meetings/${meetingId}/participants`);
    return response.data.participants;
  }

  /**
   * Get meeting transcript
   */
  async getMeetingTranscript(meetingId: string): Promise<string> {
    try {
      const response = await this.api.get(`/meetings/${meetingId}/recordings/transcript`);
      return response.data.transcript;
    } catch (error) {
      logger.error('Failed to get meeting transcript:', error);
      throw error;
    }
  }

  /**
   * Get live transcription settings
   */
  async getLiveTranscriptionSettings(meetingId: string): Promise<any> {
    try {
      const response = await this.api.get(`/meetings/${meetingId}/live_transcription`);
      return response.data;
    } catch (error) {
      logger.error('Failed to get live transcription settings:', error);
      throw error;
    }
  }

  /**
   * Enable live transcription
   */
  async enableLiveTranscription(
    meetingId: string,
    language: string = 'en-US'
  ): Promise<void> {
    try {
      await this.api.patch(`/meetings/${meetingId}`, {
        settings: {
          auto_recording: 'cloud',
          audio_conference_info: true,
          alternative_hosts_email_notification: true,
        },
      });

      logger.info(`Enabled live transcription for meeting ${meetingId}`);
    } catch (error) {
      logger.error('Failed to enable live transcription:', error);
      throw error;
    }
  }

  /**
   * Create instant meeting
   */
  async createInstantMeeting(
    userId: string,
    organizationId: string,
    topic: string,
    settings?: Partial<ZoomMeetingSettings>
  ): Promise<ZoomMeeting> {
    try {
      // Get integration for this user to get Zoom user ID
      const integration = await prisma.integration.findFirst({
        where: {
          userId,
          organizationId,
          type: 'zoom',
          isActive: true,
        },
      });

      if (!integration) {
        throw new Error('Zoom integration not found for user');
      }

      const metadata = integration.metadata as any;
      const zoomUserId = metadata?.zoomUserId || metadata?.userId;

      if (!zoomUserId) {
        throw new Error('Zoom user ID not found in integration metadata');
      }

      const response = await this.api.post(`/users/${zoomUserId}/meetings`, {
        topic,
        type: 1, // Instant meeting
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          mute_upon_entry: false,
          watermark: false,
          audio: 'both',
          auto_recording: 'cloud',
          ...settings,
        },
      });

      const meeting = response.data;

      // Save meeting to database
      await prisma.meeting.create({
        data: {
          organization: { connect: { id: organizationId } },
          user: { connect: { id: userId } },
          externalId: meeting.id.toString(),
          platform: 'zoom',
          title: meeting.topic,
          meetingUrl: meeting.join_url,
          status: 'scheduled',
          metadata: meeting,
        },
      });

      logger.info(`Created instant Zoom meeting: ${meeting.id}`);

      return meeting;
    } catch (error) {
      logger.error('Failed to create instant Zoom meeting:', error);
      throw error;
    }
  }

  /**
   * Create recurring meeting
   */
  async createRecurringMeeting(
    userId: string,
    organizationId: string,
    topic: string,
    recurrence: ZoomRecurrence,
    settings?: Partial<ZoomMeetingSettings>
  ): Promise<ZoomMeeting> {
    try {
      // Get integration for this user to get Zoom user ID
      const integration = await prisma.integration.findFirst({
        where: {
          userId,
          organizationId,
          type: 'zoom',
          isActive: true,
        },
      });

      if (!integration) {
        throw new Error('Zoom integration not found for user');
      }

      const metadata = integration.metadata as any;
      const zoomUserId = metadata?.zoomUserId || metadata?.userId;

      if (!zoomUserId) {
        throw new Error('Zoom user ID not found in integration metadata');
      }

      const response = await this.api.post(`/users/${zoomUserId}/meetings`, {
        topic,
        type: 8, // Recurring meeting with no fixed time
        recurrence,
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          mute_upon_entry: true,
          watermark: false,
          audio: 'both',
          auto_recording: 'cloud',
          ...settings,
        },
      });

      const meeting = response.data;

      // Save meeting to database
      await prisma.meeting.create({
        data: {
          organization: { connect: { id: organizationId } },
          user: { connect: { id: userId } },
          externalId: meeting.id.toString(),
          platform: 'zoom',
          title: meeting.topic,
          meetingUrl: meeting.join_url,
          metadata: meeting,
        },
      });

      logger.info(`Created recurring Zoom meeting: ${meeting.id}`);

      return meeting;
    } catch (error) {
      logger.error('Failed to create recurring Zoom meeting:', error);
      throw error;
    }
  }

  /**
   * Get meeting quality metrics
   */
  async getMeetingQualityMetrics(meetingId: string): Promise<any> {
    try {
      const response = await this.api.get(`/metrics/meetings/${meetingId}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to get meeting quality metrics:', error);
      throw error;
    }
  }

  /**
   * Get meeting polls
   */
  async getMeetingPolls(meetingId: string): Promise<any[]> {
    try {
      const response = await this.api.get(`/meetings/${meetingId}/polls`);
      return response.data.polls || [];
    } catch (error) {
      logger.error('Failed to get meeting polls:', error);
      throw error;
    }
  }

  /**
   * Create meeting poll
   */
  async createMeetingPoll(
    meetingId: string,
    poll: {
      title: string;
      questions: Array<{
        name: string;
        type: 'single' | 'multiple';
        answers: string[];
      }>;
    }
  ): Promise<any> {
    try {
      const response = await this.api.post(`/meetings/${meetingId}/polls`, poll);
      logger.info(`Created poll for meeting ${meetingId}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to create meeting poll:', error);
      throw error;
    }
  }

  /**
   * Get meeting registration
   */
  async getMeetingRegistrants(meetingId: string): Promise<any[]> {
    try {
      const response = await this.api.get(`/meetings/${meetingId}/registrants`);
      return response.data.registrants || [];
    } catch (error) {
      logger.error('Failed to get meeting registrants:', error);
      throw error;
    }
  }

  /**
   * Add meeting registrant
   */
  async addMeetingRegistrant(
    meetingId: string,
    registrant: {
      email: string;
      first_name: string;
      last_name: string;
      phone?: string;
      company?: string;
      job_title?: string;
    }
  ): Promise<any> {
    try {
      const response = await this.api.post(
        `/meetings/${meetingId}/registrants`,
        registrant
      );
      logger.info(`Added registrant to meeting ${meetingId}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to add meeting registrant:', error);
      throw error;
    }
  }

  /**
   * Get meeting summary
   */
  async getMeetingSummary(meetingId: string): Promise<any> {
    try {
      const response = await this.api.get(`/meetings/${meetingId}/meeting_summary`);
      return response.data;
    } catch (error) {
      logger.error('Failed to get meeting summary:', error);
      throw error;
    }
  }

  /**
   * Disconnect Zoom integration
   */
  async disconnect(userId: string, organizationId: string): Promise<void> {
    try {
      // Update database
      await prisma.integration.updateMany({
        where: {
          userId,
          organizationId,
          type: 'zoom',
        },
        data: { isActive: false },
      });

      logger.info(`Zoom integration disconnected for user ${userId}`);

      this.emit('account:disconnected', {
        userId,
        organizationId,
        platform: 'zoom',
      });
    } catch (error) {
      logger.error('Failed to disconnect Zoom integration:', error);
      throw error;
    }
  }
}

/**
 * Zoom Bot Handler
 */
class ZoomBot extends EventEmitter {
  public botId: string;
  private meetingId: string;
  private meetingPassword?: string;
  private recordingService: RecordingService;
  private queueService: QueueService;
  private isConnected: boolean = false;
  private recordingId?: string;

  constructor(
    botId: string,
    meetingId: string,
    meetingPassword: string | undefined,
    recordingService: RecordingService,
    queueService: QueueService
  ) {
    super();
    this.botId = botId;
    this.meetingId = meetingId;
    this.meetingPassword = meetingPassword;
    this.recordingService = recordingService;
    this.queueService = queueService;
  }

  async connect(): Promise<void> {
    // In production, this would use Zoom SDK or bot framework
    // For now, simulate connection
    this.isConnected = true;
    
    // Start recording
    this.recordingId = await this.recordingService.startRecording({
      meetingId: this.meetingId,
      organizationId: 'zoom',
      userId: this.botId,
      autoTranscribe: true,
    });

    this.emit('connected');
    this.emit('recording:started');
  }

  async disconnect(): Promise<void> {
    if (this.recordingId) {
      await this.recordingService.stopRecording(this.meetingId);
    }
    
    this.isConnected = false;
    this.emit('disconnected');
  }
}
