/**
 * CRM Data Service
 *
 * Provides unified access to CRM data from multiple sources:
 * - Local database (Deal, DealMeeting models)
 * - Salesforce integration
 * - HubSpot integration
 *
 * This service abstracts CRM data retrieval and provides
 * consistent interfaces for AI prediction services.
 */

import { PrismaClient, Deal, DealStage } from '@prisma/client';
import winston from 'winston';
import { CacheService } from '../../cache';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: { service: 'crm-data-service' },
  transports: [new winston.transports.Console()],
});

export interface CRMDeal {
  id: string;
  name: string;
  amount?: number;
  stage: string;
  probability: number;
  expectedCloseDate?: Date;
  actualCloseDate?: Date;
  contactEmail?: string;
  contactName?: string;
  ownerId?: string;
  crmProvider?: string;
  externalId?: string;
  accountId?: string;
}

export interface CRMContact {
  id: string;
  email: string;
  name?: string;
  title?: string;
  company?: string;
  phone?: string;
  accountId?: string;
  lastContactDate?: Date;
}

export interface CRMAccount {
  id: string;
  name: string;
  industry?: string;
  revenue?: number;
  employeeCount?: number;
  website?: string;
  renewalDate?: Date;
  contractValue?: number;
  healthScore?: number;
}

export interface CRMSupportTicket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  createdAt: Date;
  resolvedAt?: Date;
  customerId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description?: string;
  category?: string;
}

export interface CRMContractData {
  accountId: string;
  contractValue: number;
  renewalDate: Date;
  autoRenewal: boolean;
  contractTerm: number; // months
  lastRenewalDate?: Date;
  expansionPotential?: number;
}

export class CRMDataService {
  private prisma: PrismaClient;
  private cacheService?: CacheService;
  private cacheTTL: number = 300; // 5 minutes

  constructor(prisma: PrismaClient, cacheService?: CacheService) {
    this.prisma = prisma;
    this.cacheService = cacheService;
  }

  /**
   * Get deal data from local database or CRM
   */
  async getDeal(dealId: string, organizationId: string): Promise<CRMDeal | null> {
    const cacheKey = `crm:deal:${dealId}`;

    // Check cache first
    if (this.cacheService) {
      const cached = await this.cacheService.get(cacheKey);
      if (cached) return JSON.parse(cached);
    }

    try {
      // First try local database
      const localDeal = await this.prisma.deal.findFirst({
        where: {
          id: dealId,
          organizationId,
        },
      });

      if (localDeal) {
        const deal = this.mapLocalDealToCRM(localDeal);

        // Cache the result
        if (this.cacheService) {
          await this.cacheService.set(cacheKey, JSON.stringify(deal), this.cacheTTL);
        }

        return deal;
      }

      // If not found locally, check Salesforce sync
      const sfSync = await this.prisma.salesforceMeetingSync.findFirst({
        where: { salesforceOpportunityId: dealId },
      });

      if (sfSync) {
        // Fetch from Salesforce integration
        const sfDeal = await this.fetchSalesforceDeal(dealId, organizationId);
        if (sfDeal) {
          if (this.cacheService) {
            await this.cacheService.set(cacheKey, JSON.stringify(sfDeal), this.cacheTTL);
          }
          return sfDeal;
        }
      }

      // Check HubSpot sync
      const hsSync = await this.prisma.hubspotMeetingSync.findFirst({
        where: { hubspotDealId: dealId },
      });

      if (hsSync) {
        // Fetch from HubSpot integration
        const hsDeal = await this.fetchHubSpotDeal(dealId, organizationId);
        if (hsDeal) {
          if (this.cacheService) {
            await this.cacheService.set(cacheKey, JSON.stringify(hsDeal), this.cacheTTL);
          }
          return hsDeal;
        }
      }

      return null;
    } catch (error) {
      logger.error('Failed to get deal:', error);
      return null;
    }
  }

  /**
   * Get deals by stage
   */
  async getDealsByStage(
    organizationId: string,
    stage?: DealStage,
    limit: number = 100
  ): Promise<CRMDeal[]> {
    const deals = await this.prisma.deal.findMany({
      where: {
        organizationId,
        ...(stage && { stage }),
      },
      orderBy: { expectedCloseDate: 'asc' },
      take: limit,
    });

    return deals.map(this.mapLocalDealToCRM);
  }

