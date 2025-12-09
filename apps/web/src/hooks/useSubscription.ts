/**
 * useSubscription Hook
 * Manages subscription data, plan changes, and Stripe checkout
 */

import { useState, useEffect, useCallback } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import apiClient from '@/lib/api';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export interface Plan {
  id: string;
  name: string;
  price: number;
  priceAnnual?: number;
  interval: string;
  features: string[];
}

export interface Subscription {
  tier: string;
  status: string;
  expiresAt: string | null;
  isActive: boolean;
}

export interface Usage {
  meetingsRecorded: number;
  meetingsLimit: number;
  storageUsedMB: number;
  storageLimitMB: number;
  aiMinutesUsed: number;
  aiMinutesLimit: number;
  periodStart: string;
  periodEnd: string;
}

export interface Invoice {
  id: string;
  number: string;
  amount: number;
  currency: string;
  status: string;
  date: string;
  pdfUrl: string;
  hostedUrl: string;
}

export interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  isDefault: boolean;
}

interface UseSubscriptionReturn {
  // Data
  subscription: Subscription | null;
  plans: Plan[];
  usage: Usage | null;
  invoices: Invoice[];
  paymentMethods: PaymentMethod[];

  // Loading states
  loading: boolean;
  plansLoading: boolean;
  usageLoading: boolean;
  invoicesLoading: boolean;
  paymentMethodsLoading: boolean;

  // Error states
  error: string | null;

  // Actions
  changePlan: (planId: string, interval?: 'month' | 'year') => Promise<void>;
  cancelSubscription: () => Promise<void>;
  resumeSubscription: () => Promise<void>;
  addPaymentMethod: (paymentMethodId: string) => Promise<void>;
  removePaymentMethod: (paymentMethodId: string) => Promise<void>;
  downloadInvoice: (invoiceId: string) => void;
  refreshData: () => Promise<void>;

  // Stripe
  stripe: Stripe | null;
}

export function useSubscription(): UseSubscriptionReturn {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  const [loading, setLoading] = useState(true);
  const [plansLoading, setPlansLoading] = useState(true);
  const [usageLoading, setUsageLoading] = useState(true);
  const [invoicesLoading, setInvoicesLoading] = useState(true);
  const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [stripe, setStripe] = useState<Stripe | null>(null);

  // Initialize Stripe
  useEffect(() => {
    stripePromise.then(setStripe);
  }, []);

  // Fetch subscription data
  const fetchSubscription = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getSubscription();
      setSubscription(data.subscription);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch subscription');
      console.error('Error fetching subscription:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch available plans
  const fetchPlans = useCallback(async () => {
    try {
      setPlansLoading(true);
      const response = await apiClient.get('/billing/plans');
      setPlans(response.data || []);
    } catch (err: any) {
      console.error('Error fetching plans:', err);
    } finally {
      setPlansLoading(false);
    }
  }, []);

  // Fetch usage data
  const fetchUsage = useCallback(async () => {
    try {
      setUsageLoading(true);
      const data = await apiClient.getUsage();
      setUsage(data.usage || null);
    } catch (err: any) {
      console.error('Error fetching usage:', err);
    } finally {
      setUsageLoading(false);
    }
  }, []);

  // Fetch invoices
  const fetchInvoices = useCallback(async () => {
    try {
      setInvoicesLoading(true);
      const response = await apiClient.getInvoices();
      setInvoices(response.data || []);
    } catch (err: any) {
      console.error('Error fetching invoices:', err);
    } finally {
      setInvoicesLoading(false);
    }
  }, []);

  // Fetch payment methods
  const fetchPaymentMethods = useCallback(async () => {
    try {
      setPaymentMethodsLoading(true);
      const response = await apiClient.get('/billing/payment-methods');
      setPaymentMethods(response.data || []);
    } catch (err: any) {
      console.error('Error fetching payment methods:', err);
    } finally {
      setPaymentMethodsLoading(false);
    }
  }, []);

  // Refresh all data
  const refreshData = useCallback(async () => {
    await Promise.all([
      fetchSubscription(),
      fetchPlans(),
      fetchUsage(),
      fetchInvoices(),
      fetchPaymentMethods(),
    ]);
  }, [fetchSubscription, fetchPlans, fetchUsage, fetchInvoices, fetchPaymentMethods]);

  // Initial data fetch
  useEffect(() => {
    refreshData();
  }, []);

  // Change plan (upgrade/downgrade)
  const changePlan = useCallback(async (planId: string, interval: 'month' | 'year' = 'month') => {
    try {
      setError(null);

      // Create subscription or checkout session
      await apiClient.post('/billing/subscription', {
        tier: planId,
        interval,
      });

      // Refresh subscription data
      await fetchSubscription();
      await fetchUsage();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to change plan';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchSubscription, fetchUsage]);

  // Cancel subscription
  const cancelSubscription = useCallback(async () => {
    try {
      setError(null);
      await apiClient.post('/billing/subscription/cancel');
      await fetchSubscription();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to cancel subscription';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchSubscription]);

  // Resume subscription
  const resumeSubscription = useCallback(async () => {
    try {
      setError(null);
      await apiClient.post('/billing/subscription/resume');
      await fetchSubscription();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to resume subscription';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchSubscription]);

  // Add payment method
  const addPaymentMethod = useCallback(async (paymentMethodId: string) => {
    try {
      setError(null);
      await apiClient.post('/billing/payment-methods', { paymentMethodId });
      await fetchPaymentMethods();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to add payment method';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchPaymentMethods]);

  // Remove payment method
  const removePaymentMethod = useCallback(async (paymentMethodId: string) => {
    try {
      setError(null);
      await apiClient.delete(`/billing/payment-methods/${paymentMethodId}`);
      await fetchPaymentMethods();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to remove payment method';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchPaymentMethods]);

  // Download invoice
  const downloadInvoice = useCallback((invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice?.pdfUrl) {
      window.open(invoice.pdfUrl, '_blank');
    } else if (invoice?.hostedUrl) {
      window.open(invoice.hostedUrl, '_blank');
    }
  }, [invoices]);

  return {
    // Data
    subscription,
    plans,
    usage,
    invoices,
    paymentMethods,

    // Loading states
    loading,
    plansLoading,
    usageLoading,
    invoicesLoading,
    paymentMethodsLoading,

    // Error
    error,

    // Actions
    changePlan,
    cancelSubscription,
    resumeSubscription,
    addPaymentMethod,
    removePaymentMethod,
    downloadInvoice,
    refreshData,

    // Stripe
    stripe,
  };
}
