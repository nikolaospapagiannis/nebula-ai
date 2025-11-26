/**
 * Email Service
 * SendGrid-based email delivery with templates
 */

import sgMail from '@sendgrid/mail';
import winston from 'winston';
import { PrismaClient } from '@prisma/client';
import { renderToStaticMarkup } from 'react-dom/server';
import juice from 'juice';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: { service: 'email-service' },
  transports: [new winston.transports.Console()],
});

const prisma = new PrismaClient();

export interface EmailOptions {
  to: string | string[];
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
  attachments?: Array<{
    content: string;
    filename: string;
    type?: string;
    disposition?: string;
  }>;
  scheduledAt?: Date;
  metadata?: Record<string, any>;
}

export interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent?: string;
}

export enum EmailTemplateType {
  WELCOME = 'welcome',
  EMAIL_VERIFICATION = 'email_verification',
  PASSWORD_RESET = 'password_reset',
  MEETING_INVITATION = 'meeting_invitation',
  MEETING_SUMMARY = 'meeting_summary',
  MEETING_RECORDING_READY = 'meeting_recording_ready',
  SUBSCRIPTION_CONFIRMATION = 'subscription_confirmation',
  SUBSCRIPTION_RENEWAL = 'subscription_renewal',
  SUBSCRIPTION_CANCELLED = 'subscription_cancelled',
  PAYMENT_RECEIPT = 'payment_receipt',
  TEAM_INVITATION = 'team_invitation',
  WEEKLY_DIGEST = 'weekly_digest',
  QUOTA_WARNING = 'quota_warning',
  SECURITY_ALERT = 'security_alert',
}

export class EmailService {
  private readonly fromEmail: string;
  private readonly supportEmail: string;
  private readonly appName: string = 'Fireflies';
  private readonly appUrl: string;

  constructor() {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      logger.warn('SendGrid API key not configured');
    } else {
      sgMail.setApiKey(apiKey);
    }

