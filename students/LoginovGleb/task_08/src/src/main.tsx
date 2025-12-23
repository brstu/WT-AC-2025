import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import * as Sentry from '@sentry/react';
import { store } from './store';
import './index.css';
import App from './App';

/**
 * BONUS TASK: Error Monitoring with Sentry (+3 points)
 * 
 * Sentry integration provides:
 * - Real-time error tracking in production
 * - Performance monitoring and tracing
 * - Session replay for debugging user issues
 * - Release tracking and source maps
 * 
 * Configuration: 
 * - Only active in production environment
 * - DSN should be replaced with actual project DSN from https://sentry.io
 * - Can be configured via environment variable VITE_SENTRY_DSN
 */
if (import.meta.env.PROD) {
  Sentry.init({
    dsn: 'https://example@sentry.io/project-id', // Replace with your actual Sentry DSN
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0,
    // Session Replay
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    environment: import.meta.env.MODE,
  });
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>
);