  /**
   * Get deals at risk based on various factors
   */
  async getDealsAtRisk(organizationId: string): Promise<CRMDeal[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Find deals with low probability or no recent activity
    const deals = await this.prisma.deal.findMany({
      where: {
        organizationId,
        OR: [
          { probability: { lt: 30 } },
          { updatedAt: { lt: thirtyDaysAgo } },
          {
            AND: [
              { stage: { in: ['proposal', 'negotiation'] } },
              { expectedCloseDate: { lt: new Date() } },
            ],
          },
        ],
        stage: { notIn: ['closed_won', 'closed_lost'] },
      },
      include: {
        meetings: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return deals.map(this.mapLocalDealToCRM);
  }

  /**
   * Get support tickets for a customer
   */
  async getCustomerSupportTickets(
    customerId: string,
    organizationId: string,
    daysBack: number = 30
  ): Promise<CRMSupportTicket[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    // Check for support-related meetings (as proxy for tickets)
    const supportMeetings = await this.prisma.meeting.findMany({
      where: {
        organizationId,
        scheduledStartAt: { gte: startDate },
        OR: [
          { title: { contains: 'support', mode: 'insensitive' } },
          { title: { contains: 'issue', mode: 'insensitive' } },
          { title: { contains: 'problem', mode: 'insensitive' } },
          { tags: { hasSome: ['support', 'issue', 'bug'] } },
        ],
        participants: {
          some: {
            email: customerId, // Using email as customer ID
          },
        },
      },
      include: {
        aiAnalyses: true,
      },
    });

    // Convert meetings to support tickets
    return supportMeetings.map(meeting => {
      const analysis = meeting.aiAnalyses?.[0];
      const sentiment = (analysis?.sentiment as any)?.overall || 0;

      return {
        id: meeting.id,
        subject: meeting.title,
        status: meeting.status === 'completed' ? 'resolved' : 'open',
        priority: sentiment < -0.5 ? 'high' : sentiment < 0 ? 'medium' : 'low',
        createdAt: meeting.createdAt,
        resolvedAt: meeting.status === 'completed' ? meeting.actualEndAt : undefined,
        customerId,
        severity: this.calculateSeverity(sentiment, meeting.title),
        description: meeting.description || undefined,
        category: this.categorizeSupport(meeting.title, meeting.tags),
      };
    });
  }

  /**
   * Get contract renewal data for a customer
   */
  async getContractRenewalData(
    accountId: string,
    organizationId: string
  ): Promise<CRMContractData | null> {
    // First check local deals for contract info
    const activeDeals = await this.prisma.deal.findMany({
      where: {
        organizationId,
        crmAccountId: accountId,
        stage: { in: ['closed_won', 'negotiation'] },
      },
      orderBy: { expectedCloseDate: 'desc' },
      take: 1,
    });

    if (activeDeals.length > 0) {
      const deal = activeDeals[0];
      const renewalDate = deal.expectedCloseDate || new Date();
      renewalDate.setFullYear(renewalDate.getFullYear() + 1);

      return {
        accountId,
        contractValue: deal.amount || 0,
        renewalDate,
        autoRenewal: false,
        contractTerm: 12,
        lastRenewalDate: deal.actualCloseDate || undefined,
        expansionPotential: deal.probability,
      };
    }

    // Fallback to fetching from CRM integrations
    const sfData = await this.fetchSalesforceContractData(accountId, organizationId);
    if (sfData) return sfData;

    const hsData = await this.fetchHubSpotContractData(accountId, organizationId);
    if (hsData) return hsData;

    // Generate estimated contract data based on meetings
    const recentMeetings = await this.prisma.meeting.findMany({
      where: {
        organizationId,
        participants: {
          some: {
            metadata: {
              path: ['accountId'],
              equals: accountId,
            },
          },
        },
      },
      orderBy: { scheduledStartAt: 'desc' },
      take: 10,
    });

    if (recentMeetings.length > 0) {
      const estimatedRenewal = new Date();
      estimatedRenewal.setMonth(estimatedRenewal.getMonth() + 6);

      return {
        accountId,
        contractValue: 50000, // Default estimate
        renewalDate: estimatedRenewal,
        autoRenewal: false,
        contractTerm: 12,
        expansionPotential: 50,
      };
    }

    return null;
  }

  /**
   * Get account health metrics
   */
  async getAccountHealth(
    accountId: string,
    organizationId: string
  ): Promise<{
    healthScore: number;
    riskFactors: string[];
    opportunities: string[];
  }> {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Get recent meetings for sentiment analysis
    const meetings = await this.prisma.meeting.findMany({
      where: {
        organizationId,
        scheduledStartAt: { gte: ninetyDaysAgo },
        OR: [
          {
            participants: {
              some: {
                metadata: {
                  path: ['accountId'],
                  equals: accountId,
                },
              },
            },
          },
          {
            dealMeetings: {
              some: {
                deal: {
                  crmAccountId: accountId,
                },
              },
            },
          },
        ],
      },
      include: {
        aiAnalyses: true,
      },
    });

    // Calculate health metrics
    let totalSentiment = 0;
    let sentimentCount = 0;
    const riskFactors: string[] = [];
    const opportunities: string[] = [];

    meetings.forEach(meeting => {
      if (meeting.aiAnalyses?.length > 0) {
        const analysis = meeting.aiAnalyses[0];
        const sentiment = (analysis.sentiment as any)?.overall;

        if (typeof sentiment === 'number') {
          totalSentiment += sentiment;
          sentimentCount++;

          if (sentiment < -0.3) {
            riskFactors.push(`Negative sentiment in meeting: ${meeting.title}`);
          } else if (sentiment > 0.5) {
            opportunities.push(`Positive engagement in: ${meeting.title}`);
          }
        }

        // Check for risks and opportunities in analysis
        const risks = (analysis.risks as any[]) || [];
        const opps = (analysis.opportunities as any[]) || [];

        risks.forEach((risk: any) => {
          if (risk.impact === 'high') {
            riskFactors.push(risk.description);
          }
        });

        opps.forEach((opp: any) => {
          if (opp.potential === 'high') {
            opportunities.push(opp.description);
          }
        });
      }
    });

    // Calculate health score
    const avgSentiment = sentimentCount > 0 ? totalSentiment / sentimentCount : 0;
    const meetingFrequency = meetings.length / 13; // meetings per week
    const hasRecentActivity = meetings.some(m =>
      m.scheduledStartAt && m.scheduledStartAt > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    );

    let healthScore = 50; // Base score
    healthScore += avgSentiment * 20; // -20 to +20
    healthScore += Math.min(meetingFrequency * 10, 20); // Up to +20 for frequency
    healthScore += hasRecentActivity ? 10 : -10;
    healthScore -= riskFactors.length * 5;
    healthScore += opportunities.length * 3;

    // Clamp between 0 and 100
    healthScore = Math.max(0, Math.min(100, Math.round(healthScore)));

    return {
      healthScore,
      riskFactors: riskFactors.slice(0, 5),
      opportunities: opportunities.slice(0, 5),
    };
  }

  /**
   * Helper: Map local Deal to CRM format
   */
  private mapLocalDealToCRM(deal: Deal): CRMDeal {
    return {
      id: deal.id,
      name: deal.name,
      amount: deal.amount || undefined,
      stage: deal.stage,
      probability: deal.probability,
      expectedCloseDate: deal.expectedCloseDate || undefined,
      actualCloseDate: deal.actualCloseDate || undefined,
      contactEmail: deal.contactEmail || undefined,
      contactName: deal.contactName || undefined,
      ownerId: deal.ownerId || undefined,
      crmProvider: deal.crmProvider || undefined,
      externalId: deal.crmDealId || undefined,
      accountId: deal.crmAccountId || undefined,
    };
  }

  /**
   * Helper: Calculate support ticket severity
   */
  private calculateSeverity(
    sentiment: number,
    title: string
  ): 'low' | 'medium' | 'high' | 'critical' {
    const urgentKeywords = ['urgent', 'critical', 'asap', 'emergency', 'down', 'broken'];
    const hasUrgentKeyword = urgentKeywords.some(k =>
      title.toLowerCase().includes(k)
    );

    if (hasUrgentKeyword || sentiment < -0.7) return 'critical';
    if (sentiment < -0.3) return 'high';
    if (sentiment < 0) return 'medium';
    return 'low';
  }

  /**
   * Helper: Categorize support issue
   */
  private categorizeSupport(title: string, tags: string[]): string {
    if (tags.includes('bug') || title.toLowerCase().includes('bug')) return 'bug';
    if (tags.includes('feature') || title.toLowerCase().includes('feature')) return 'feature_request';
    if (title.toLowerCase().includes('performance')) return 'performance';
    if (title.toLowerCase().includes('integration')) return 'integration';
    if (title.toLowerCase().includes('billing')) return 'billing';
    return 'general';
  }

  /**
   * Fetch deal from Salesforce (stub - would integrate with SalesforceIntegration)
   */
  private async fetchSalesforceDeal(
    dealId: string,
    organizationId: string
  ): Promise<CRMDeal | null> {
    try {
      // In production, this would call the Salesforce API
      // For now, return null as we don't have the integration instance
      logger.debug('Salesforce deal fetch not implemented', { dealId });
      return null;
    } catch (error) {
      logger.error('Failed to fetch Salesforce deal:', error);
      return null;
    }
  }

  /**
   * Fetch deal from HubSpot (stub - would integrate with HubSpotIntegration)
   */
  private async fetchHubSpotDeal(
    dealId: string,
    organizationId: string
  ): Promise<CRMDeal | null> {
    try {
      // In production, this would call the HubSpot API
      // For now, return null as we don't have the integration instance
      logger.debug('HubSpot deal fetch not implemented', { dealId });
      return null;
    } catch (error) {
      logger.error('Failed to fetch HubSpot deal:', error);
      return null;
    }
  }

  /**
   * Fetch contract data from Salesforce
   */
  private async fetchSalesforceContractData(
    accountId: string,
    organizationId: string
  ): Promise<CRMContractData | null> {
    // Would integrate with Salesforce API
    return null;
  }

  /**
   * Fetch contract data from HubSpot
   */
  private async fetchHubSpotContractData(
    accountId: string,
    organizationId: string
  ): Promise<CRMContractData | null> {
    // Would integrate with HubSpot API
    return null;
  }
}

/**
 * Factory function to create CRMDataService
 */
export function createCRMDataService(
  prisma: PrismaClient,
  cacheService?: CacheService
): CRMDataService {
  return new CRMDataService(prisma, cacheService);
}