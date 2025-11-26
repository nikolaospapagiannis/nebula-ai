/**
 * Chrome Extension Routes
 *
 * API endpoints for Chrome Extension (Botless Recording)
 */

import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import multer from 'multer';
import { chromeExtensionService } from '../services/ChromeExtensionService';
import { logger } from '../utils/logger';
import { authenticateToken } from '../middleware/auth';

const router: express.Router = express.Router();

// Configure multer for audio uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max per chunk
  },
});

/**
 * Start new recording session
 * POST /api/extension/sessions/start
 */
router.post(
  '/sessions/start',
  authenticateToken,
  [
    body('platform').isString().notEmpty(),
    body('meetingUrl').isURL(),
    body('meetingId').optional().isString(),
    body('title').optional().isString(),
    body('participants').optional().isArray(),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const userId = (req as any).user?.id;
      const organizationId = (req as any).user?.organizationId;

      if (!userId || !organizationId) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }

      const { platform, meetingUrl, meetingId, title, participants } = req.body;

      // Check if platform is supported
      if (!chromeExtensionService.isPlatformSupported(meetingUrl)) {
        return res.status(400).json({
          success: false,
          error: 'Unsupported meeting platform',
        });
      }

      // Start session
      const session = await chromeExtensionService.startSession(
        userId,
        organizationId,
        {
          platform,
          meetingUrl,
          meetingId,
          title,
          participants,
          startTime: new Date(),
        }
      );

      res.json({
        success: true,
        session: {
          id: session.id,
          meetingId: session.meetingId,
          platform: session.platform,
          status: session.status,
          startedAt: session.startedAt,
        },
      });
    } catch (error) {
      logger.error('Error starting extension session', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to start recording session',
      });
    }
  }
);

/**
 * Upload audio chunk
 * POST /api/extension/sessions/:sessionId/audio
 */
router.post(
  '/sessions/:sessionId/audio',
  authenticateToken,
  upload.single('audio'),
  async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          error: 'Audio file required',
        });
      }

      const {
        chunkIndex,
        timestamp,
        format = 'webm',
        sampleRate = 48000,
        channels = 1,
      } = req.body;

      await chromeExtensionService.uploadAudioChunk({
        sessionId,
        chunkIndex: parseInt(chunkIndex || '0'),
        audioData: file.buffer,
        timestamp: parseInt(timestamp || Date.now().toString()),
        format,
        sampleRate: parseInt(sampleRate),
        channels: parseInt(channels),
      });

      res.json({
        success: true,
        message: 'Audio chunk uploaded',
      });
    } catch (error) {
      logger.error('Error uploading audio chunk', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to upload audio',
      });
    }
  }
);

/**
 * Upload screenshot/slide
 * POST /api/extension/sessions/:sessionId/screenshot
 */
router.post(
  '/sessions/:sessionId/screenshot',
  authenticateToken,
  upload.single('screenshot'),
  async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          error: 'Screenshot file required',
        });
      }

      const { timestamp } = req.body;

      await chromeExtensionService.captureScreenshot(
        sessionId,
        file.buffer,
        parseInt(timestamp || Date.now().toString())
      );

      res.json({
        success: true,
        message: 'Screenshot captured',
      });
    } catch (error) {
      logger.error('Error capturing screenshot', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to capture screenshot',
      });
    }
  }
);

/**
 * End recording session
 * POST /api/extension/sessions/:sessionId/end
 */
router.post(
  '/sessions/:sessionId/end',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;

      await chromeExtensionService.endSession(sessionId);

      res.json({
        success: true,
        message: 'Recording session ended',
      });
    } catch (error) {
      logger.error('Error ending extension session', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to end session',
      });
    }
  }
);

/**
 * Get session statistics
 * GET /api/extension/sessions/:sessionId/stats
 */
router.get(
  '/sessions/:sessionId/stats',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;

      const stats = await chromeExtensionService.getSessionStats(sessionId);

      res.json({
        success: true,
        stats,
      });
    } catch (error) {
      logger.error('Error getting session stats', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to get session statistics',
      });
    }
  }
);

/**
 * Get active session for current user
 * GET /api/extension/sessions/active
 */
