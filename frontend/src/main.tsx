import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import ErrorBoundary from './components/ErrorBoundary'
import { setupConsoleMonitoring } from './utils/consoleMonitor'

// Generate or retrieve session ID
if (!sessionStorage.getItem('session_id')) {
  sessionStorage.setItem('session_id', Math.random().toString(36).substring(2, 15));
}

// Setup console monitoring
setupConsoleMonitoring();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
