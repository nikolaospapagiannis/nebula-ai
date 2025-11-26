/**
 * Billing Routes
 * Subscription management, payment processing, and billing operations
 * Integrates with Stripe and billing microservice
 */

import { Router, Request, Response } from 'express';
import { PrismaClient, SubscriptionTier, SubscriptionStatus } from '@prisma/client';
import Redis from 'ioredis';
import { body, query, param, validationResult } from 'express-validator';
import winston from 'winston';
import { authMiddleware } from '../middleware/auth';
import axios from 'axios';

const router: Router = Router();
const prisma = new PrismaClient();
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: { service: 'billing-routes' },
  transports: [new winston.transports.Console()],
});

// Billing microservice URL
const BILLING_SERVICE_URL = process.env.BILLING_SERVICE_URL || 'http://localhost:4000';

router.use(authMiddleware);

/**
 * GET /api/billing/subscription
 * Get current subscription for organization
 */
router.get('/subscription', async (req: Request, res: Response): Promise<void> => {
  try {
    const organizationId = (req as any).user.organizationId;

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        id: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        subscriptionExpiresAt: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
      },
    });

    if (!organization) {
      res.status(404).json({ error: 'Organization not found' });
      return;
    }

    res.json({
      subscription: {
        tier: organization.subscriptionTier,
        status: organization.subscriptionStatus,
        expiresAt: organization.subscriptionExpiresAt,
        isActive: organization.subscriptionStatus === 'active' || organization.subscriptionStatus === 'trialing',
      },
    });
  } catch (error) {
    logger.error('Error fetching subscription:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

/**
 * POST /api/billing/subscription
 * Create or update subscription
 */
router.post(
  '/subscription',
  [
    body('tier').isIn(['pro', 'business', 'enterprise']),
    body('paymentMethodId').optional().isString(),
    body('billingEmail').optional().isEmail(),
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const organizationId = (req as any).user.organizationId;
      const userId = (req as any).user.id;
      const { tier, paymentMethodId, billingEmail } = req.body;

      // Call billing microservice
      const response = await axios.post(`${BILLING_SERVICE_URL}/api/billing/subscriptions`, {
        organizationId,
        priceId: getPriceIdForTier(tier),
        paymentMethodId,
        billingEmail: billingEmail || (req as any).user.email,
      });

      const { subscription } = response.data;

      // Update organization
      await prisma.organization.update({
        where: { id: organizationId },
        data: {
          subscriptionTier: tier as SubscriptionTier,
          subscriptionStatus: subscription.status as SubscriptionStatus,
          stripeCustomerId: subscription.customer,
          stripeSubscriptionId: subscription.id,
        },
      });

      logger.info('Subscription created/updated:', {
        organizationId,
        tier,
        subscriptionId: subscription.id,
        userId,
      });

      res.status(201).json({ subscription });
    } catch (error: any) {
      logger.error('Error creating subscription:', error);
      res.status(500).json({
        error: 'Failed to create subscription',
        details: error.response?.data || error.message,
      });
    }
  }
);

/**
 * POST /api/billing/subscription/cancel
 * Cancel subscription
 */
router.post('/subscription/cancel', async (req: Request, res: Response): Promise<void> => {
  try {
    const organizationId = (req as any).user.organizationId;

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization?.stripeSubscriptionId) {
      res.status(400).json({ error: 'No active subscription found' });
      return;
    }

    // Call billing microservice
    await axios.post(`${BILLING_SERVICE_URL}/api/billing/subscriptions/${organization.stripeSubscriptionId}/cancel`);

    // Update organization
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        subscriptionStatus: 'canceled',
      },
    });

    logger.info('Subscription canceled:', {
      organizationId,
      subscriptionId: organization.stripeSubscriptionId,
    });

    res.json({ message: 'Subscription canceled successfully' });
  } catch (error: any) {
    logger.error('Error canceling subscription:', error);
    res.status(500).json({
      error: 'Failed to cancel subscription',
      details: error.response?.data || error.message,
    });
  }
});

/**
 * POST /api/billing/subscription/resume
 * Resume canceled subscription
 */
router.post('/subscription/resume', async (req: Request, res: Response): Promise<void> => {
  try {
    const organizationId = (req as any).user.organizationId;

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization?.stripeSubscriptionId) {
      res.status(400).json({ error: 'No subscription found' });
      return;
    }

    // Call billing microservice
    const response = await axios.post(`${BILLING_SERVICE_URL}/api/billing/subscriptions/${organization.stripeSubscriptionId}/resume`);

    // Update organization
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        subscriptionStatus: 'active',
      },
    });

    logger.info('Subscription resumed:', {
      organizationId,
      subscriptionId: organization.stripeSubscriptionId,
    });

    res.json(response.data);
  } catch (error: any) {
    logger.error('Error resuming subscription:', error);
    res.status(500).json({
      error: 'Failed to resume subscription',
      details: error.response?.data || error.message,
    });
  }
});

/**
 * GET /api/billing/usage
 * Get current usage statistics
 */
router.get(
  '/usage',
  [query('startDate').optional().isISO8601(), query('endDate').optional().isISO8601()],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const organizationId = (req as any).user.organizationId;
      const { startDate, endDate } = req.query;

      const start = startDate ? new Date(startDate as string) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const end = endDate ? new Date(endDate as string) : new Date();

      // Call billing microservice for usage data
      const response = await axios.get(`${BILLING_SERVICE_URL}/api/billing/usage/${organizationId}`, {
        params: { startDate: start.toISOString(), endDate: end.toISOString() },
      });

      res.json(response.data);
    } catch (error: any) {
      logger.error('Error fetching usage:', error);
      res.status(500).json({
        error: 'Failed to fetch usage',
        details: error.response?.data || error.message,
      });
    }
  }
);

