import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppContent } from './App';
import { DashboardProvider } from './context/DashboardContext';
import './index.css';

// Force HTTPS in production environments
if (
  typeof window !== 'undefined' &&
  window.location.protocol === 'http:' &&
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1'
) {
  window.location.href = window.location.href.replace('http:', 'https:');
}

// GitHub Pages SPA router redirect handler
(function checkSpaRedirect() {
  const redirect = sessionStorage.getItem('redirect');
  if (redirect) {
    sessionStorage.removeItem('redirect');
    const path = redirect.replace(window.location.origin, '');
    if (path && path !== window.location.pathname) {
      window.history.replaceState(null, '', path);
    }
  }
})();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DashboardProvider>
      <AppContent />
    </DashboardProvider>
  </React.StrictMode>
);