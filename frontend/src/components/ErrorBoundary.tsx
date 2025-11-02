import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Send error to backend
    this.sendErrorToBackend(error, errorInfo);

    // Log to console
    console.error('React Error Boundary caught:', error, errorInfo);
  }

  sendErrorToBackend(error: Error, errorInfo: ErrorInfo) {
    try {
      fetch('http://localhost:8000/api/monitoring/frontend-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level: 'error',
          message: `React Error: ${error.message}`,
          timestamp: new Date().toISOString(),
          source: 'ErrorBoundary',
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          sessionId: sessionStorage.getItem('session_id') || undefined,
        }),
        keepalive: true,
      }).catch(() => {
        // Silently fail if backend unavailable
      });
    } catch (err) {
      // Don't let error reporting break the app further
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-2xl w-full border border-white/20 shadow-2xl">
            <h1 className="text-3xl font-bold text-white mb-4">
              Something went wrong
            </h1>
            <p className="text-white/80 mb-6">
              The application encountered an unexpected error. Our team has been notified.
            </p>
            {this.state.error && (
              <details className="bg-black/20 rounded-lg p-4 mb-4">
                <summary className="text-white/90 cursor-pointer font-semibold">
                  Error Details
                </summary>
                <pre className="text-red-300 text-sm mt-2 overflow-auto">
                  {this.state.error.message}
                  {'\n\n'}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
