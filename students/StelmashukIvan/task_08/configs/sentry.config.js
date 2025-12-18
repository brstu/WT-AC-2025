// Sentry Configuration
// This file configures Sentry error tracking

const Sentry = {
  dsn: process.env.SENTRY_DSN || '',
  environment: process.env.NODE_ENV || 'development',
  release: process.env.RELEASE || '1.0.0',
  debug: process.env.NODE_ENV === 'development',
  
  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Session replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  
  // Ignore certain errors
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'NetworkError when attempting to fetch resource',
    'Failed to fetch',
  ],
  
  // Filter sensitive data
  beforeSend(event) {
    // Remove sensitive data
    const keysToFilter = ['password', 'token', 'secret', 'authorization']
    
    if (event.request) {
      if (event.request.headers) {
        keysToFilter.forEach(key => {
          if (event.request.headers[key]) {
            event.request.headers[key] = '[FILTERED]'
          }
        })
      }
      
      if (event.request.data) {
        try {
          const data = typeof event.request.data === 'string' 
            ? JSON.parse(event.request.data)
            : event.request.data
          
          keysToFilter.forEach(key => {
            if (data[key]) {
              data[key] = '[FILTERED]'
            }
          })
          
          event.request.data = JSON.stringify(data)
        } catch (e) {
          // If data is not JSON, leave it as is
        }
      }
    }
    
    return event
  },
  
  // Integrations
  integrations: [
    // BrowserTracing for performance monitoring
    new Sentry.Integrations.BrowserTracing({
      tracingOrigins: ['localhost', 'yourdomain.com'],
    }),
    // Replay for session replay
    new Sentry.Integrations.Replay(),
  ],
}

module.exports = Sentry