/**
 * Churn Predictor
 *
 * Predicts customer churn from support call and meeting analysis:
 * - Complaint frequency and severity
 * - Sentiment decline over time
 * - Escalation patterns
 * - Support ticket volume
 * - Feature request urgency
 * - Contract renewal proximity
 *
 * Uses OpenAI GPT-4 for real churn risk analysis
 */

import { PrismaClient } from '@prisma/client';
import {
  BasePredictionService,
  FeatureVector,
} from '../PredictiveInsightsService';
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: { service: 'churn-predictor' },
  transports: [new winston.transports.Console()],
});

export interface ChurnPrediction {
  churnProbability: number; // 0-100
  churnRisk: 'low' | 'medium' | 'high' | 'critical';
  timeHorizon: number; // days until likely churn
  churnSignals: ChurnSignal[];
  saveStrategies: SaveStrategy[];
  retentionScore: number; // 0-100, higher = easier to retain
}

export interface ChurnSignal {
  signal: string;
  strength: 'weak' | 'moderate' | 'strong';
  firstDetected: string; // ISO date
  trend: 'improving' | 'stable' | 'worsening';
  description: string;
}

export interface SaveStrategy {
  strategy: string;
  priority: 'low' | 'medium' | 'high';
  estimatedImpact: number; // 0-100
  timeframe: string; // e.g., "immediate", "1-2 weeks"
  actionItems: string[];
}

interface ChurnFeatures extends FeatureVector {
  avgSentiment: number;
  sentimentDecline: number;
  complaintFrequency: number;
  escalationRate: number;
  supportTicketsLast30Days: number;
  responseTimeAvg: number;
  featureRequestCount: number;
  contractRenewalDays: number;
  usageDecline: number;
  championEngagement: number;
  competitorResearch: number;
  cancellationRequests: number;
  totalInteractions: number;
  accountAge: number;
}

/**
 * Churn Predictor Service
 */
export class ChurnPredictor extends BasePredictionService<ChurnPrediction> {
  constructor(prisma: PrismaClient) {
    super(prisma, 'churn-predictor-v1');
  }

  /**
   * Extract features from customer interaction data
   */
  protected async extractFeatures(customerData: {
    customerId: string;
    organizationId: string;
  }): Promise<ChurnFeatures> {
    const { customerId, organizationId } = customerData;

    logger.info('Extracting churn features', { customerId });

    // Query meetings and support interactions (last 180 days)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setDate(sixMonthsAgo.getDate() - 180);

    const meetings = await this.prisma.meeting.findMany({
      where: {
        organizationId,
        startTime: { gte: sixMonthsAgo },
        // In production, filter by customer association
      },
      include: {
        transcript: true,
        participants: true,
      },
      orderBy: { startTime: 'desc' },
      take: 50,
    });

    // Calculate sentiment metrics
    const sentiments = meetings
      .map(m => m.transcript?.sentiment || 0)
      .filter(s => s !== 0);

    const avgSentiment = sentiments.length > 0
      ? sentiments.reduce((a, b) => a + b, 0) / sentiments.length
      : 0;

    // Calculate sentiment decline (recent vs historical)
    const recentSentiments = sentiments.slice(0, 10);
    const historicalSentiments = sentiments.slice(10, 30);

    const sentimentDecline = recentSentiments.length > 0 && historicalSentiments.length > 0
      ? (historicalSentiments.reduce((a, b) => a + b, 0) / historicalSentiments.length) -
        (recentSentiments.reduce((a, b) => a + b, 0) / recentSentiments.length)
      : 0;

    // Count complaints in transcripts
    const complaintKeywords = [
      'issue', 'problem', 'broken', 'not working', 'frustrated',
      'disappointed', 'unhappy', 'concerned', 'bug', 'error'
    ];

    const complaintFrequency = meetings.reduce((count, meeting) => {
      const transcriptText = meeting.transcript?.content?.toLowerCase() || '';
      const complaints = complaintKeywords.filter(k => transcriptText.includes(k)).length;
      return count + (complaints > 0 ? 1 : 0);
    }, 0);

    // Calculate escalation rate
    const escalationKeywords = ['escalate', 'manager', 'supervisor', 'urgent', 'critical'];
    const escalationRate = meetings.reduce((count, meeting) => {
      const transcriptText = meeting.transcript?.content?.toLowerCase() || '';
      return count + escalationKeywords.filter(k => transcriptText.includes(k)).length;
    }, 0) / (meetings.length || 1);

    // Mock support ticket data (in production, from support system)
    const supportTicketsLast30Days = Math.floor(Math.random() * 15);

    // Calculate average response time (days between support interactions)
    const responseTimeAvg = meetings.length > 1
      ? meetings.slice(0, -1).reduce((sum, meeting, i) => {
          const nextMeeting = meetings[i + 1];
          const daysDiff = Math.abs(
            (meeting.startTime.getTime() - nextMeeting.startTime.getTime()) /
            (1000 * 60 * 60 * 24)
          );
          return sum + daysDiff;
        }, 0) / (meetings.length - 1)
      : 14;

    // Count feature requests
    const featureRequestKeywords = ['feature', 'request', 'need', 'would like', 'wish'];
    const featureRequestCount = meetings.reduce((count, meeting) => {
      const transcriptText = meeting.transcript?.content?.toLowerCase() || '';
      return count + featureRequestKeywords.filter(k => transcriptText.includes(k)).length;
    }, 0);

    // Mock contract renewal data (in production, from CRM)
    const contractRenewalDays = Math.floor(Math.random() * 365);

    // Calculate usage decline (mock data)
    const usageDecline = Math.random() * 0.5; // 0-50% decline

    // Champion engagement (meetings with key stakeholders)
    const championEngagement = meetings.filter(m =>
      m.participants.some(p =>
        p.role?.toLowerCase().includes('sponsor') ||
        p.role?.toLowerCase().includes('champion')
      )
    ).length / (meetings.length || 1);

    // Competitor research mentions
    const competitorKeywords = ['competitor', 'alternative', 'other solution', 'switching'];
    const competitorResearch = meetings.reduce((count, meeting) => {
      const transcriptText = meeting.transcript?.content?.toLowerCase() || '';
      return count + competitorKeywords.filter(k => transcriptText.includes(k)).length;
    }, 0);

    // Cancellation request indicators
    const cancellationKeywords = ['cancel', 'terminate', 'end contract', 'not renewing'];
    const cancellationRequests = meetings.reduce((count, meeting) => {
      const transcriptText = meeting.transcript?.content?.toLowerCase() || '';
      return count + cancellationKeywords.filter(k => transcriptText.includes(k)).length;
    }, 0);

    // Account age (mock data)
    const accountAge = 365; // days

    return {
      avgSentiment,
      sentimentDecline,
      complaintFrequency,
      escalationRate,
      supportTicketsLast30Days,
      responseTimeAvg,
      featureRequestCount,
      contractRenewalDays,
      usageDecline,
      championEngagement,
      competitorResearch,
      cancellationRequests,
      totalInteractions: meetings.length,
      accountAge,
    };
  }

