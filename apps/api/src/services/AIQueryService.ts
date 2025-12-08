/**
 * Multi-Meeting AI Intelligence Service (GAP #1)
 * ChatGPT-like interface to query across ALL meetings
 *
 * REAL IMPLEMENTATION - Uses OpenAI GPT-4 API
 */

import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';
import { Client as ElasticsearchClient } from '@elastic/elasticsearch';
import { logger } from '../utils/logger';
import { transcriptService } from './TranscriptService';

const prisma = new PrismaClient();

// Initialize OpenAI client with API key from environment
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
});

// Initialize Elasticsearch client
const esClient = new ElasticsearchClient({
  node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
});

// ====================================
// Types and Interfaces
// ====================================

export interface SuperSummaryCriteria {
  dateFrom?: Date;
  dateTo?: Date;
  keywords?: string[];
  participantEmails?: string[];
  tags?: string[];
  meetingIds?: string[];
  summaryType?: 'executive' | 'detailed' | 'action-focused' | 'decision-focused';
}

export interface SuperSummaryResult {
  summary: string;
  keyThemes: string[];
  actionItems: Array<{
    description: string;
    assignee?: string;
    status: string;
    meetingTitle: string;
    date: Date;
  }>;
  criticalDecisions: Array<{
    decision: string;
    meetingTitle: string;
    date: Date;
    impact: 'high' | 'medium' | 'low';
  }>;
  meetingsAnalyzed: number;
  timeSpan: { from: Date; to: Date };
  tokensUsed: number;
  processingTimeMs: number;
}

export interface SearchResult {
  meetingId: string;
  meetingTitle: string;
  meetingDate: Date;
  relevanceScore: number;
  matchedSegments: Array<{
    text: string;
    speaker?: string;
    timestamp: number;
    highlights?: string[];
  }>;
}

export interface InsightResult {
  themes: string[];
  patterns: Array<{
    type: string;
    description: string;
    occurrences: number;
    examples: string[];
  }>;
  sentiment: {
    overall: number;
    trend: 'positive' | 'neutral' | 'negative';
  };
  recommendations: string[];
  tokensUsed: number;
}

export interface RAGQueryResult {
  answer: string;
  confidence: number;
  sources: Array<{
    meetingId: string;
    meetingTitle: string;
    meetingDate: Date;
    relevantContent: string;
  }>;
  suggestedFollowUps: string[];
  tokensUsed: number;
}

// ====================================
// AI Query Service Class
// ====================================