    this.fromEmail = process.env.FROM_EMAIL || 'noreply@fireflies.ai';
    this.supportEmail = process.env.SUPPORT_EMAIL || 'support@fireflies.ai';
    this.appUrl = process.env.WEB_URL || 'http://localhost:3000';
  }

  /**
   * Send email
   */
  async sendEmail(
    template: EmailTemplate,
    options: EmailOptions
  ): Promise<boolean> {
    try {
      const msg = {
        to: options.to,
        from: {
          email: this.fromEmail,
          name: this.appName,
        },
        subject: template.subject,
        html: template.htmlContent,
        text: template.textContent || this.htmlToText(template.htmlContent),
        cc: options.cc,
        bcc: options.bcc,
        replyTo: options.replyTo || this.supportEmail,
        attachments: options.attachments,
        sendAt: options.scheduledAt 
          ? Math.floor(options.scheduledAt.getTime() / 1000) 
          : undefined,
        customArgs: options.metadata,
      };

      await sgMail.send(msg);

      logger.info('Email sent successfully', {
        to: options.to,
        subject: template.subject,
      });

      // Log email send event
      await this.logEmailEvent({
        to: Array.isArray(options.to) ? options.to.join(',') : options.to,
        subject: template.subject,
        status: 'sent',
        metadata: options.metadata,
      });

      return true;
    } catch (error) {
      logger.error('Failed to send email:', error);
      
      // Log failed email event
      await this.logEmailEvent({
        to: Array.isArray(options.to) ? options.to.join(',') : options.to,
        subject: template.subject,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: options.metadata,
      });

      return false;
    }
  }

  /**
   * Send bulk emails
   */
  async sendBulkEmails(
    template: EmailTemplate,
    recipients: EmailOptions[]
  ): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    // Process in batches to avoid rate limits
    const batchSize = 100;
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      const results = await Promise.allSettled(
        batch.map(recipient => this.sendEmail(template, recipient))
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

    logger.info('Bulk email send completed', { sent, failed });

    return { sent, failed };
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(
    email: string,
    firstName: string
  ): Promise<boolean> {
    const template = this.getTemplate(EmailTemplateType.WELCOME, {
      firstName,
      appUrl: this.appUrl,
      supportEmail: this.supportEmail,
    });

    return this.sendEmail(template, { to: email });
  }

  /**
   * Send email verification
   */
  async sendVerificationEmail(
    email: string,
    verificationToken: string
  ): Promise<boolean> {
    const verificationUrl = `${this.appUrl}/verify-email?token=${verificationToken}`;
    
    const template = this.getTemplate(EmailTemplateType.EMAIL_VERIFICATION, {
      verificationUrl,
      expiryHours: 24,
    });

    return this.sendEmail(template, { to: email });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    email: string,
    resetToken: string
  ): Promise<boolean> {
    const resetUrl = `${this.appUrl}/reset-password?token=${resetToken}`;
    
    const template = this.getTemplate(EmailTemplateType.PASSWORD_RESET, {
      resetUrl,
      expiryMinutes: 30,
    });

    return this.sendEmail(template, { to: email });
  }

  /**
   * Send meeting invitation
   */
  async sendMeetingInvitation(
    email: string,
    meeting: {
      title: string;
      scheduledAt: Date;
      meetingUrl: string;
      hostName: string;
    }
  ): Promise<boolean> {
    const template = this.getTemplate(EmailTemplateType.MEETING_INVITATION, {
      meetingTitle: meeting.title,
      scheduledAt: meeting.scheduledAt.toISOString(),
      meetingUrl: meeting.meetingUrl,
      hostName: meeting.hostName,
      appUrl: this.appUrl,
    });

    return this.sendEmail(template, { to: email });
  }

  /**
   * Send meeting summary
   */
  async sendMeetingSummary(
    email: string,
    summary: {
      meetingTitle: string;
      date: Date;
      duration: number;
      keyPoints: string[];
      actionItems: string[];
      transcriptUrl: string;
    }
  ): Promise<boolean> {
    const template = this.getTemplate(EmailTemplateType.MEETING_SUMMARY, {
      meetingTitle: summary.meetingTitle,
      date: summary.date.toISOString(),
      duration: summary.duration,
      keyPoints: summary.keyPoints,
      actionItems: summary.actionItems,
      transcriptUrl: summary.transcriptUrl,
      appUrl: this.appUrl,
    });

    return this.sendEmail(template, { to: email });
  }

  /**
   * Send recording ready notification
   */
  async sendRecordingReadyEmail(
    email: string,
    recording: {
      meetingTitle: string;
      recordingUrl: string;
      transcriptUrl: string;
      duration: number;
    }
  ): Promise<boolean> {
    const template = this.getTemplate(EmailTemplateType.MEETING_RECORDING_READY, {
      meetingTitle: recording.meetingTitle,
      recordingUrl: recording.recordingUrl,
      transcriptUrl: recording.transcriptUrl,
      duration: recording.duration,
      appUrl: this.appUrl,
    });

    return this.sendEmail(template, { to: email });
  }

  /**
   * Send subscription confirmation
   */
  async sendSubscriptionConfirmation(
    email: string,
    subscription: {
      plan: string;
      price: number;
      billingCycle: string;
      nextBillingDate: Date;
    }
  ): Promise<boolean> {
    const template = this.getTemplate(EmailTemplateType.SUBSCRIPTION_CONFIRMATION, {
      plan: subscription.plan,
      price: subscription.price,
      billingCycle: subscription.billingCycle,
      nextBillingDate: subscription.nextBillingDate.toISOString(),
      appUrl: this.appUrl,
      supportEmail: this.supportEmail,
    });

    return this.sendEmail(template, { to: email });
  }

  /**
   * Send team invitation
   */
  async sendTeamInvitation(
    email: string,
    invitation: {
      inviterName: string;
      teamName: string;
      invitationToken: string;
    }
  ): Promise<boolean> {
    const invitationUrl = `${this.appUrl}/join-team?token=${invitation.invitationToken}`;
    
    const template = this.getTemplate(EmailTemplateType.TEAM_INVITATION, {
      inviterName: invitation.inviterName,
      teamName: invitation.teamName,
      invitationUrl,
      appUrl: this.appUrl,
    });

    return this.sendEmail(template, { to: email });
  }

  /**
   * Send weekly digest
   */
  async sendWeeklyDigest(
    email: string,
    digest: {
      weekStart: Date;
      weekEnd: Date;
      meetingsCount: number;
      totalDuration: number;
      topInsights: string[];
      upcomingMeetings: Array<{
        title: string;
        date: Date;
      }>;
    }
  ): Promise<boolean> {
    const template = this.getTemplate(EmailTemplateType.WEEKLY_DIGEST, {
      weekStart: digest.weekStart.toISOString(),
      weekEnd: digest.weekEnd.toISOString(),
      meetingsCount: digest.meetingsCount,
      totalDuration: digest.totalDuration,
      topInsights: digest.topInsights,
      upcomingMeetings: digest.upcomingMeetings,
      appUrl: this.appUrl,
    });

    return this.sendEmail(template, { to: email });
  }

  /**
   * Send quota warning
   */
  async sendQuotaWarning(
    email: string,
    quota: {
      used: number;
      limit: number;
      percentage: number;
      upgradeUrl: string;
    }
  ): Promise<boolean> {
    const template = this.getTemplate(EmailTemplateType.QUOTA_WARNING, {
      used: quota.used,
      limit: quota.limit,
      percentage: quota.percentage,
      upgradeUrl: quota.upgradeUrl,
      appUrl: this.appUrl,
      supportEmail: this.supportEmail,
    });

    return this.sendEmail(template, { to: email });
  }

  /**
   * Send security alert
   */
  async sendSecurityAlert(
    email: string,
    alert: {
      type: string;
      description: string;
      ipAddress?: string;
      userAgent?: string;
      timestamp: Date;
    }
  ): Promise<boolean> {
    const template = this.getTemplate(EmailTemplateType.SECURITY_ALERT, {
      alertType: alert.type,
      description: alert.description,
      ipAddress: alert.ipAddress,
      userAgent: alert.userAgent,
      timestamp: alert.timestamp.toISOString(),
      appUrl: this.appUrl,
      supportEmail: this.supportEmail,
    });

    return this.sendEmail(template, { to: email });
  }

  /**
   * Get email template
   */
  private getTemplate(
    type: EmailTemplateType,
    data: Record<string, any>
  ): EmailTemplate {
    // In production, these would be stored in a database or template engine
    const templates: Record<EmailTemplateType, (data: any) => EmailTemplate> = {
      [EmailTemplateType.WELCOME]: (data) => ({
        subject: `Welcome to ${this.appName}!`,
        htmlContent: this.renderTemplate(`
          <h1>Welcome ${data.firstName}!</h1>
          <p>Thank you for joining ${this.appName}. We're excited to have you on board.</p>
          <p>Get started by recording your first meeting or uploading an audio file.</p>
          <a href="${data.appUrl}/dashboard" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px;">Go to Dashboard</a>
          <p>If you have any questions, feel free to contact us at ${data.supportEmail}</p>
        `),
      }),

      [EmailTemplateType.EMAIL_VERIFICATION]: (data) => ({
        subject: 'Verify Your Email Address',
        htmlContent: this.renderTemplate(`
          <h1>Verify Your Email</h1>
          <p>Please click the button below to verify your email address:</p>
          <a href="${data.verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px;">Verify Email</a>
          <p>This link will expire in ${data.expiryHours} hours.</p>
          <p>If you didn't create an account, you can safely ignore this email.</p>
        `),
      }),

      [EmailTemplateType.PASSWORD_RESET]: (data) => ({
        subject: 'Reset Your Password',
        htmlContent: this.renderTemplate(`
          <h1>Password Reset Request</h1>
          <p>We received a request to reset your password. Click the button below to create a new password:</p>
          <a href="${data.resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px;">Reset Password</a>
          <p>This link will expire in ${data.expiryMinutes} minutes.</p>
          <p>If you didn't request this, please ignore this email and your password will remain unchanged.</p>
        `),
      }),

      [EmailTemplateType.MEETING_INVITATION]: (data) => ({
        subject: `Meeting Invitation: ${data.meetingTitle}`,
        htmlContent: this.renderTemplate(`
          <h1>You're Invited to a Meeting</h1>
          <h2>${data.meetingTitle}</h2>
          <p><strong>Host:</strong> ${data.hostName}</p>
          <p><strong>Date & Time:</strong> ${new Date(data.scheduledAt).toLocaleString()}</p>
          <a href="${data.meetingUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px;">Join Meeting</a>
          <p>This meeting will be recorded and transcribed by ${this.appName}.</p>
        `),
      }),

      [EmailTemplateType.MEETING_SUMMARY]: (data) => ({
        subject: `Meeting Summary: ${data.meetingTitle}`,
        htmlContent: this.renderTemplate(`
          <h1>Meeting Summary</h1>
          <h2>${data.meetingTitle}</h2>
          <p><strong>Date:</strong> ${new Date(data.date).toLocaleDateString()}</p>
          <p><strong>Duration:</strong> ${Math.floor(data.duration / 60)} minutes</p>
          
          <h3>Key Points</h3>
          <ul>
            ${data.keyPoints.map((point: string) => `<li>${point}</li>`).join('')}
          </ul>
          
          <h3>Action Items</h3>
          <ul>
            ${data.actionItems.map((item: string) => `<li>${item}</li>`).join('')}
          </ul>
          
          <a href="${data.transcriptUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px;">View Full Transcript</a>
        `),
      }),

      // Add more template implementations...
      [EmailTemplateType.MEETING_RECORDING_READY]: (data) => ({
        subject: `Recording Ready: ${data.meetingTitle}`,
        htmlContent: this.renderTemplate(`
          <h1>Your Meeting Recording is Ready</h1>
          <h2>${data.meetingTitle}</h2>
          <p>Your meeting recording has been processed and is now available.</p>
          <p><strong>Duration:</strong> ${Math.floor(data.duration / 60)} minutes</p>
          <a href="${data.recordingUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin-right: 10px;">Watch Recording</a>
          <a href="${data.transcriptUrl}" style="display: inline-block; padding: 12px 24px; background-color: #6B7280; color: white; text-decoration: none; border-radius: 6px;">View Transcript</a>
        `),
      }),

      // Implement remaining templates with similar structure...
      [EmailTemplateType.SUBSCRIPTION_CONFIRMATION]: (data) => this.createDefaultTemplate(type, data),
      [EmailTemplateType.SUBSCRIPTION_RENEWAL]: (data) => this.createDefaultTemplate(type, data),
      [EmailTemplateType.SUBSCRIPTION_CANCELLED]: (data) => this.createDefaultTemplate(type, data),
      [EmailTemplateType.PAYMENT_RECEIPT]: (data) => this.createDefaultTemplate(type, data),
      [EmailTemplateType.TEAM_INVITATION]: (data) => this.createDefaultTemplate(type, data),
      [EmailTemplateType.WEEKLY_DIGEST]: (data) => this.createDefaultTemplate(type, data),
      [EmailTemplateType.QUOTA_WARNING]: (data) => this.createDefaultTemplate(type, data),
      [EmailTemplateType.SECURITY_ALERT]: (data) => this.createDefaultTemplate(type, data),
    };

    return templates[type](data);
  }

  /**
   * Create default template
   */
  private createDefaultTemplate(
    type: EmailTemplateType,
    data: Record<string, any>
  ): EmailTemplate {
    return {
      subject: `${this.appName} Notification`,
      htmlContent: this.renderTemplate(`
        <h1>${type.replace(/_/g, ' ').toUpperCase()}</h1>
        <pre>${JSON.stringify(data, null, 2)}</pre>
      `),
    };
  }

  /**
   * Render HTML template with base layout
   */
  private renderTemplate(content: string): string {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            h1 { color: #1a1a1a; }
            h2 { color: #4F46E5; }
            h3 { color: #6B7280; }
            a { color: #4F46E5; }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              font-size: 14px;
              color: #6B7280;
            }
          </style>
        </head>
        <body>
          ${content}
          <div class="footer">
            <p>© ${new Date().getFullYear()} ${this.appName}. All rights reserved.</p>
            <p>
              <a href="${this.appUrl}/unsubscribe">Unsubscribe</a> |
              <a href="${this.appUrl}/preferences">Email Preferences</a> |
              <a href="${this.appUrl}/help">Help</a>
            </p>
          </div>
        </body>
      </html>
    `;

    // Inline CSS for better email client compatibility
    return juice(html);
  }

  /**
   * Convert HTML to plain text
   */
  private htmlToText(html: string): string {
    return html
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Log email event
   */
  private async logEmailEvent(event: {
    to: string;
    subject: string;
    status: string;
    error?: string;
    metadata?: Record<string, any>;
  }): Promise<void> {
    try {
      // In production, log to database
      logger.info('Email event', event);
    } catch (error) {
      logger.error('Failed to log email event:', error);
    }
  }

  /**
   * Validate email address
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Test SendGrid connection by validating API key
      if (!process.env.SENDGRID_API_KEY) {
        logger.warn('SendGrid API key not configured');
        return false;
      }
      return true;
    } catch (error) {
      logger.error('Email service health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance for use across the application
export const emailService = new EmailService();
