// Performance monitoring
performance.mark('app-start');
window.addEventListener('load', () => {
  performance.mark('app-loaded');
  performance.measure('app-loading', 'app-start', 'app-loaded');
});

// Performance monitoring and analytics
const performanceMonitor = {
  init: () => {
    // Monitor Core Web Vitals
    if ('web-vital' in window) {
      import('https://unpkg.com/web-vitals@3').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
        onCLS(performanceMonitor.sendToAnalytics);
        onFID(performanceMonitor.sendToAnalytics);
        onFCP(performanceMonitor.sendToAnalytics);
        onLCP(performanceMonitor.sendToAnalytics);
        onTTFB(performanceMonitor.sendToAnalytics);
      });
    }

    // Monitor errors
    window.addEventListener('error', performanceMonitor.logError);
    window.addEventListener('unhandledrejection', performanceMonitor.logError);
  },

  sendToAnalytics: (metric) => {
    console.log('Performance metric:', metric.name, metric.value);
    // Here you could send to analytics service
  },

  logError: (error) => {
    console.error('Error logged:', error);
    // Here you could send to error tracking service
  },
};

// Loading state management
const loadingManager = {
  show: (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.setAttribute('data-loading', 'true');
      const loader = document.createElement('div');
      loader.className =
        'loading-spinner absolute inset-0 flex items-center justify-center bg-white/80';
      loader.innerHTML =
        '<div class="animate-spin rounded-full h-8 w-8 border-t-2 border-orange-500"></div>';
      element.appendChild(loader);
    }
  },
  hide: (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.removeAttribute('data-loading');
      const loader = element.querySelector('.loading-spinner');
      if (loader) {
        loader.remove();
      }
    }
  },
};

// Enhanced error handler
const errorHandler = {
  show: (elementId, message, type = 'error') => {
    const element = document.getElementById(elementId);
    if (element) {
      const errorDiv = document.createElement('div');
      errorDiv.className = `text-center p-4 rounded ${type === 'error' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`;
      errorDiv.innerHTML = `
                <div class="flex items-center justify-center">
                    <svg class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="${type === 'error' ? 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' : 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'}"/>
                    </svg>
                    <p>${message}</p>
                </div>
            `;
      element.appendChild(errorDiv);
    }
  },
  clear: (elementId) => {
    const element = document.getElementById(elementId);
    if (element) {
      const errors = element.querySelectorAll('.bg-red-100, .bg-yellow-100');
      errors.forEach((error) => error.remove());
    }
  },
};

// Browser compatibility check
const compatibilityChecker = {
  check: () => {
    const features = {
      serviceWorker: 'serviceWorker' in navigator,
      localStorage: (() => {
        try {
          localStorage.setItem('test', 'test');
          localStorage.removeItem('test');
          return true;
        } catch (e) {
          return false;
        }
      })(),
      webGL: (() => {
        try {
          return !!window.WebGLRenderingContext;
        } catch (e) {
          return false;
        }
      })(),
      fetch: 'fetch' in window,
      intersectionObserver: 'IntersectionObserver' in window,
    };

    const unsupportedFeatures = Object.entries(features)
      .filter(([, supported]) => !supported)
      .map(([feature]) => feature);

    if (unsupportedFeatures.length > 0) {
      errorHandler.show(
        'compatibility-warning',
        `Your browser might not support all features. Consider updating your browser for the best experience.<br>
                <small>Unsupported features: ${unsupportedFeatures.join(', ')}</small>`,
        'warning',
      );
    }
  },
};

// Enhanced chart error handling with fallback
function handleChartError() {
  const chartElements = [
    'chart-error',
    'price-error-message',
    'athAtlChart',
    'supplyChart',
    'scheduleChart',
  ];
  chartElements.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.classList.remove('hidden');
      errorHandler.show(
        id,
        'Chart data is currently unavailable. Please try again later.',
        'warning',
      );
    }
  });
}

// Service Worker Registration
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('ServiceWorker registration successful');
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                showUpdateNotification();
              }
            });
          });
        })
        .catch((error) => console.error('ServiceWorker registration failed:', error));
    });
  }
}

// Update notification with improved UX
function showUpdateNotification() {
  const notification = document.createElement('div');
  notification.className =
    'fixed bottom-4 right-4 bg-orange-100 border-l-4 border-orange-500 text-orange-700 p-4 rounded shadow-lg z-50 transition-opacity duration-300';
  notification.innerHTML = `
        <div class="flex items-center">
            <div class="shrink-0">
                <svg class="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
            </div>
            <div class="ml-3">
                <p class="text-sm font-medium">A new version is available</p>
                <div class="mt-2 flex space-x-4">
                    <button onclick="window.location.reload()" 
                        class="px-3 py-1 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded transition-colors">
                        Update now
                    </button>
                    <button onclick="this.closest('.fixed').remove()" 
                        class="px-3 py-1 text-sm font-medium text-orange-700 hover:text-orange-800 transition-colors">
                        Later
                    </button>
                </div>
            </div>
        </div>
    `;
  document.body.appendChild(notification);
}

// Update year in footer
function updateYear() {
  const yearEl = document.getElementById('currentYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

// Initialize all functionality
function init() {
  // Add a loading screen
  const pageLoader = document.getElementById('pageLoader');
  if (pageLoader) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        pageLoader.classList.add('hidden');
        setTimeout(() => pageLoader.remove(), 300);
      }, 500);
    });
  }

  // Run compatibility checks
  compatibilityChecker.check();

  // Continue with existing initializations
  checkFontAwesome();
  if (typeof Chart === 'undefined') {
    handleChartError();
  }
  registerServiceWorker();
  updateYear();

  // Add lazy loading for all images
  if ('loading' in HTMLImageElement.prototype) {
    document.querySelectorAll('img[data-src]').forEach((img) => {
      img.src = img.dataset.src;
    });
  } else {
    // Fallback for browsers that don't support lazy loading
    const lazyImageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          observer.unobserve(img);
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach((img) => {
      lazyImageObserver.observe(img);
    });
  }
}

// Run initialization
init();
//# sourceMappingURL=app.js.map
