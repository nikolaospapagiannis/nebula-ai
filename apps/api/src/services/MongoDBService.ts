/**
 * MongoDB Service for Transcript Storage
 * Handles storage and retrieval of large transcript content in MongoDB
 */

import mongoose, { Schema, Document, Connection } from 'mongoose';
import winston from 'winston';

const logger = winston.createLogger({
  transports: [new winston.transports.Console()],
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
});

// Transcript Segment Interface
interface ITranscriptSegment {
  startTime: number;
  endTime: number;
  text: string;
  speaker?: string;
  speakerId?: string;
  confidence?: number;
  words?: Array<{
    word: string;
    start: number;
    end: number;
    confidence: number;
  }>;
}

// Transcript Document Interface
interface ITranscript extends Document {
  _id: string;
  meetingId: string;
  organizationId: string;
  segments: ITranscriptSegment[];
  fullText: string;
  language: string;
  wordCount: number;
  duration: number;
  speakerCount: number;
  speakers: Array<{
    speakerId: string;
    name: string;
    talkTime: number;
  }>;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Transcript Schema
const TranscriptSegmentSchema = new Schema({
  startTime: { type: Number, required: true },
  endTime: { type: Number, required: true },
  text: { type: String, required: true },
  speaker: { type: String },
  speakerId: { type: String },
  confidence: { type: Number, min: 0, max: 1 },
  words: [{
    word: { type: String, required: true },
    start: { type: Number, required: true },
    end: { type: Number, required: true },
    confidence: { type: Number, min: 0, max: 1 },
  }],
}, { _id: false });

const TranscriptSchema = new Schema<ITranscript>({
  meetingId: { type: String, required: true, index: true },
  organizationId: { type: String, required: true, index: true },
  segments: { type: [TranscriptSegmentSchema], required: true },
  fullText: { type: String, required: true },
  language: { type: String, default: 'en' },
  wordCount: { type: Number, default: 0 },
  duration: { type: Number, default: 0 },
  speakerCount: { type: Number, default: 0 },
  speakers: [{
    speakerId: { type: String, required: true },
    name: { type: String, required: true },
    talkTime: { type: Number, required: true },
  }],
  metadata: { type: Schema.Types.Mixed, default: {} },
}, {
  timestamps: true,
  collection: 'transcripts',
});

// Indexes for performance
TranscriptSchema.index({ meetingId: 1, organizationId: 1 });
TranscriptSchema.index({ createdAt: -1 });
TranscriptSchema.index({ 'segments.text': 'text' }); // Full-text search

/**
 * MongoDB Service Class
 */
export class MongoDBService {
  private connection: Connection | null = null;
  private TranscriptModel: mongoose.Model<ITranscript> | null = null;
  private connectionPromise: Promise<void> | null = null;

  constructor() {
    // Connection will be established lazily
  }

  /**
   * Connect to MongoDB
   */
  private async connect(): Promise<void> {
    if (this.connection?.readyState === 1) {
      return; // Already connected
    }

    if (this.connectionPromise) {
      return this.connectionPromise; // Connection in progress
    }

    this.connectionPromise = (async () => {
      try {
        const mongoUrl = process.env.MONGODB_URL || 'mongodb://localhost:27017/fireflies_transcripts';

        logger.info('Connecting to MongoDB...', { url: mongoUrl.replace(/:[^:@]+@/, ':****@') });

        this.connection = await mongoose.createConnection(mongoUrl, {
          maxPoolSize: 10,
          minPoolSize: 2,
          serverSelectionTimeoutMS: 5000,
          socketTimeoutMS: 45000,
        }).asPromise();

        // Create model
        this.TranscriptModel = this.connection.model<ITranscript>('Transcript', TranscriptSchema);

        logger.info('MongoDB connected successfully');
      } catch (error) {
        logger.error('MongoDB connection error:', error);
        this.connectionPromise = null;
        throw error;
      }
    })();

    return this.connectionPromise;
  }

  /**
   * Ensure MongoDB is connected
   */
  private async ensureConnected(): Promise<mongoose.Model<ITranscript>> {
    await this.connect();
    if (!this.TranscriptModel) {
      throw new Error('Transcript model not initialized');
    }
    return this.TranscriptModel;
  }

