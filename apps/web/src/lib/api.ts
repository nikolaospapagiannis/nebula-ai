/**
 * API Client for Frontend
 * Handles all API calls to the backend with secure cookie-based authentication
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Send cookies with requests
    });

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiError>) => {
        if (error.response?.status === 401) {
          // Token expired or invalid - try to refresh
          try {
            await this.refreshToken();
            // Retry the original request
            if (error.config) {
              return this.client.request(error.config);
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            if (typeof window !== 'undefined') {
              // Clear any client-side state
              this.clearClientState();
              window.location.href = '/login';
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Clear client-side state (non-sensitive data only)
   */
  private clearClientState() {
    if (typeof window !== 'undefined') {
      // Only clear non-sensitive UI state, NOT auth tokens
      localStorage.removeItem('user_preferences');
      sessionStorage.clear();
    }
  }

  /**
   * Get user info from cookie (non-httpOnly cookie set by backend)
   */
  getUserInfo(): any | null {
    if (typeof window === 'undefined') return null;

    const cookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('user_info='));

    if (!cookie) return null;

    try {
      return JSON.parse(decodeURIComponent(cookie.split('=')[1]));
    } catch {
      return null;
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', { email, password });
    return response.data;
  }

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    organizationName?: string;
  }) {
    const response = await this.client.post('/auth/register', data);
    return response.data;
  }

  async logout() {
    try {
      await this.client.post('/auth/logout');
    } finally {
      this.clearClientState();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }

  async refreshToken() {
    const response = await this.client.post('/auth/refresh');
    return response.data;
  }

  async forgotPassword(email: string) {
    return this.client.post('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, password: string) {
    return this.client.post('/auth/reset-password', { token, password });
  }

  async verifyEmail(token: string) {
    return this.client.post('/auth/verify-email', { token });
  }

  // MFA endpoints
  async setupMFA() {
    const response = await this.client.post('/auth/setup-mfa');
    return response.data;
  }

  async verifyMFA(mfaToken: string, code: string) {
    const response = await this.client.post('/auth/verify-mfa', { mfaToken, code });
    return response.data;
  }

  // User endpoints
  async getCurrentUser() {
    const response = await this.client.get('/users/me');
    return response.data;
  }

  async updateProfile(data: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    avatar: string;
  }>) {
    const response = await this.client.patch('/users/me', data);
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string) {
    return this.client.post('/users/change-password', {
      currentPassword,
      newPassword,
    });
  }

  // Organization endpoints
  async getOrganization() {
    const response = await this.client.get('/organizations/current');
    return response.data;
  }

  async updateOrganization(data: Partial<{
    name: string;
    logo: string;
    website: string;
    industry: string;
    size: string;
  }>) {
    const response = await this.client.patch('/organizations/current', data);
    return response.data;
  }

  async inviteTeamMember(email: string, role: string) {
    return this.client.post('/organizations/invite', { email, role });
  }

  async getTeamMembers() {
    const response = await this.client.get('/organizations/members');
    return response.data;
  }

  async removeTeamMember(userId: string) {
    return this.client.delete(`/organizations/members/${userId}`);
  }

  async updateTeamMemberRole(userId: string, role: string) {
    return this.client.patch(`/organizations/members/${userId}`, { role });
  }

  // Meeting endpoints
  async getMeetings(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const response = await this.client.get('/meetings', { params });
    return response.data;
  }

  async getMeeting(id: string) {
    const response = await this.client.get(`/meetings/${id}`);
    return response.data;
  }

  async createMeeting(data: {
    title: string;
    description?: string;
    scheduledStartAt: string;
    scheduledEndAt: string;
    meetingUrl?: string;
    platform?: string;
    attendees?: string[];
  }) {
    const response = await this.client.post('/meetings', data);
    return response.data;
  }

  async updateMeeting(id: string, data: Partial<{
    title: string;
    description: string;
    scheduledStartAt: string;
    scheduledEndAt: string;
    status: string;
  }>) {
    const response = await this.client.patch(`/meetings/${id}`, data);
    return response.data;
  }

  async deleteMeeting(id: string) {
    return this.client.delete(`/meetings/${id}`);
  }

  async deleteMeetings(ids: string[]) {
    return this.client.post('/meetings/batch-delete', { ids });
  }

  async getMeetingDetail(id: string) {
    const response = await this.client.get(`/meetings/${id}/detail`);
    return response.data;
  }

  async exportMeetings(params: {
    meetingIds: string[];
    format: 'csv' | 'json' | 'pdf';
  }) {
    const response = await this.client.post('/meetings/export', params, {
      responseType: 'blob',
    });
    return response.data;
  }

  async startRecording(meetingId: string) {
    return this.client.post(`/meetings/${meetingId}/record`);
  }

  async stopRecording(meetingId: string) {
    return this.client.post(`/meetings/${meetingId}/stop-recording`);
  }

  // Transcript endpoints
  async getTranscript(meetingId: string) {
    const response = await this.client.get(`/meetings/${meetingId}/transcript`);
    return response.data;
  }

  async updateTranscript(meetingId: string, content: string) {
    const response = await this.client.put(`/meetings/${meetingId}/transcript`, {
      content,
    });
    return response.data;
  }

  async downloadTranscript(meetingId: string, format: 'pdf' | 'txt' | 'docx' = 'pdf') {
    const response = await this.client.get(`/meetings/${meetingId}/transcript/download`, {
      params: { format },
      responseType: 'blob',
    });
    return response.data;
  }

  async searchTranscripts(query: string, params?: {
    page?: number;
    limit?: number;
  }) {
    const response = await this.client.get('/transcripts/search', {
      params: { q: query, ...params },
    });
    return response.data;
  }

  // AI Analysis endpoints
  async getAnalysis(meetingId: string) {
    const response = await this.client.get(`/meetings/${meetingId}/analysis`);
    return response.data;
  }

  async regenerateAnalysis(meetingId: string) {
    return this.client.post(`/meetings/${meetingId}/analysis/regenerate`);
  }

  // Integration endpoints
  async getIntegrations() {
    const response = await this.client.get('/integrations');
    return response.data;
  }

  async initiateIntegrationOAuth(type: string) {
    const response = await this.client.get(`/integrations/${type}/oauth/initiate`);
    return response.data;
  }

  async connectIntegration(type: string, authCode: string) {
    return this.client.post(`/integrations/${type}/connect`, { authCode });
  }

  async disconnectIntegration(type: string) {
    return this.client.post(`/integrations/${type}/disconnect`);
  }

  async getIntegrationStatus(type: string) {
    const response = await this.client.get(`/integrations/${type}/status`);
    return response.data;
  }

  async updateIntegrationSettings(type: string, settings: any) {
    const response = await this.client.put(`/integrations/${type}/settings`, settings);
    return response.data;
  }

  // Analytics endpoints
  async getAnalytics(params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month';
  }) {
    const response = await this.client.get('/analytics', { params });
    return response.data;
  }

  async getMeetingStats() {
    const response = await this.client.get('/analytics/meetings');
    return response.data;
  }

  async getUserStats() {
    const response = await this.client.get('/analytics/users');
    return response.data;
  }

  // File upload
  async uploadFile(file: File, type: 'avatar' | 'logo' | 'attachment') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    const response = await this.client.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }

  // Webhook endpoints
  async getWebhooks() {
    const response = await this.client.get('/webhooks');
    return response.data;
  }

  async createWebhook(data: {
    url: string;
    events: string[];
    active?: boolean;
  }) {
    const response = await this.client.post('/webhooks', data);
    return response.data;
  }

  async updateWebhook(id: string, data: Partial<{
    url: string;
    events: string[];
    active: boolean;
  }>) {
    const response = await this.client.patch(`/webhooks/${id}`, data);
    return response.data;
  }

  async deleteWebhook(id: string) {
    return this.client.delete(`/webhooks/${id}`);
  }

  // API Keys
  async getApiKeys() {
    const response = await this.client.get('/api-keys');
    return response.data;
  }

  async createApiKey(name: string) {
    const response = await this.client.post('/api-keys', { name });
    return response.data;
  }

  async revokeApiKey(id: string) {
    return this.client.delete(`/api-keys/${id}`);
  }

  // Billing
  async getBillingInfo() {
    const response = await this.client.get('/billing');
    return response.data;
  }

  async getSubscription() {
    const response = await this.client.get('/billing/subscription');
    return response.data;
  }

  async updatePaymentMethod(paymentMethodId: string) {
    return this.client.post('/billing/payment-method', { paymentMethodId });
  }

  async getInvoices() {
    const response = await this.client.get('/billing/invoices');
    return response.data;
  }

  async getUsage() {
    const response = await this.client.get('/billing/usage');
    return response.data;
  }

  // Topic Tracker endpoints
  async getTopics(params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }) {
    const response = await this.client.get('/topics', { params });
    return response.data;
  }

  async getTopic(id: string) {
    const response = await this.client.get(`/topics/${id}`);
    return response.data;
  }

  async createTopic(data: {
    keyword: string;
    name?: string;
    description?: string;
    alertThreshold?: number;
    alertEnabled?: boolean;
    alertRecipients?: string[];
  }) {
    const response = await this.client.post('/topics', data);
    return response.data;
  }

  async updateTopic(id: string, data: Partial<{
    keyword: string;
    name: string;
    description: string;
    alertThreshold: number;
    alertEnabled: boolean;
    alertRecipients: string[];
    isActive: boolean;
  }>) {
    const response = await this.client.patch(`/topics/${id}`, data);
    return response.data;
  }

  async deleteTopic(id: string) {
    return this.client.delete(`/topics/${id}`);
  }

  async getTopicMentions(id: string, params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }) {
    const response = await this.client.get(`/topics/${id}/mentions`, { params });
    return response.data;
  }

  async getTopicTrends(id: string, params?: {
    period?: '7d' | '30d' | '90d' | 'custom';
    startDate?: string;
    endDate?: string;
  }) {
    const response = await this.client.get(`/topics/${id}/trends`, { params });
    return response.data;
  }

  async getTopicAlerts(id: string, params?: {
    page?: number;
    limit?: number;
  }) {
    const response = await this.client.get(`/topics/${id}/alerts`, { params });
    return response.data;
  }

  async getTopicCorrelations(id: string) {
    const response = await this.client.get(`/topics/${id}/correlations`);
    return response.data;
  }

  async configureTopicAlert(id: string, data: {
    type: 'mention_spike' | 'first_mention' | 'sentiment_change';
    threshold: number;
    enabled: boolean;
    recipients: string[];
  }) {
    const response = await this.client.post(`/topics/${id}/alerts/configure`, data);
    return response.data;
  }

  // Generic HTTP methods for custom endpoints
  async get(url: string, config?: any) {
    const response = await this.client.get(url, config);
    return response.data;
  }

  async post(url: string, data?: any, config?: any) {
    const response = await this.client.post(url, data, config);
    return response.data;
  }

  async put(url: string, data?: any, config?: any) {
    const response = await this.client.put(url, data, config);
    return response.data;
  }

  async patch(url: string, data?: any, config?: any) {
    const response = await this.client.patch(url, data, config);
    return response.data;
  }

  async delete(url: string, config?: any) {
    const response = await this.client.delete(url, config);
    return response.data;
  }
}

// Create singleton instance
const apiClient = new ApiClient();
export default apiClient;
