import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppContent } from './App';
import { DashboardProvider } from './context/DashboardContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DashboardProvider>
      <AppContent />
    </DashboardProvider>
  </React.StrictMode>
);