  /**
   * Store transcript in MongoDB
   */
  async storeTranscript(data: {
    meetingId: string;
    organizationId: string;
    segments: ITranscriptSegment[];
    language?: string;
    metadata?: Record<string, any>;
  }): Promise<string> {
    try {
      const Model = await this.ensureConnected();

      // Calculate derived fields
      const fullText = data.segments.map(s => s.text).join(' ');
      const wordCount = fullText.split(/\s+/).length;
      const duration = data.segments.length > 0
        ? data.segments[data.segments.length - 1].endTime
        : 0;

      // Extract speaker information
      const speakerMap = new Map<string, { name: string; talkTime: number }>();
      data.segments.forEach(segment => {
        if (segment.speakerId && segment.speaker) {
          const existing = speakerMap.get(segment.speakerId);
          const talkTime = segment.endTime - segment.startTime;

          if (existing) {
            existing.talkTime += talkTime;
          } else {
            speakerMap.set(segment.speakerId, {
              name: segment.speaker,
              talkTime,
            });
          }
        }
      });

      const speakers = Array.from(speakerMap.entries()).map(([speakerId, data]) => ({
        speakerId,
        name: data.name,
        talkTime: data.talkTime,
      }));

      // Create transcript document
      const transcript = new Model({
        meetingId: data.meetingId,
        organizationId: data.organizationId,
        segments: data.segments,
        fullText,
        language: data.language || 'en',
        wordCount,
        duration,
        speakerCount: speakers.length,
        speakers,
        metadata: data.metadata || {},
      });

      await transcript.save();

      logger.info('Transcript stored in MongoDB', {
        mongodbId: transcript._id.toString(),
        meetingId: data.meetingId,
        wordCount,
        duration,
      });

      return transcript._id.toString();
    } catch (error) {
      logger.error('Error storing transcript in MongoDB:', error);
      throw error;
    }
  }

  /**
   * Get transcript by MongoDB ID
   */
  async getTranscript(mongodbId: string): Promise<ITranscript | null> {
    try {
      const Model = await this.ensureConnected();

      const transcript = await Model.findById(mongodbId);

      if (!transcript) {
        logger.warn('Transcript not found', { mongodbId });
        return null;
      }

      return transcript;
    } catch (error) {
      logger.error('Error fetching transcript from MongoDB:', error);
      throw error;
    }
  }

  /**
   * Get transcript full text by MongoDB ID
   */
  async getTranscriptText(mongodbId: string): Promise<string> {
    try {
      const Model = await this.ensureConnected();

      const transcript = await Model.findById(mongodbId).select('fullText');

      if (!transcript) {
        throw new Error(`Transcript not found: ${mongodbId}`);
      }

      return transcript.fullText;
    } catch (error) {
      logger.error('Error fetching transcript text from MongoDB:', error);
      throw error;
    }
  }

  /**
   * Get transcript segments by MongoDB ID
   */
  async getTranscriptSegments(mongodbId: string): Promise<ITranscriptSegment[]> {
    try {
      const Model = await this.ensureConnected();

      const transcript = await Model.findById(mongodbId).select('segments');

      if (!transcript) {
        throw new Error(`Transcript not found: ${mongodbId}`);
      }

      return transcript.segments;
    } catch (error) {
      logger.error('Error fetching transcript segments from MongoDB:', error);
      throw error;
    }
  }

  /**
   * Get transcript by meeting ID
   */
  async getTranscriptByMeetingId(meetingId: string, organizationId: string): Promise<ITranscript | null> {
    try {
      const Model = await this.ensureConnected();

      const transcript = await Model.findOne({
        meetingId,
        organizationId,
      }).sort({ createdAt: -1 }); // Get latest

      return transcript;
    } catch (error) {
      logger.error('Error fetching transcript by meeting ID:', error);
      throw error;
    }
  }

  /**
   * Update transcript segments
   */
  async updateTranscriptSegments(
    mongodbId: string,
    segments: ITranscriptSegment[]
  ): Promise<void> {
    try {
      const Model = await this.ensureConnected();

      // Recalculate derived fields
      const fullText = segments.map(s => s.text).join(' ');
      const wordCount = fullText.split(/\s+/).length;
      const duration = segments.length > 0
        ? segments[segments.length - 1].endTime
        : 0;

      await Model.findByIdAndUpdate(mongodbId, {
        segments,
        fullText,
        wordCount,
        duration,
      });

      logger.info('Transcript updated in MongoDB', { mongodbId });
    } catch (error) {
      logger.error('Error updating transcript in MongoDB:', error);
      throw error;
    }
  }

  /**
   * Search transcripts by text
   */
  async searchTranscripts(
    organizationId: string,
    searchQuery: string,
    limit: number = 20
  ): Promise<Array<{ meetingId: string; segments: ITranscriptSegment[] }>> {
    try {
      const Model = await this.ensureConnected();

      const results = await Model.find({
        organizationId,
        $text: { $search: searchQuery },
      })
        .select('meetingId segments')
        .limit(limit)
        .sort({ score: { $meta: 'textScore' } });

      return results.map(r => ({
        meetingId: r.meetingId,
        segments: r.segments,
      }));
    } catch (error) {
      logger.error('Error searching transcripts in MongoDB:', error);
      throw error;
    }
  }

  /**
   * Delete transcript
   */
  async deleteTranscript(mongodbId: string): Promise<void> {
    try {
      const Model = await this.ensureConnected();

      await Model.findByIdAndDelete(mongodbId);

      logger.info('Transcript deleted from MongoDB', { mongodbId });
    } catch (error) {
      logger.error('Error deleting transcript from MongoDB:', error);
      throw error;
    }
  }

  /**
   * Close MongoDB connection
   */
  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.close();
      this.connection = null;
      this.TranscriptModel = null;
      this.connectionPromise = null;
      logger.info('MongoDB disconnected');
    }
  }
}

// Export singleton instance
export const mongoDBService = new MongoDBService();

// Export types
export type { ITranscript, ITranscriptSegment };
