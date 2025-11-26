/**
 * Billing Service - Stripe Integration
 * Handles subscriptions, payments, and usage tracking
 */

import express from 'express';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import winston from 'winston';
import Bull from 'bull';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });
const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [new winston.transports.Console()]
});

// Queue for async billing operations
const billingQueue = new Bull('billing', process.env.REDIS_URL || 'redis://localhost:6379');

app.use(express.json());
app.use(express.raw({ type: 'application/webhook+json' }));

// Create subscription
app.post('/api/billing/subscriptions', async (req, res) => {
  try {
    const { organizationId, priceId, paymentMethodId } = req.body;

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId }
    });

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    let customerId = organization.stripeCustomerId;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: organization.name,
        metadata: { organizationId }
      });
      customerId = customer.id;

      await prisma.organization.update({
        where: { id: organizationId },
        data: { stripeCustomerId: customerId }
      });
    }

    // Attach payment method
    await stripe.paymentMethods.attach(paymentMethodId, { customer: customerId });
    await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId }
    });

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      expand: ['latest_invoice.payment_intent'],
      metadata: { organizationId }
    });

    // Update organization
    await prisma.organization.update({
      where: { id: organizationId },
      data: {
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: 'active',
        subscriptionTier: getPriceTier(priceId)
      }
    });

    logger.info('Subscription created', { organizationId, subscriptionId: subscription.id });

    res.json({
      subscriptionId: subscription.id,
      status: subscription.status,
      clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret
    });
  } catch (error: any) {
    logger.error('Subscription creation failed', { error: error.message });
    res.status(500).json({ error: 'Failed to create subscription' });
  }
});

// Cancel subscription
app.delete('/api/billing/subscriptions/:subscriptionId', async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { immediately } = req.query;

    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: immediately !== 'true'
    });

    if (immediately === 'true') {
      await stripe.subscriptions.cancel(subscriptionId);
    }

    await prisma.organization.updateMany({
      where: { stripeSubscriptionId: subscriptionId },
      data: { subscriptionStatus: 'canceled' }
    });

    logger.info('Subscription canceled', { subscriptionId });
    res.json({ status: 'canceled' });
  } catch (error: any) {
    logger.error('Subscription cancellation failed', { error: error.message });
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Track usage
app.post('/api/billing/usage', async (req, res) => {
  try {
    const { organizationId, metricType, quantity } = req.body;

    const usage = await prisma.usageMetric.create({
      data: {
        organizationId,
        metricType,
        quantity,
        timestamp: new Date()
      }
    });

    // Update Redis cache
    const key = `usage:${organizationId}:${metricType}`;
    await redis.incrby(key, quantity);

    // Queue for aggregation
    await billingQueue.add('aggregate-usage', { organizationId, metricType, quantity });

    res.json({ success: true, usageId: usage.id });
  } catch (error: any) {
    logger.error('Usage tracking failed', { error: error.message });
    res.status(500).json({ error: 'Failed to track usage' });
  }
});

// Get usage stats
app.get('/api/billing/usage/:organizationId', async (req, res) => {
  try {
    const { organizationId } = req.params;
    const { startDate, endDate } = req.query;

    const usage = await prisma.usageMetric.groupBy({
      by: ['metricType'],
      where: {
        organizationId,
        timestamp: {
          gte: startDate ? new Date(startDate as string) : undefined,
          lte: endDate ? new Date(endDate as string) : undefined
        }
      },
      _sum: { quantity: true }
    });

    res.json({ usage });
  } catch (error: any) {
    logger.error('Usage retrieval failed', { error: error.message });
    res.status(500).json({ error: 'Failed to get usage' });
  }
});

// Stripe webhook handler
app.post('/api/billing/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature']!;

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    logger.info('Webhook received', { type: event.type });

    switch (event.type) {
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        break;

      case 'invoice.payment_succeeded':
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSuccess(invoice);
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailure(failedInvoice);
        break;
    }

    res.json({ received: true });
  } catch (error: any) {
    logger.error('Webhook error', { error: error.message });
    res.status(400).json({ error: 'Webhook processing failed' });
  }
});

// Helper functions
function getPriceTier(priceId: string): string {
  const tierMap: Record<string, string> = {
    'price_pro': 'pro',
    'price_business': 'business',
    'price_enterprise': 'enterprise'
  };
  return tierMap[priceId] || 'free';
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const organizationId = subscription.metadata.organizationId;

  await prisma.organization.update({
    where: { stripeCustomerId: subscription.customer as string },
    data: {
      subscriptionStatus: subscription.status as any,
      subscriptionExpiresAt: new Date(subscription.current_period_end * 1000)
    }
  });

  logger.info('Subscription updated', { organizationId, status: subscription.status });
}

async function handlePaymentSuccess(invoice: Stripe.Invoice) {
  logger.info('Payment succeeded', { invoiceId: invoice.id });
  // Send receipt email, update records, etc.
}

async function handlePaymentFailure(invoice: Stripe.Invoice) {
  logger.error('Payment failed', { invoiceId: invoice.id });
  // Send notification, suspend account if needed
}

// Process billing queue
billingQueue.process('aggregate-usage', async (job) => {
  const { organizationId, metricType } = job.data;
  logger.info('Aggregating usage', { organizationId, metricType });
  // Aggregate and potentially report to Stripe for usage-based billing
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'billing' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  logger.info(`Billing service running on port ${PORT}`);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  await redis.quit();
  await billingQueue.close();
  process.exit(0);
});
