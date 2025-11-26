/**
 * SMS Service
 * Twilio-based SMS delivery for notifications
 */

import twilio from 'twilio';
import winston from 'winston';
import { PrismaClient } from '@prisma/client';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: { service: 'sms-service' },
  transports: [new winston.transports.Console()],
});

const prisma = new PrismaClient();

export interface SMSOptions {
  to: string | string[];
  from?: string;
  mediaUrl?: string[];
  statusCallback?: string;
  metadata?: Record<string, any>;
}

export enum SMSTemplateType {
  VERIFICATION_CODE = 'verification_code',
  PASSWORD_RESET = 'password_reset',
  MEETING_REMINDER = 'meeting_reminder',
  MEETING_STARTED = 'meeting_started',
  RECORDING_READY = 'recording_ready',
  SECURITY_ALERT = 'security_alert',
  QUOTA_WARNING = 'quota_warning',
  PAYMENT_REMINDER = 'payment_reminder',
}

export class SmsService {
  private twilioClient: twilio.Twilio | null = null;
  private fromNumber: string;
  private readonly appName: string = 'Fireflies';
  private readonly appUrl: string;

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    
    if (accountSid && authToken) {
      this.twilioClient = twilio(accountSid, authToken);
    } else {
      logger.warn('Twilio credentials not configured');
    }

    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || '';
    this.appUrl = process.env.WEB_URL || 'http://localhost:3000';
  }

  /**
   * Send SMS message
   */
  async sendSMS(
    message: string,
    options: SMSOptions
  ): Promise<boolean> {
    try {
      if (!this.twilioClient) {
        logger.error('Twilio client not initialized');
        return false;
      }

      const recipients = Array.isArray(options.to) ? options.to : [options.to];
      const fromNumber = options.from || this.fromNumber;

      for (const recipient of recipients) {
        try {
          const formattedNumber = this.formatPhoneNumber(recipient);
          
          const result = await this.twilioClient.messages.create({
            body: message,
            from: fromNumber,
            to: formattedNumber,
            mediaUrl: options.mediaUrl,
            statusCallback: options.statusCallback,
          });

          logger.info('SMS sent successfully', {
            to: formattedNumber,
            messageId: result.sid,
          });

          // Log SMS event
          await this.logSMSEvent({
            to: formattedNumber,
            message: message.substring(0, 50),
            status: 'sent',
            messageId: result.sid,
            metadata: options.metadata,
          });
        } catch (error) {
          logger.error('Failed to send SMS to recipient:', { recipient, error });
          
          await this.logSMSEvent({
            to: recipient,
            message: message.substring(0, 50),
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            metadata: options.metadata,
          });
        }
      }

      return true;
    } catch (error) {
      logger.error('Failed to send SMS:', error);
      return false;
    }
  }

  /**
   * Send bulk SMS messages
   */
  async sendBulkSMS(
    message: string,
    recipients: string[]
  ): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    // Process in batches to avoid rate limits
    const batchSize = 10;
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      const results = await Promise.allSettled(
        batch.map(recipient => 
          this.sendSMS(message, { to: recipient })
        )
      );

      results.forEach(result => {
        if (result.status === 'fulfilled' && result.value) {
          sent++;
        } else {
          failed++;
        }
      });

      // Add delay between batches
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    logger.info('Bulk SMS send completed', { sent, failed });

    return { sent, failed };
  }

  /**
   * Send verification code
   */
  async sendVerificationCode(
    phoneNumber: string,
    code: string
  ): Promise<boolean> {
    const message = this.getTemplate(SMSTemplateType.VERIFICATION_CODE, { code });
    return this.sendSMS(message, { to: phoneNumber });
  }

  /**
   * Send password reset code
   */
  async sendPasswordResetCode(
    phoneNumber: string,
    code: string
  ): Promise<boolean> {
    const message = this.getTemplate(SMSTemplateType.PASSWORD_RESET, { code });
    return this.sendSMS(message, { to: phoneNumber });
  }

  /**
   * Send meeting reminder
   */
  async sendMeetingReminder(
    phoneNumber: string,
    meeting: {
      title: string;
      startTime: Date;
      meetingUrl?: string;
    }
  ): Promise<boolean> {
    const message = this.getTemplate(SMSTemplateType.MEETING_REMINDER, {
      title: meeting.title,
      time: meeting.startTime.toLocaleTimeString(),
      url: meeting.meetingUrl,
    });

    return this.sendSMS(message, { to: phoneNumber });
  }

  /**
   * Send meeting started notification
   */
  async sendMeetingStartedNotification(
    phoneNumber: string,
    meeting: {
      title: string;
      joinUrl: string;
    }
  ): Promise<boolean> {
    const message = this.getTemplate(SMSTemplateType.MEETING_STARTED, {
      title: meeting.title,
      url: meeting.joinUrl,
    });

    return this.sendSMS(message, { to: phoneNumber });
  }

  /**
   * Send recording ready notification
   */
  async sendRecordingReadyNotification(
    phoneNumber: string,
    recording: {
      meetingTitle: string;
      viewUrl: string;
    }
  ): Promise<boolean> {
    const message = this.getTemplate(SMSTemplateType.RECORDING_READY, {
      title: recording.meetingTitle,
      url: recording.viewUrl,
    });

    return this.sendSMS(message, { to: phoneNumber });
  }

  /**
   * Send security alert
   */
  async sendSecurityAlert(
    phoneNumber: string,
    alert: {
      type: string;
      description: string;
    }
  ): Promise<boolean> {
    const message = this.getTemplate(SMSTemplateType.SECURITY_ALERT, {
      type: alert.type,
      description: alert.description,
    });

    return this.sendSMS(message, { to: phoneNumber });
  }

  /**
   * Send quota warning
   */
  async sendQuotaWarning(
    phoneNumber: string,
    quota: {
      used: number;
      limit: number;
      percentage: number;
    }
  ): Promise<boolean> {
    const message = this.getTemplate(SMSTemplateType.QUOTA_WARNING, {
      percentage: quota.percentage,
      used: quota.used,
      limit: quota.limit,
    });

    return this.sendSMS(message, { to: phoneNumber });
  }

  /**
   * Send payment reminder
   */
  async sendPaymentReminder(
    phoneNumber: string,
    payment: {
      amount: number;
      dueDate: Date;
    }
  ): Promise<boolean> {
    const message = this.getTemplate(SMSTemplateType.PAYMENT_REMINDER, {
      amount: payment.amount,
      dueDate: payment.dueDate.toLocaleDateString(),
    });

    return this.sendSMS(message, { to: phoneNumber });
  }

  /**
   * Get SMS template
   */
  private getTemplate(
    type: SMSTemplateType,
    data: Record<string, any>
  ): string {
    const templates: Record<SMSTemplateType, (data: any) => string> = {
      [SMSTemplateType.VERIFICATION_CODE]: (data) =>
        `${this.appName}: Your verification code is ${data.code}. Valid for 10 minutes.`,

      [SMSTemplateType.PASSWORD_RESET]: (data) =>
        `${this.appName}: Your password reset code is ${data.code}. Valid for 30 minutes.`,

      [SMSTemplateType.MEETING_REMINDER]: (data) =>
        `${this.appName}: Meeting "${data.title}" starts at ${data.time}. ${data.url ? `Join: ${data.url}` : ''}`,

      [SMSTemplateType.MEETING_STARTED]: (data) =>
        `${this.appName}: Meeting "${data.title}" has started. Join now: ${data.url}`,

      [SMSTemplateType.RECORDING_READY]: (data) =>
        `${this.appName}: Recording for "${data.title}" is ready. View: ${data.url}`,

      [SMSTemplateType.SECURITY_ALERT]: (data) =>
        `${this.appName} Security Alert: ${data.type}. ${data.description}`,

      [SMSTemplateType.QUOTA_WARNING]: (data) =>
        `${this.appName}: You've used ${data.percentage}% of your quota (${data.used}/${data.limit}). Upgrade to continue.`,

      [SMSTemplateType.PAYMENT_REMINDER]: (data) =>
        `${this.appName}: Payment of $${data.amount} is due on ${data.dueDate}. Update billing to avoid service interruption.`,
    };

    return templates[type](data);
  }

  /**
   * Format phone number to E.164 format
   */
  private formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-numeric characters
    let cleaned = phoneNumber.replace(/\D/g, '');

    // Add country code if not present (assuming US for now)
    if (cleaned.length === 10) {
      cleaned = '1' + cleaned;
    }

    // Add + prefix
    if (!cleaned.startsWith('+')) {
      cleaned = '+' + cleaned;
    }

    return cleaned;
  }

  /**
   * Validate phone number
   */
  async validatePhoneNumber(phoneNumber: string): Promise<boolean> {
    try {
      if (!this.twilioClient) {
        return false;
      }

      const formatted = this.formatPhoneNumber(phoneNumber);
      const lookup = await this.twilioClient.lookups.v1
        .phoneNumbers(formatted)
        .fetch();

      return lookup.phoneNumber !== null;
    } catch (error) {
      logger.error('Phone number validation failed:', error);
      return false;
    }
  }

  /**
   * Get SMS status
   */
  async getSMSStatus(messageSid: string): Promise<string | null> {
    try {
      if (!this.twilioClient) {
        return null;
      }

      const message = await this.twilioClient.messages(messageSid).fetch();
      return message.status;
    } catch (error) {
      logger.error('Failed to get SMS status:', error);
      return null;
    }
  }

  /**
   * Get SMS delivery report
   */
  async getDeliveryReport(
    startDate: Date,
    endDate: Date
  ): Promise<Array<{
    to: string;
    status: string;
    dateSent: Date;
    errorCode?: string;
    errorMessage?: string;
  }>> {
    try {
      if (!this.twilioClient) {
        return [];
      }

      const messages = await this.twilioClient.messages.list({
        dateSentAfter: startDate,
        dateSentBefore: endDate,
        limit: 1000,
      });

      return messages.map(msg => ({
        to: msg.to,
        status: msg.status,
        dateSent: msg.dateSent || new Date(),
        errorCode: msg.errorCode?.toString(),
        errorMessage: msg.errorMessage,
      }));
    } catch (error) {
      logger.error('Failed to get delivery report:', error);
      return [];
    }
  }

  /**
   * Handle incoming SMS webhook
   */
  async handleIncomingSMS(data: {
    From: string;
    To: string;
    Body: string;
    MessageSid: string;
  }): Promise<void> {
    try {
      logger.info('Incoming SMS received', {
        from: data.From,
        to: data.To,
        messageId: data.MessageSid,
      });

      // Process incoming message based on content
      const body = data.Body.toLowerCase().trim();

      if (body === 'stop' || body === 'unsubscribe') {
        // Handle unsubscribe
        await this.handleUnsubscribe(data.From);
      } else if (body === 'help') {
        // Send help message
        await this.sendSMS(
          `${this.appName} Help: Reply STOP to unsubscribe. Visit ${this.appUrl}/help for more info.`,
          { to: data.From }
        );
      }

      // Log incoming message
      await this.logSMSEvent({
        to: data.To,
        from: data.From,
        message: data.Body.substring(0, 50),
        status: 'received',
        messageId: data.MessageSid,
      });
    } catch (error) {
      logger.error('Failed to handle incoming SMS:', error);
    }
  }

  /**
   * Handle unsubscribe request
   */
  private async handleUnsubscribe(phoneNumber: string): Promise<void> {
    try {
      // Update user preferences in database
      // This would be implemented based on your user model
      logger.info('User unsubscribed from SMS', { phoneNumber });

      // Send confirmation
      await this.sendSMS(
        `${this.appName}: You've been unsubscribed from SMS notifications.`,
        { to: phoneNumber }
      );
    } catch (error) {
      logger.error('Failed to handle unsubscribe:', error);
    }
  }

  /**
   * Log SMS event
   */
  private async logSMSEvent(event: {
    to: string;
    from?: string;
    message: string;
    status: string;
    messageId?: string;
    error?: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      // In production, log to database
      logger.info('SMS event', event);
    } catch (error) {
      logger.error('Failed to log SMS event:', error);
    }
  }

  /**
   * Calculate SMS segments
   */
  calculateSegments(message: string): number {
    const length = message.length;
    
    // GSM 7-bit encoding
    if (this.isGSM7Bit(message)) {
      if (length <= 160) return 1;
      return Math.ceil(length / 153);
    }
    
    // Unicode encoding
    if (length <= 70) return 1;
    return Math.ceil(length / 67);
  }

  /**
   * Check if message uses GSM 7-bit encoding
   */
  private isGSM7Bit(message: string): boolean {
    const gsm7BitChars = /^[@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !"#¤%&'()*+,\-.\/0-9:;<=>?¡A-Z\[\\Ñ§¿a-z{|}~\]ÄÖÜäöüàÀ€]*$/;
    return gsm7BitChars.test(message);
  }

  /**
   * Get SMS pricing estimate
   */
  async getPricingEstimate(
    phoneNumber: string,
    messageLength: number
  ): Promise<{ segments: number; estimatedCost: number } | null> {
    try {
      if (!this.twilioClient) {
        return null;
      }

      const segments = this.calculateSegments('x'.repeat(messageLength));
      
      // Get country-specific pricing
      const formatted = this.formatPhoneNumber(phoneNumber);
      const lookup = await this.twilioClient.lookups.v1
        .phoneNumbers(formatted)
        .fetch();

      // Default pricing (would be fetched from Twilio pricing API)
      const pricePerSegment = 0.0075; // USD
      const estimatedCost = segments * pricePerSegment;

      return { segments, estimatedCost };
    } catch (error) {
      logger.error('Failed to get pricing estimate:', error);
      return null;
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      if (!this.twilioClient) {
        logger.warn('Twilio client not initialized');
        return false;
      }

      // Test API connection
      await this.twilioClient.api.accounts.list({ limit: 1 });
      return true;
    } catch (error) {
      logger.error('SMS service health check failed:', error);
      return false;
    }
  }
}