router.get('/sessions/active', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    const session = await chromeExtensionService.getActiveSession(userId);

    res.json({
      success: true,
      session: session
        ? {
            id: session.id,
            meetingId: session.meetingId,
            platform: session.platform,
            status: session.status,
            startedAt: session.startedAt,
            audioChunks: session.audioChunks,
            transcriptSegments: session.transcriptSegments,
          }
        : null,
    });
  } catch (error) {
    logger.error('Error getting active session', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to get active session',
    });
  }
});

/**
 * Get extension settings
 * GET /api/extension/settings
 */
router.get('/settings', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    const settings = await chromeExtensionService.getExtensionSettings(userId);

    res.json({
      success: true,
      settings,
    });
  } catch (error) {
    logger.error('Error getting extension settings', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to get settings',
    });
  }
});

/**
 * Update extension settings
 * PUT /api/extension/settings
 */
router.put(
  '/settings',
  authenticateToken,
  [
    body('autoRecordMeetings').optional().isBoolean(),
    body('recordAudio').optional().isBoolean(),
    body('recordVideo').optional().isBoolean(),
    body('captureSlides').optional().isBoolean(),
    body('enableLiveCaptions').optional().isBoolean(),
    body('defaultMeetingPrivacy').optional().isIn(['private', 'team', 'organization']),
    body('excludedDomains').optional().isArray(),
    body('notificationPreferences').optional().isObject(),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const userId = (req as any).user?.id;

      const settings = await chromeExtensionService.updateExtensionSettings(
        userId,
        req.body
      );

      res.json({
        success: true,
        settings,
      });
    } catch (error) {
      logger.error('Error updating extension settings', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to update settings',
      });
    }
  }
);

/**
 * Check if platform is supported
 * POST /api/extension/check-platform
 */
router.post(
  '/check-platform',
  authenticateToken,
  [body('url').isURL()],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { url } = req.body;
      const supported = chromeExtensionService.isPlatformSupported(url);

      res.json({
        success: true,
        supported,
        message: supported
          ? 'Platform is supported'
          : 'Platform is not supported. Supported platforms: Zoom, Google Meet, Microsoft Teams, Webex',
      });
    } catch (error) {
      logger.error('Error checking platform', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to check platform',
      });
    }
  }
);

/**
 * Get extension statistics for organization
 * GET /api/extension/stats
 */
router.get('/stats', authenticateToken, async (req: Request, res: Response) => {
  try {
    const organizationId = (req as any).user?.organizationId;

    const stats = await chromeExtensionService.getExtensionStats(organizationId);

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    logger.error('Error getting extension stats', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to get statistics',
    });
  }
});

/**
 * Get extension manifest (for installation)
 * GET /api/extension/manifest
 */
router.get('/manifest', (req: Request, res: Response) => {
  const manifest = {
    manifest_version: 3,
    name: 'Fireflies.ai Meeting Recorder',
    version: '1.0.0',
    description: 'Record and transcribe your meetings with AI-powered insights',
    permissions: [
      'activeTab',
      'tabCapture',
      'storage',
      'notifications',
      'scripting',
    ],
    host_permissions: [
      'https://*.zoom.us/*',
      'https://meet.google.com/*',
      'https://*.teams.microsoft.com/*',
      'https://*.webex.com/*',
    ],
    background: {
      service_worker: 'background.js',
    },
    content_scripts: [
      {
        matches: [
          'https://*.zoom.us/*',
          'https://meet.google.com/*',
          'https://*.teams.microsoft.com/*',
          'https://*.webex.com/*',
        ],
        js: ['content.js'],
        run_at: 'document_idle',
      },
    ],
    action: {
      default_popup: 'popup.html',
      default_icon: {
        '16': 'icons/icon16.png',
        '48': 'icons/icon48.png',
        '128': 'icons/icon128.png',
      },
    },
    icons: {
      '16': 'icons/icon16.png',
      '48': 'icons/icon48.png',
      '128': 'icons/icon128.png',
    },
    web_accessible_resources: [
      {
        resources: ['injected.js'],
        matches: ['<all_urls>'],
      },
    ],
  };

  res.json(manifest);
});

export default router;