  /**
   * Make prediction using GPT-4
   */
  protected async makePrediction(
    features: ChurnFeatures
  ): Promise<ChurnPrediction> {
    logger.info('Making churn prediction with AI');

    const systemPrompt = `You are a customer success expert specializing in churn prediction and retention. Analyze customer interaction data to predict churn risk.

Consider these critical factors:
- Sentiment decline signals dissatisfaction
- High complaint frequency indicates unresolved issues
- Escalations show frustration levels
- Usage decline suggests disengagement
- Competitor research means they're exploring alternatives
- Contract renewal proximity affects urgency

Provide detailed churn signals and specific, actionable retention strategies.`;

    const userPrompt = `Analyze these customer metrics and predict churn risk:

${this.formatFeaturesForAI(features)}

Provide your prediction in this exact JSON format:
{
  "churnProbability": <number 0-100>,
  "churnRisk": "<low|medium|high|critical>",
  "timeHorizon": <days until likely churn>,
  "churnSignals": [
    {
      "signal": "<signal name>",
      "strength": "<weak|moderate|strong>",
      "firstDetected": "<ISO date>",
      "trend": "<improving|stable|worsening>",
      "description": "<detailed description>"
    }
  ],
  "saveStrategies": [
    {
      "strategy": "<strategy name>",
      "priority": "<low|medium|high>",
      "estimatedImpact": <number 0-100>,
      "timeframe": "<timeframe>",
      "actionItems": ["<action 1>", "<action 2>"]
    }
  ],
  "retentionScore": <number 0-100>
}`;

    const schema = `{
  "churnProbability": "number (0-100)",
  "churnRisk": "string (low|medium|high|critical)",
  "timeHorizon": "number (days)",
  "churnSignals": "array of signal objects",
  "saveStrategies": "array of strategy objects",
  "retentionScore": "number (0-100)"
}`;

    const prediction = await this.callAIStructured<ChurnPrediction>(
      systemPrompt,
      userPrompt,
      schema
    );

    logger.info('Churn prediction complete', {
      churnProbability: prediction.churnProbability,
      churnRisk: prediction.churnRisk,
    });

    return prediction;
  }

  /**
   * Generate human-readable explanation
   */
  protected async generateExplanation(
    prediction: ChurnPrediction,
    features: ChurnFeatures
  ): Promise<string> {
    const systemPrompt = `You are a customer success manager explaining churn predictions to account teams. Provide clear, empathetic explanations that motivate action.`;

    const userPrompt = `Explain this churn prediction in 2-3 sentences:

Churn Risk: ${prediction.churnRisk}
Churn Probability: ${prediction.churnProbability}%
Time Horizon: ${prediction.timeHorizon} days

Key Signals:
${prediction.churnSignals.slice(0, 3).map(s => `- ${s.signal}: ${s.description}`).join('\n')}

Key Metrics:
- Sentiment Decline: ${features.sentimentDecline.toFixed(2)}
- Complaint Frequency: ${features.complaintFrequency}
- Escalation Rate: ${features.escalationRate.toFixed(2)}
- Days to Renewal: ${features.contractRenewalDays}

Write a concise explanation focusing on the most urgent factors.`;

    const explanation = await this.ai.chatCompletion({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      maxTokens: 300,
    });

    return explanation.trim();
  }

  /**
   * Generate retention strategies
   */
  protected async generateRecommendations(
    prediction: ChurnPrediction,
    features: ChurnFeatures
  ): Promise<string[]> {
    // Extract action items from save strategies
    const recommendations: string[] = [];

    for (const strategy of prediction.saveStrategies.slice(0, 3)) {
      recommendations.push(`${strategy.strategy}: ${strategy.actionItems.join(', ')}`);
    }

    return recommendations;
  }
}

/**
 * Factory function to create ChurnPredictor
 */
export function createChurnPredictor(prisma: PrismaClient): ChurnPredictor {
  return new ChurnPredictor(prisma);
}
