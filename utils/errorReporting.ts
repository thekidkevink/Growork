// Production-ready error reporting and monitoring utility

interface ErrorReport {
  message: string;
  stack?: string;
  timestamp: string;
  userId?: string;
  userAgent?: string;
  url?: string;
  additionalData?: Record<string, any>;
}

class ErrorReporter {
  private static instance: ErrorReporter;
  private isProduction: boolean;

  private constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  static getInstance(): ErrorReporter {
    if (!ErrorReporter.instance) {
      ErrorReporter.instance = new ErrorReporter();
    }
    return ErrorReporter.instance;
  }

  reportError(error: Error, additionalData?: Record<string, any>) {
    const errorReport: ErrorReport = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      additionalData,
    };

    // Log to console in development
    if (!this.isProduction) {
      console.error('Error Report:', errorReport);
    }

    // In production, you would send this to your error reporting service
    // Examples: Sentry, Bugsnag, LogRocket, etc.
    if (this.isProduction) {
      this.sendToErrorService(errorReport);
    }
  }

  reportWarning(message: string, additionalData?: Record<string, any>) {
    const warningReport = {
      message,
      timestamp: new Date().toISOString(),
      level: 'warning',
      additionalData,
    };

    if (!this.isProduction) {
      console.warn('Warning Report:', warningReport);
    }

    if (this.isProduction) {
      this.sendToErrorService(warningReport);
    }
  }

  private async sendToErrorService(report: ErrorReport | any) {
    try {
      // Replace with your actual error reporting service
      // await fetch('https://your-error-service.com/report', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(report),
      // });
      
      // For now, just store locally for debugging
      console.log('Would send to error service:', report);
    } catch (err) {
      console.error('Failed to send error report:', err);
    }
  }
}

export const errorReporter = ErrorReporter.getInstance();

// Global error handler for unhandled promise rejections
const globalEventTarget = globalThis as typeof globalThis & {
  addEventListener?: (
    eventName: string,
    listener: (event: { reason?: unknown }) => void
  ) => void;
};

if (typeof globalEventTarget.addEventListener === 'function') {
  globalEventTarget.addEventListener('unhandledrejection', (event) => {
    errorReporter.reportError(
      new Error(`Unhandled Promise Rejection: ${event.reason}`),
      { type: 'unhandledrejection' }
    );
  });
}

export default errorReporter;
