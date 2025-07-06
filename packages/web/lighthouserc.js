module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000',
        'http://localhost:3000/learn',
        'http://localhost:3000/profile',
      ],
      startServerCommand: 'npm run start',
      startServerReadyPattern: 'ready on',
      startServerReadyTimeout: 30000,
    },
    assert: {
      assertions: {
        // Performance thresholds
        'categories:performance': ['error', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],

        // Core Web Vitals
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],

        // Additional performance metrics
        'speed-index': ['error', { maxNumericValue: 3000 }],
        interactive: ['error', { maxNumericValue: 3500 }],

        // Bundle size checks
        'unused-javascript': ['warn', { maxNumericValue: 20000 }],
        'render-blocking-resources': ['warn', { maxNumericValue: 500 }],

        // Accessibility checks
        'color-contrast': 'error',
        'image-alt': 'error',
        label: 'error',
        'valid-lang': 'error',

        // Best practices
        'uses-https': 'error',
        'no-vulnerable-libraries': 'error',
        charset: 'error',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
    server: {
      port: 9001,
      storage: {
        storageMethod: 'filesystem',
        storagePath: './lighthouse-results',
      },
    },
  },
};
