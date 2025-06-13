// Environment configuration
const CONFIG = {
  // API endpoints
  API: {
    XRPL: 'https://api.xrpl.org',
    BACKUP_XRPL: 'https://xrplcluster.com',
  },

  // Feature flags
  FEATURES: {
    ANALYTICS: true,
    ERROR_TRACKING: true,
    PERFORMANCE_MONITORING: true,
    SERVICE_WORKER: true,
    PWA: true,
  },

  // Performance thresholds
  PERFORMANCE: {
    LCP_THRESHOLD: 2500, // Largest Contentful Paint
    FID_THRESHOLD: 100, // First Input Delay
    CLS_THRESHOLD: 0.1, // Cumulative Layout Shift
  },

  // Cache settings
  CACHE: {
    VERSION: 'v3',
    MAX_AGE: 31536000, // 1 year in seconds
    NETWORK_TIMEOUT: 5000,
  },

  // Social links
  SOCIAL: {
    TWITTER: 'https://x.com/burnicoin',
    TELEGRAM: 'https://t.me/burnicoin',
    DISCORD: 'https://discord.gg/burnicoin',
    GITHUB: 'https://github.com/burnitoken',
  },

  // Supported languages
  LANGUAGES: ['en', 'de', 'es', 'fr', 'ar', 'bn', 'ja', 'pt', 'ko', 'ru', 'tr', 'zh', 'hi', 'it'],

  // Error reporting
  ERROR_REPORTING: {
    ENABLED: true,
    MAX_ERRORS: 10,
    RATE_LIMIT: 60000, // 1 minute
  },
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
} else if (typeof window !== 'undefined') {
  window.CONFIG = CONFIG;
}
