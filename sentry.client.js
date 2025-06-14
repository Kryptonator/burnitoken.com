// sentry.client.js - Error monitoring setup
(function () {
  // Only load Sentry in production or when explicitly enabled
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('Sentry disabled for local development');
    return;
  }

  // Simple error tracking without external dependencies
  window.addEventListener('error', function (event) {
    console.error('JavaScript Error:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error && event.error.stack,
    });

    // Here you could send errors to your monitoring service
    // fetch('/api/errors', { method: 'POST', body: JSON.stringify(errorData) });
  });

  window.addEventListener('unhandledrejection', function (event) {
    console.error('Unhandled Promise Rejection:', event.reason);

    // Here you could send promise rejections to your monitoring service
  });

  // Performance monitoring
  window.addEventListener('load', function () {
    setTimeout(function () {
      if (window.performance && window.performance.timing) {
        const timing = window.performance.timing;
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        console.log('Page Load Time:', loadTime + 'ms');

        // Send performance data to monitoring service if needed
      }
    }, 0);
  });
})();
