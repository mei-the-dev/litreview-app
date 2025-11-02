// Console monitoring utility to stream frontend logs to backend
let isMonitoring = false;

interface LogMessage {
  level: 'error' | 'warn' | 'info' | 'log';
  message: string;
  timestamp: string;
  source?: string;
  stack?: string;
  sessionId?: string;
}

const sendLogToBackend = async (level: LogMessage['level'], args: any[]) => {
  try {
    const message = args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
    ).join(' ');

    const logData: LogMessage = {
      level,
      message,
      timestamp: new Date().toISOString(),
      sessionId: sessionStorage.getItem('session_id') || undefined,
    };

    // Try to extract stack trace for errors
    if (level === 'error' && args[0] instanceof Error) {
      logData.stack = args[0].stack;
    }

    // Send to backend non-blocking
    fetch('http://localhost:8000/api/monitoring/frontend-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logData),
      keepalive: true,
    }).catch(() => {
      // Silently fail if backend unavailable
    });
  } catch (err) {
    // Don't let monitoring break the app
  }
};

export const setupConsoleMonitoring = () => {
  if (isMonitoring) return;
  isMonitoring = true;

  // Store original methods
  const originalError = console.error;
  const originalWarn = console.warn;
  const originalInfo = console.info;
  const originalLog = console.log;

  // Intercept console.error
  console.error = (...args: any[]) => {
    sendLogToBackend('error', args);
    originalError.apply(console, args);
  };

  // Intercept console.warn
  console.warn = (...args: any[]) => {
    sendLogToBackend('warn', args);
    originalWarn.apply(console, args);
  };

  // Intercept console.info (optional, can be verbose)
  console.info = (...args: any[]) => {
    // sendLogToBackend('info', args);
    originalInfo.apply(console, args);
  };

  // Listen for unhandled errors
  window.addEventListener('error', (event) => {
    sendLogToBackend('error', [
      `Unhandled error: ${event.message}`,
      `at ${event.filename}:${event.lineno}:${event.colno}`,
      event.error?.stack || ''
    ]);
  });

  // Listen for unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    sendLogToBackend('error', [
      `Unhandled promise rejection: ${event.reason}`,
      event.reason?.stack || ''
    ]);
  });

  console.info('Console monitoring enabled');
};

export const stopConsoleMonitoring = () => {
  // Note: In practice, we don't restore because we lose reference to originals
  // This is fine for our use case
  isMonitoring = false;
};