class AIQueryService {
  /**
   * Ask a question across all meetings using RAG (Retrieval-Augmented Generation)
   * REAL IMPLEMENTATION with OpenAI GPT-4
   */
  async askQuestion(userId: string, question: string): Promise<RAGQueryResult> {
    const startTime = Date.now();

    try {
      logger.info('AI query received', { userId, question });

      // Step 1: Fetch user's meetings with summaries and transcripts
      const meetings = await prisma.meeting.findMany({
        where: {
          participants: { some: { userId } }
        },
        include: {
          summaries: true,
          transcripts: true,
          analytics: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 30 // Get more meetings for better context
      });

      if (meetings.length === 0) {
        return {
          answer: "I don't have access to any meetings for your account yet. Please ensure you have recorded meetings available.",
          confidence: 0,
          sources: [],
          suggestedFollowUps: [
            "How do I record a meeting?",
            "What integrations are available?",
          ],
          tokensUsed: 0,
        };
      }

      // Step 2: Generate embedding for the question (for semantic search)
      const questionEmbedding = await this.generateEmbedding(question);

      // Step 3: Build context from meetings with relevance scoring
      const meetingContexts = await Promise.all(
        meetings.map(async (m) => {
          let transcriptText = '';

          // Get transcript from MongoDB if available
          if (m.transcripts[0]?.mongodbId) {
            try {
              const mongoTranscript = await transcriptService.getTranscript(m.transcripts[0].mongodbId);
              if (mongoTranscript) {
                transcriptText = mongoTranscript.fullText.substring(0, 2000); // Limit text
              }
            } catch (error) {
              logger.warn('Failed to fetch transcript from MongoDB', { meetingId: m.id });
            }
          }

          return {
            meetingId: m.id,
            title: m.title,
            date: m.scheduledStartAt || m.createdAt,
            summary: m.summaries[0]?.overview || '',
            keyPoints: m.summaries[0]?.keyPoints || [],
            actionItems: m.summaries[0]?.actionItems || [],
            decisions: m.summaries[0]?.decisions || [],
            transcriptExcerpt: transcriptText,
            topics: m.analytics[0]?.topics || [],
          };
        })
      );

      // Step 4: Score and rank meetings by relevance to the question
      const rankedMeetings = await this.rankMeetingsByRelevance(
        meetingContexts,
        questionEmbedding,
        question
      );

      // Step 5: Build optimized context for GPT-4
      const topMeetings = rankedMeetings.slice(0, 10);
      const contextStr = topMeetings.map((m, i) =>
        `[Meeting ${i + 1}: "${m.title}" on ${new Date(m.date).toLocaleDateString()}]
Summary: ${m.summary}
Key Points: ${JSON.stringify(m.keyPoints).substring(0, 500)}
${m.transcriptExcerpt ? `Transcript Excerpt: ${m.transcriptExcerpt.substring(0, 500)}...` : ''}`
      ).join('\n\n');

      // Step 6: Query GPT-4 with RAG context
      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant that answers questions about the user's meeting history.
You have access to meeting summaries, transcripts, and analytics.

Guidelines:
- Provide specific, actionable answers based on the meeting content provided
- Cite specific meetings when referencing information (use meeting titles and dates)
- If information is unclear or not found, say so explicitly
- Be concise but thorough
- If asked about action items or decisions, reference specific meetings`
          },
          {
            role: 'user',
            content: `Based on the following meeting data, please answer this question: "${question}"

Meeting Context:
${contextStr}

Please provide a helpful, specific answer based on this information.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const answer = response.choices[0]?.message?.content || 'Unable to generate response';
      const tokensUsed = response.usage?.total_tokens || 0;

      // Step 7: Generate follow-up suggestions
      const followUpResponse = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Generate 3 brief follow-up questions based on the conversation. Return only the questions, one per line.'
          },
          {
            role: 'user',
            content: `Question: ${question}\nAnswer: ${answer.substring(0, 500)}`
          }
        ],
        temperature: 0.8,
        max_tokens: 150,
      });

      const suggestedFollowUps = (followUpResponse.choices[0]?.message?.content || '')
        .split('\n')
        .filter(q => q.trim())
        .slice(0, 3);

      // Step 8: Calculate confidence based on relevance scores
      const avgRelevance = topMeetings.reduce((sum, m) => sum + (m.relevanceScore || 0), 0) / topMeetings.length;
      const confidence = Math.min(avgRelevance * 0.8 + 0.2, 1);

      logger.info('AI query completed', {
        userId,
        tokensUsed,
        confidence,
        processingTimeMs: Date.now() - startTime
      });

      return {
        answer,
        confidence,
        sources: topMeetings.slice(0, 5).map(m => ({
          meetingId: m.meetingId,
          meetingTitle: m.title,
          meetingDate: m.date,
          relevantContent: m.summary.substring(0, 200),
        })),
        suggestedFollowUps,
        tokensUsed: tokensUsed + (followUpResponse.usage?.total_tokens || 0),
      };
    } catch (error) {
      logger.error('Error in AI query', { error, userId });
      throw error;
    }
  }

  /**
   * Generate Super Summary from multiple meetings
   * REAL IMPLEMENTATION with OpenAI GPT-4
   */
  async generateSuperSummary(userId: string, criteria: SuperSummaryCriteria): Promise<SuperSummaryResult> {
    const startTime = Date.now();

    try {
      logger.info('Generating super summary', { userId, criteria });

      // Step 1: Build query filters based on criteria
      const whereClause: any = {
        participants: { some: { userId } },
        status: 'completed',
      };

      if (criteria.dateFrom || criteria.dateTo) {
        whereClause.scheduledStartAt = {};
        if (criteria.dateFrom) whereClause.scheduledStartAt.gte = criteria.dateFrom;
        if (criteria.dateTo) whereClause.scheduledStartAt.lte = criteria.dateTo;
      }

      if (criteria.meetingIds && criteria.meetingIds.length > 0) {
        whereClause.id = { in: criteria.meetingIds };
      }

      // Step 2: Fetch meetings with all related data
      const meetings = await prisma.meeting.findMany({
        where: whereClause,
        include: {
          summaries: true,
          analytics: true,
          participants: true,
        },
        orderBy: { scheduledStartAt: 'desc' },
        take: 50, // Limit to 50 meetings for API limits
      });

      if (meetings.length === 0) {
        return {
          summary: 'No meetings found matching the specified criteria.',
          keyThemes: [],
          actionItems: [],
          criticalDecisions: [],
          meetingsAnalyzed: 0,
          timeSpan: {
            from: criteria.dateFrom || new Date(),
            to: criteria.dateTo || new Date()
          },
          tokensUsed: 0,
          processingTimeMs: Date.now() - startTime,
        };
      }

      // Step 3: Filter by keywords if provided
      let filteredMeetings = meetings;
      if (criteria.keywords && criteria.keywords.length > 0) {
        const keywordPattern = criteria.keywords.join('|').toLowerCase();
        filteredMeetings = meetings.filter(m => {
          const searchText = [
            m.title,
            m.summaries[0]?.overview || '',
            JSON.stringify(m.summaries[0]?.keyPoints || []),
          ].join(' ').toLowerCase();
          return new RegExp(keywordPattern).test(searchText);
        });
      }

      // Step 4: Filter by participants if provided
      if (criteria.participantEmails && criteria.participantEmails.length > 0) {
        filteredMeetings = filteredMeetings.filter(m =>
          m.participants.some(p =>
            criteria.participantEmails!.includes(p.email || '')
          )
        );
      }

      // Step 5: Aggregate meeting data for analysis
      const aggregatedData = filteredMeetings.map(m => ({
        title: m.title,
        date: m.scheduledStartAt || m.createdAt,
        overview: m.summaries[0]?.overview || '',
        keyPoints: m.summaries[0]?.keyPoints || [],
        actionItems: m.summaries[0]?.actionItems || [],
        decisions: m.summaries[0]?.decisions || [],
        topics: m.analytics[0]?.topics || [],
        sentiment: m.analytics[0]?.sentimentScores || {},
        participantCount: m.participantCount,
      }));

      // Step 6: Generate super summary using GPT-4
      const summaryTypePrompts: Record<string, string> = {
        'executive': 'Create a high-level executive summary focusing on strategic decisions and outcomes.',
        'detailed': 'Create a comprehensive detailed summary with all key information.',
        'action-focused': 'Create a summary focused primarily on action items and deliverables.',
        'decision-focused': 'Create a summary focused on decisions made and their implications.',
      };

      const summaryType = criteria.summaryType || 'executive';

      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert meeting analyst creating a comprehensive summary across multiple meetings.
${summaryTypePrompts[summaryType]}

Your output MUST be valid JSON with this exact structure:
{
  "summary": "Overall narrative summary of all meetings",
  "keyThemes": ["theme1", "theme2", ...],
  "patterns": ["recurring pattern 1", "pattern 2"],
  "overallSentiment": "positive|neutral|negative",
  "strategicInsights": ["insight1", "insight2"]
}`
          },
          {
            role: 'user',
            content: `Analyze these ${filteredMeetings.length} meetings and create a super summary:

${JSON.stringify(aggregatedData.slice(0, 20), null, 2)}

Focus on:
1. Overarching themes and patterns
2. Critical decisions and their implications
3. Progress on action items
4. Emerging concerns or opportunities
5. Strategic insights`
          }
        ],
        temperature: 0.5,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      });

      const aiResult = JSON.parse(response.choices[0]?.message?.content || '{}');
      const tokensUsed = response.usage?.total_tokens || 0;

      // Step 7: Extract and consolidate action items across meetings
      const allActionItems = filteredMeetings.flatMap(m => {
        const items = m.summaries[0]?.actionItems as any[] || [];
        return items.map((item: any) => ({
          description: typeof item === 'string' ? item : (item.description || item.text || JSON.stringify(item)),
          assignee: item?.assignee,
          status: item?.status || 'pending',
          meetingTitle: m.title,
          date: m.scheduledStartAt || m.createdAt,
        }));
      });

      // Step 8: Extract and consolidate decisions across meetings
      const allDecisions = filteredMeetings.flatMap(m => {
        const decisions = m.summaries[0]?.decisions as any[] || [];
        return decisions.map((decision: any) => ({
          decision: typeof decision === 'string' ? decision : (decision.description || decision.text || JSON.stringify(decision)),
          meetingTitle: m.title,
          date: m.scheduledStartAt || m.createdAt,
          impact: decision?.impact || 'medium' as 'high' | 'medium' | 'low',
        }));
      });

      // Step 9: Calculate time span
      const dates = filteredMeetings
        .map(m => m.scheduledStartAt || m.createdAt)
        .filter(Boolean)
        .sort((a, b) => a.getTime() - b.getTime());

      const timeSpan = {
        from: dates[0] || new Date(),
        to: dates[dates.length - 1] || new Date(),
      };

      logger.info('Super summary generated', {
        userId,
        meetingsAnalyzed: filteredMeetings.length,
        tokensUsed,
        processingTimeMs: Date.now() - startTime,
      });

      return {
        summary: aiResult.summary || 'Summary generation completed.',
        keyThemes: aiResult.keyThemes || [],
        actionItems: allActionItems,
        criticalDecisions: allDecisions,
        meetingsAnalyzed: filteredMeetings.length,
        timeSpan,
        tokensUsed,
        processingTimeMs: Date.now() - startTime,
      };
    } catch (error) {
      logger.error('Error generating super summary', { error, userId });
      throw error;
    }
  }

  /**
   * Search across all meetings using Elasticsearch
   * REAL IMPLEMENTATION with Elasticsearch
   */
  async searchAcrossMeetings(
    userId: string,
    query: string,
    options?: {
      dateFrom?: Date;
      dateTo?: Date;
      limit?: number;
    }
  ): Promise<SearchResult[]> {
    try {
      logger.info('Searching across meetings', { userId, query });

      // Step 1: Get user's organization for filtering
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { organizationId: true },
      });

      if (!user?.organizationId) {
        return [];
      }

      // Step 2: Build Elasticsearch query
      const esQuery: any = {
        bool: {
          must: [
            {
              multi_match: {
                query,
                fields: ['content^2', 'title', 'speaker'],
                type: 'best_fields',
                fuzziness: 'AUTO',
              },
            },
          ],
          filter: [
            { term: { organizationId: user.organizationId } },
          ],
        },
      };

      // Add date range filter if provided
      if (options?.dateFrom || options?.dateTo) {
        const rangeFilter: any = { range: { createdAt: {} } };
        if (options.dateFrom) rangeFilter.range.createdAt.gte = options.dateFrom.toISOString();
        if (options.dateTo) rangeFilter.range.createdAt.lte = options.dateTo.toISOString();
        esQuery.bool.filter.push(rangeFilter);
      }

      // Step 3: Execute Elasticsearch search
      const searchResponse = await esClient.search({
        index: 'transcripts',
        body: {
          query: esQuery,
          highlight: {
            fields: {
              content: {
                fragment_size: 150,
                number_of_fragments: 3,
                pre_tags: ['<mark>'],
                post_tags: ['</mark>'],
              },
            },
          },
          size: options?.limit || 20,
          sort: [
            { _score: { order: 'desc' } },
            { createdAt: { order: 'desc' } },
          ],
        },
      });

      // Step 4: Process and format results
      const hits = (searchResponse.hits.hits as any[]) || [];
      const meetingIds = Array.from(new Set(hits.map(hit => hit._source.meetingId)));

      // Step 5: Fetch meeting details from database
      const meetings = await prisma.meeting.findMany({
        where: { id: { in: meetingIds } },
        select: {
          id: true,
          title: true,
          scheduledStartAt: true,
          createdAt: true,
        },
      });

      const meetingMap = new Map(meetings.map(m => [m.id, m]));

      // Step 6: Build search results
      const results: SearchResult[] = hits.map(hit => {
        const meeting = meetingMap.get(hit._source.meetingId);
        return {
          meetingId: hit._source.meetingId,
          meetingTitle: meeting?.title || 'Unknown Meeting',
          meetingDate: meeting?.scheduledStartAt || meeting?.createdAt || new Date(),
          relevanceScore: hit._score || 0,
          matchedSegments: [{
            text: hit._source.content?.substring(0, 500) || '',
            speaker: hit._source.speaker,
            timestamp: hit._source.timestamp || 0,
            highlights: hit.highlight?.content || [],
          }],
        };
      });

      logger.info('Search completed', {
        userId,
        query,
        resultsCount: results.length
      });

      return results;
    } catch (error: any) {
      // Fallback to database search if Elasticsearch is unavailable
      if (error.name === 'ConnectionError' || error.statusCode === 503) {
        logger.warn('Elasticsearch unavailable, falling back to database search', { error: error.message });
        return this.fallbackDatabaseSearch(userId, query, options);
      }

      logger.error('Error searching across meetings', { error, userId });
      throw error;
    }
  }

  /**
   * Generate insights from meetings using AI
   * REAL IMPLEMENTATION with OpenAI GPT-4
   */
  async generateInsights(
    userId: string,
    options?: {
      dateFrom?: Date;
      dateTo?: Date;
      analysisType?: 'themes' | 'patterns' | 'sentiment' | 'all';
    }
  ): Promise<InsightResult> {
    try {
      logger.info('Generating insights', { userId, options });

      // Step 1: Fetch meetings for analysis
      const whereClause: any = {
        participants: { some: { userId } },
        status: 'completed',
      };

      if (options?.dateFrom || options?.dateTo) {
        whereClause.scheduledStartAt = {};
        if (options.dateFrom) whereClause.scheduledStartAt.gte = options.dateFrom;
        if (options.dateTo) whereClause.scheduledStartAt.lte = options.dateTo;
      }

      const meetings = await prisma.meeting.findMany({
        where: whereClause,
        include: {
          summaries: true,
          analytics: true,
        },
        orderBy: { scheduledStartAt: 'desc' },
        take: 30,
      });

      if (meetings.length === 0) {
        return {
          themes: [],
          patterns: [],
          sentiment: { overall: 0, trend: 'neutral' },
          recommendations: ['No meetings found for analysis. Record some meetings to get insights.'],
          tokensUsed: 0,
        };
      }

      // Step 2: Aggregate data for analysis
      const analysisData = meetings.map(m => ({
        title: m.title,
        date: m.scheduledStartAt || m.createdAt,
        summary: m.summaries[0]?.overview || '',
        keyPoints: m.summaries[0]?.keyPoints || [],
        actionItems: m.summaries[0]?.actionItems || [],
        decisions: m.summaries[0]?.decisions || [],
        topics: m.analytics[0]?.topics || [],
        sentiment: m.analytics[0]?.sentimentScores,
        engagement: m.analytics[0]?.engagementScore,
      }));

      // Step 3: Use GPT-4 to analyze patterns and generate insights
      const analysisType = options?.analysisType || 'all';

      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are an expert meeting analyst. Analyze the provided meeting data and identify key insights.

Your output MUST be valid JSON with this exact structure:
{
  "themes": ["recurring theme 1", "theme 2", ...],
  "patterns": [
    {
      "type": "recurring_issue|decision_pattern|communication|productivity",
      "description": "description of the pattern",
      "occurrences": number,
      "examples": ["example 1", "example 2"]
    }
  ],
  "overallSentiment": number between -1 and 1,
  "sentimentTrend": "improving|declining|stable",
  "recommendations": ["actionable recommendation 1", "recommendation 2", ...]
}

Focus on: ${analysisType === 'all' ? 'themes, patterns, sentiment, and recommendations' : analysisType}`
          },
          {
            role: 'user',
            content: `Analyze these ${meetings.length} meetings for insights:

${JSON.stringify(analysisData.slice(0, 15), null, 2)}

Identify:
1. Recurring themes across meetings
2. Patterns in decisions and action items
3. Sentiment trends
4. Areas for improvement
5. Actionable recommendations`
          }
        ],
        temperature: 0.6,
        max_tokens: 1500,
        response_format: { type: 'json_object' },
      });

      const aiResult = JSON.parse(response.choices[0]?.message?.content || '{}');
      const tokensUsed = response.usage?.total_tokens || 0;

      // Step 4: Calculate sentiment from analytics data
      const sentimentValues = meetings
        .map(m => (m.analytics[0]?.sentimentScores as any)?.overall)
        .filter(s => typeof s === 'number');

      const avgSentiment = sentimentValues.length > 0
        ? sentimentValues.reduce((a, b) => a + b, 0) / sentimentValues.length
        : aiResult.overallSentiment || 0;

      const sentimentTrend = aiResult.sentimentTrend === 'improving' ? 'positive'
        : aiResult.sentimentTrend === 'declining' ? 'negative'
        : 'neutral';

      logger.info('Insights generated', {
        userId,
        tokensUsed,
        themesCount: aiResult.themes?.length || 0,
        patternsCount: aiResult.patterns?.length || 0,
      });

      return {
        themes: aiResult.themes || [],
        patterns: aiResult.patterns || [],
        sentiment: {
          overall: avgSentiment,
          trend: sentimentTrend,
        },
        recommendations: aiResult.recommendations || [],
        tokensUsed,
      };
    } catch (error) {
      logger.error('Error generating insights', { error, userId });
      throw error;
    }
  }

  // ====================================
  // Private Helper Methods
  // ====================================

  /**
   * Generate embedding for text using OpenAI
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      });
      return response.data[0].embedding;
    } catch (error) {
      logger.error('Error generating embedding', { error });
      return [];
    }
  }

  /**
   * Rank meetings by relevance to the question using embeddings
   */
  private async rankMeetingsByRelevance(
    meetings: any[],
    questionEmbedding: number[],
    question: string
  ): Promise<any[]> {
    if (questionEmbedding.length === 0) {
      // Fallback to keyword matching if embedding failed
      const keywords = question.toLowerCase().split(/\s+/);
      return meetings.map(m => {
        const searchText = [m.title, m.summary, JSON.stringify(m.keyPoints)].join(' ').toLowerCase();
        const matchCount = keywords.filter(k => searchText.includes(k)).length;
        return { ...m, relevanceScore: matchCount / keywords.length };
      }).sort((a, b) => b.relevanceScore - a.relevanceScore);
    }

    // Score each meeting based on embedding similarity
    const scoredMeetings = await Promise.all(
      meetings.map(async (m) => {
        const meetingText = [m.title, m.summary].join(' ');
        const meetingEmbedding = await this.generateEmbedding(meetingText);
        const similarity = this.cosineSimilarity(questionEmbedding, meetingEmbedding);
        return { ...m, relevanceScore: similarity };
      })
    );

    return scoredMeetings.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length || a.length === 0) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Fallback database search when Elasticsearch is unavailable
   */
  private async fallbackDatabaseSearch(
    userId: string,
    query: string,
    options?: { dateFrom?: Date; dateTo?: Date; limit?: number }
  ): Promise<SearchResult[]> {
    const whereClause: any = {
      participants: { some: { userId } },
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ],
    };

    if (options?.dateFrom || options?.dateTo) {
      whereClause.scheduledStartAt = {};
      if (options.dateFrom) whereClause.scheduledStartAt.gte = options.dateFrom;
      if (options.dateTo) whereClause.scheduledStartAt.lte = options.dateTo;
    }

    const meetings = await prisma.meeting.findMany({
      where: whereClause,
      include: { summaries: true },
      orderBy: { scheduledStartAt: 'desc' },
      take: options?.limit || 20,
    });

    return meetings.map(m => ({
      meetingId: m.id,
      meetingTitle: m.title,
      meetingDate: m.scheduledStartAt || m.createdAt,
      relevanceScore: 0.5, // Default score for database search
      matchedSegments: [{
        text: m.summaries[0]?.overview || m.description || '',
        timestamp: 0,
      }],
    }));
  }
}

export const aiQueryService = new AIQueryService();