/**
 * GET /api/billing/invoices
 * Get billing invoices
 */
router.get('/invoices', async (req: Request, res: Response): Promise<void> => {
  try {
    const organizationId = (req as any).user.organizationId;

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization?.stripeCustomerId) {
      res.json({ data: [] });
      return;
    }

    // Call billing microservice
    const response = await axios.get(`${BILLING_SERVICE_URL}/api/billing/invoices/${organization.stripeCustomerId}`);

    res.json(response.data);
  } catch (error: any) {
    logger.error('Error fetching invoices:', error);
    res.status(500).json({
      error: 'Failed to fetch invoices',
      details: error.response?.data || error.message,
    });
  }
});

/**
 * GET /api/billing/payment-methods
 * Get payment methods
 */
router.get('/payment-methods', async (req: Request, res: Response): Promise<void> => {
  try {
    const organizationId = (req as any).user.organizationId;

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization?.stripeCustomerId) {
      res.json({ data: [] });
      return;
    }

    // Call billing microservice
    const response = await axios.get(`${BILLING_SERVICE_URL}/api/billing/payment-methods/${organization.stripeCustomerId}`);

    res.json(response.data);
  } catch (error: any) {
    logger.error('Error fetching payment methods:', error);
    res.status(500).json({
      error: 'Failed to fetch payment methods',
      details: error.response?.data || error.message,
    });
  }
});

/**
 * POST /api/billing/payment-methods
 * Add payment method
 */
router.post(
  '/payment-methods',
  [body('paymentMethodId').isString()],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const organizationId = (req as any).user.organizationId;
      const { paymentMethodId } = req.body;

      const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
      });

      if (!organization?.stripeCustomerId) {
        res.status(400).json({ error: 'No customer found' });
        return;
      }

      // Call billing microservice
      const response = await axios.post(`${BILLING_SERVICE_URL}/api/billing/payment-methods`, {
        customerId: organization.stripeCustomerId,
        paymentMethodId,
      });

      logger.info('Payment method added:', { organizationId, paymentMethodId });

      res.status(201).json(response.data);
    } catch (error: any) {
      logger.error('Error adding payment method:', error);
      res.status(500).json({
        error: 'Failed to add payment method',
        details: error.response?.data || error.message,
      });
    }
  }
);

/**
 * DELETE /api/billing/payment-methods/:id
 * Remove payment method
 */
router.delete(
  '/payment-methods/:id',
  [param('id').isString()],
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      // Call billing microservice
      await axios.delete(`${BILLING_SERVICE_URL}/api/billing/payment-methods/${id}`);

      logger.info('Payment method removed:', { paymentMethodId: id });

      res.json({ message: 'Payment method removed successfully' });
    } catch (error: any) {
      logger.error('Error removing payment method:', error);
      res.status(500).json({
        error: 'Failed to remove payment method',
        details: error.response?.data || error.message,
      });
    }
  }
);

/**
 * GET /api/billing/plans
 * Get available subscription plans
 */
router.get('/plans', async (req: Request, res: Response): Promise<void> => {
  try {
    const plans = [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        interval: 'month',
        features: [
          '500 minutes/month storage',
          '10 AI credits/month',
          'Basic transcription',
          'Basic summaries',
          '1 hour max per meeting',
          'Chrome extension',
        ],
      },
      {
        id: 'pro',
        name: 'Pro',
        price: 10,
        priceAnnual: 120,
        interval: 'month',
        features: [
          '10,000 minutes storage',
          'Unlimited AI credits',
          'Video recording',
          'Multi-meeting AI chat',
          'Advanced analytics',
          'All integrations',
          'Priority support',
        ],
      },
      {
        id: 'business',
        name: 'Business',
        price: 25,
        priceAnnual: 240,
        interval: 'month',
        features: [
          'Unlimited storage',
          'Video replay & clips',
          'Revenue intelligence',
          'AI coaching scorecards',
          'Custom templates',
          'Team analytics',
          'API access',
          'Live captions',
        ],
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        price: 79,
        priceAnnual: 780,
        interval: 'month',
        features: [
          'Everything in Business',
          'HIPAA compliance',
          'SSO (SAML, OAuth)',
          'Custom data retention',
          'Dedicated support',
          'Real-time coaching',
          'White-label option',
          'SLA guarantees',
          'Custom AI models',
        ],
      },
    ];

    res.json({ data: plans });
  } catch (error) {
    logger.error('Error fetching plans:', error);
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
});

/**
 * POST /api/billing/webhook
 * Stripe webhook handler (public endpoint, no auth)
 */
router.post('/webhook', async (req: Request, res: Response): Promise<void> => {
  try {
    const signature = req.headers['stripe-signature'];

    if (!signature) {
      res.status(400).json({ error: 'Missing signature' });
      return;
    }

    // Forward to billing microservice
    const response = await axios.post(`${BILLING_SERVICE_URL}/api/billing/webhook`, req.body, {
      headers: {
        'stripe-signature': signature,
        'content-type': 'application/json',
      },
    });

    logger.info('Webhook processed:', response.data);

    res.json({ received: true });
  } catch (error: any) {
    logger.error('Webhook error:', error);
    res.status(400).json({
      error: 'Webhook processing failed',
      details: error.response?.data || error.message,
    });
  }
});

// Helper function to get Stripe price ID for tier
function getPriceIdForTier(tier: string): string {
  const priceIds: Record<string, string> = {
    pro: process.env.STRIPE_PRICE_PRO || 'price_pro',
    business: process.env.STRIPE_PRICE_BUSINESS || 'price_business',
    enterprise: process.env.STRIPE_PRICE_ENTERPRISE || 'price_enterprise',
  };
  return priceIds[tier] || priceIds.pro;
}

export default router;
