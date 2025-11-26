/**
 * Coaching Routes
 * AI-powered coaching scorecards and performance evaluation
 */

import { Router, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';
import { authMiddleware as authenticate } from '../middleware/auth';
import CoachingScorecardService from '../services/CoachingScorecardService';
import { logger } from '../utils/logger';
import { Counter, Histogram } from 'prom-client';

const router = Router();
const coachingService = new CoachingScorecardService();

// Metrics
const requestDuration = new Histogram({
  name: 'coaching_request_duration_seconds',
  help: 'Duration of coaching API requests',
  labelNames: ['endpoint'],
});

const scorecardCounter = new Counter({
  name: 'coaching_scorecards_total',
  help: 'Total number of scorecards generated',
  labelNames: ['template_type'],
});

// Apply authentication to all routes
router.use(authenticate);

/**
 * GET /api/coaching/scorecards
 * List all scorecards for the organization
 */
router.get('/scorecards', async (req: Request, res: Response): Promise<void> => {
  const end = requestDuration.startTimer({ endpoint: 'list_scorecards' });

  try {
    const organizationId = (req as any).user.organizationId;
    const userId = (req as any).user.id;

    if (!organizationId) {
      res.status(403).json({ error: 'Organization membership required' });
      return;
    }

    logger.info('Listing scorecards', { organizationId, userId });

    const scorecards = await coachingService.listScorecards(organizationId);
    res.json(scorecards);
  } catch (error) {
    logger.error('Error listing scorecards', { error });
    res.status(500).json({ error: 'Failed to list scorecards' });
  } finally {
    end();
  }
});

/**
 * GET /api/coaching/templates
 * Get available scorecard templates
 */
router.get('/templates', async (_req: Request, res: Response): Promise<void> => {
  const end = requestDuration.startTimer({ endpoint: 'get_templates' });

  try {
    const templates = [
      {
        type: 'sales',
        name: 'Sales Methodology',
        description: 'MEDDPICC, BANT, and discovery best practices',
        icon: 'TrendingUp',
        criteria: 5,
      },
      {
        type: 'support',
        name: 'Customer Support',
        description: 'Problem resolution, empathy, and technical proficiency',
        icon: 'Headphones',
        criteria: 5,
      },
      {
        type: 'leadership',
        name: 'Leadership & 1:1s',
        description: 'Goal setting, feedback delivery, and team development',
        icon: 'Users',
        criteria: 5,
      },
      {
        type: 'recruiting',
        name: 'Recruiting Interview',
        description: 'Behavioral questions, culture fit, and candidate experience',
        icon: 'UserCheck',
        criteria: 5,
      },
      {
        type: 'customer_success',
        name: 'Customer Success',
        description: 'Value realization, relationship building, and expansion',
        icon: 'Award',
        criteria: 5,
      },
    ];

    res.json(templates);
  } catch (error) {
    logger.error('Error getting templates', { error });
    res.status(500).json({ error: 'Failed to get templates' });
  } finally {
    end();
  }
});

/**
 * POST /api/coaching/scorecards
 * Create a new scorecard from template
 */
router.post(
  '/scorecards',
  [
    body('templateType')
      .isIn(['sales', 'support', 'leadership', 'recruiting', 'customer_success'])
      .withMessage('Invalid template type'),
    body('name').optional().isString().isLength({ min: 1, max: 100 }),
    body('customCriteria').optional().isArray(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const end = requestDuration.startTimer({ endpoint: 'create_scorecard' });

    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const organizationId = (req as any).user.organizationId;
      const userId = (req as any).user.id;

      if (!organizationId) {
        res.status(403).json({ error: 'Organization membership required' });
        return;
      }

      const { templateType, name, customCriteria } = req.body;

      logger.info('Creating scorecard from template', {
        organizationId,
        userId,
        templateType,
      });

      const framework = await coachingService.createFromTemplate(
        organizationId,
        templateType
      );

      // If custom name provided, update it
      if (name) {
        framework.name = name;
      }

      // If custom criteria provided, merge them
      if (customCriteria && Array.isArray(customCriteria)) {
        framework.criteria = [...framework.criteria, ...customCriteria];
      }

      scorecardCounter.inc({ template_type: templateType });
      res.status(201).json(framework);
    } catch (error) {
      logger.error('Error creating scorecard', { error });
      res.status(500).json({ error: 'Failed to create scorecard' });
    } finally {
      end();
    }
  }
);

/**
 * GET /api/coaching/scorecards/:id
 * Get a specific scorecard
 */
router.get(
  '/scorecards/:id',
  [param('id').isString()],
  async (req: Request, res: Response): Promise<void> => {
    const end = requestDuration.startTimer({ endpoint: 'get_scorecard' });

    try {
      const organizationId = (req as any).user.organizationId;
      const { id } = req.params;

      if (!organizationId) {
        res.status(403).json({ error: 'Organization membership required' });
        return;
      }

      logger.info('Getting scorecard', { organizationId, scorecardId: id });

      const scorecard = await coachingService.getFramework(id, organizationId);

      if (!scorecard) {
        res.status(404).json({ error: 'Scorecard not found' });
        return;
      }

      res.json(scorecard);
    } catch (error) {
      logger.error('Error getting scorecard', { error });
      res.status(500).json({ error: 'Failed to get scorecard' });
    } finally {
      end();
    }
  }
);

/**
 * POST /api/coaching/score/:meetingId
 * Score a meeting with a scorecard
 */
router.post(
  '/score/:meetingId',
  [
    param('meetingId').isUUID(),
    body('scorecardId').optional().isString(),
    body('templateType')
      .optional()
      .isIn(['sales', 'support', 'leadership', 'recruiting', 'customer_success']),
  ],
  async (req: Request, res: Response): Promise<void> => {
    const end = requestDuration.startTimer({ endpoint: 'score_meeting' });

    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const organizationId = (req as any).user.organizationId;
      const userId = (req as any).user.id;
      const { meetingId } = req.params;
      const { scorecardId, templateType } = req.body;

      if (!organizationId) {
        res.status(403).json({ error: 'Organization membership required' });
        return;
      }

      if (!scorecardId && !templateType) {
        res.status(400).json({
          error: 'Either scorecardId or templateType is required'
        });
        return;
      }

      logger.info('Scoring meeting', {
        organizationId,
        userId,
        meetingId,
        scorecardId,
        templateType,
      });

      // If templateType provided, create a framework first
      let frameworkId = scorecardId;
      if (!frameworkId && templateType) {
        const framework = await coachingService.createFromTemplate(
          organizationId,
          templateType
        );
        frameworkId = framework.id;
      }

      const scorecard = await coachingService.generateScorecard(
        meetingId,
        frameworkId,
        userId
      );

      res.json(scorecard);
    } catch (error) {
      logger.error('Error scoring meeting', { error });
      res.status(500).json({ error: 'Failed to score meeting' });
    } finally {
      end();
    }
  }
);

