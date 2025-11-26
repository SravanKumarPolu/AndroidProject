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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);

