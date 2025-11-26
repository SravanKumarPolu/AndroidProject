import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

// Initialize Capacitor if available
if (import.meta.env.MODE === 'production') {
  import('@capacitor/core').then(({ Capacitor }) => {
    if (Capacitor.isNativePlatform()) {
      // Initialize Capacitor plugins
      import('@capacitor/app').then(({ App }) => {
        App.addListener('backButton', ({ canGoBack }) => {
          if (!canGoBack) {
            App.exitApp();
          } else {
            window.history.back();
          }
        });
      });
    }
  });
}

// Check if first-time user and redirect to splash
const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding') === 'true';
const hasCompletedSetup = localStorage.getItem('hasCompletedSetup') === 'true';

// If first time, redirect to splash on initial load
if (!hasCompletedOnboarding || !hasCompletedSetup) {
  // Will be handled by Splash component routing
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