/**
 * GET /api/coaching/metrics/:meetingId
 * Get call metrics for a meeting
 */
router.get(
  '/metrics/:meetingId',
  [param('meetingId').isUUID()],
  async (req: Request, res: Response): Promise<void> => {
    const end = requestDuration.startTimer({ endpoint: 'get_metrics' });

    try {
      const organizationId = (req as any).user.organizationId;
      const { meetingId } = req.params;

      if (!organizationId) {
        res.status(403).json({ error: 'Organization membership required' });
        return;
      }

      logger.info('Getting call metrics', { organizationId, meetingId });

      const metrics = await coachingService.calculateCallMetrics(meetingId);
      res.json(metrics);
    } catch (error) {
      logger.error('Error getting call metrics', { error });
      res.status(500).json({ error: 'Failed to get call metrics' });
    } finally {
      end();
    }
  }
);

/**
 * GET /api/coaching/history/:meetingId
 * Get scoring history for a meeting
 */
router.get(
  '/history/:meetingId',
  [param('meetingId').isUUID()],
  async (req: Request, res: Response): Promise<void> => {
    const end = requestDuration.startTimer({ endpoint: 'get_history' });

    try {
      const organizationId = (req as any).user.organizationId;
      const { meetingId } = req.params;

      if (!organizationId) {
        res.status(403).json({ error: 'Organization membership required' });
        return;
      }

      logger.info('Getting scoring history', { organizationId, meetingId });

      const history = await coachingService.getScoringHistory(meetingId, organizationId);
      res.json(history);
    } catch (error) {
      logger.error('Error getting scoring history', { error });
      res.status(500).json({ error: 'Failed to get scoring history' });
    } finally {
      end();
    }
  }
);

export default router;