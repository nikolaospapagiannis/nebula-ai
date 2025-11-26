/**
 * Production-Safe Logger for Chrome Extension
 * Only logs in development mode, sends errors to backend in production
 */

const isDevelopment = () => {
  try {
    return !('update_url' in chrome.runtime.getManifest());
  } catch (e) {
    // If chrome API not ready, assume development
    return true;
  }
};

class Logger {
  /**
   * Log informational messages (development only)
   */
  static log(message, data = null) {
    if (isDevelopment()) {
      if (data) {
        console.log(`[Fireflies] ${message}`, data);
      } else {
        console.log(`[Fireflies] ${message}`);
      }
    }
  }

  /**
   * Log errors (sent to backend in production)
   */
  static error(message, error = null) {
    if (isDevelopment()) {
      console.error(`[Fireflies Error] ${message}`, error);
    } else {
      // In production, send to error tracking service
      this.sendErrorToBackend(message, error);
    }
  }

  /**
   * Log warnings (development only)
   */
  static warn(message, data = null) {
    if (isDevelopment()) {
      if (data) {
        console.warn(`[Fireflies Warning] ${message}`, data);
      } else {
        console.warn(`[Fireflies Warning] ${message}`);
      }
    }
  }

  /**
   * Track analytics events (sent to backend)
   */
  static analytics(eventName, eventData = {}) {
    // Send to analytics service (no PII)
    const analyticsData = {
      event: eventName,
      timestamp: new Date().toISOString(),
      ...eventData,
    };

    if (isDevelopment()) {
      console.log('[Fireflies Analytics]', analyticsData);
    }

    // Send to backend analytics
    this.sendAnalyticsToBackend(analyticsData);
  }

  /**
   * Send error to backend error tracking
   */
  static async sendErrorToBackend(message, error) {
    try {
      const errorData = {
        message,
        error: error ? {
          message: error.message,
          stack: error.stack,
          name: error.name,
        } : null,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        context: "service_worker",
      };

      // Get auth token
      const result = await chrome.storage.local.get(['access_token']);
      const access_token = result.access_token;

      if (access_token) {
        await fetch(`http://localhost:4000/api/errors`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access_token}`,
          },
          body: JSON.stringify(errorData),
        });
      }
    } catch (err) {
      // Silently fail - don't log errors about logging
    }
  }

  /**
   * Send analytics to backend
   */
  static async sendAnalyticsToBackend(analyticsData) {
    try {
      const result = await chrome.storage.local.get(['access_token']);
      const access_token = result.access_token;

      if (access_token) {
        await fetch(`http://localhost:4000/api/analytics/events`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${access_token}`,
          },
          body: JSON.stringify(analyticsData),
        });
      }
    } catch (err) {
      // Silently fail
    }
  }
}

// Export for use in content scripts and background
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Logger;
}
