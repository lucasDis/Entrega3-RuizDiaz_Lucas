// Optimizaciones de performance y SEO
(function() {
    'use strict';

    // Preload critical resources
    function preloadCriticalResources() {
        const criticalResources = [
            'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@400;500;600;700;800&display=swap',
            'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
            'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css'
        ];

        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'style';
            link.href = resource;
            document.head.appendChild(link);
        });
    }

    // Lazy load non-critical CSS
    function loadNonCriticalCSS() {
        const nonCriticalCSS = [
            // Agregar aquí CSS no crítico
        ];

        nonCriticalCSS.forEach(css => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = css;
            link.media = 'print';
            link.onload = function() {
                this.media = 'all';
            };
            document.head.appendChild(link);
        });
    }

    // Optimize images
    function optimizeImages() {
        const images = document.querySelectorAll('img');
        
        images.forEach(img => {
            // Add loading="lazy" to images below the fold
            if (!img.hasAttribute('loading')) {
                const rect = img.getBoundingClientRect();
                if (rect.top > window.innerHeight) {
                    img.setAttribute('loading', 'lazy');
                }
            }

            // Add proper alt attributes if missing
            if (!img.hasAttribute('alt')) {
                img.setAttribute('alt', '');
            }

            // Optimize image format based on browser support
            if (img.src && !img.dataset.optimized) {
                optimizeImageFormat(img);
                img.dataset.optimized = 'true';
            }
        });
    }

    function optimizeImageFormat(img) {
        // Check for WebP support
        const canvas = document.createElement('canvas');
        const webpSupported = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
        
        if (webpSupported && img.src.includes('unsplash.com')) {
            // Convert Unsplash URLs to WebP
            img.src = img.src.replace(/&fm=jpg|&fm=png/, '&fm=webp');
        }
    }

    // Service Worker registration
    function registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('SW registered: ', registration);
                    })
                    .catch(registrationError => {
                        console.log('SW registration failed: ', registrationError);
                    });
            });
        }
    }

    // Critical CSS inlining
    function inlineCriticalCSS() {
        const criticalCSS = `
            /* Critical CSS above the fold */
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
            .hero { min-height: 100vh; display: flex; align-items: center; }
            .navbar { position: fixed; top: 0; width: 100%; z-index: 1000; }
        `;

        const style = document.createElement('style');
        style.textContent = criticalCSS;
        document.head.insertBefore(style, document.head.firstChild);
    }

    // Resource hints
    function addResourceHints() {
        const hints = [
            { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
            { rel: 'dns-prefetch', href: '//fonts.gstatic.com' },
            { rel: 'dns-prefetch', href: '//cdnjs.cloudflare.com' },
            { rel: 'dns-prefetch', href: '//images.unsplash.com' },
            { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
            { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true }
        ];

        hints.forEach(hint => {
            const link = document.createElement('link');
            Object.keys(hint).forEach(key => {
                if (key === 'crossorigin') {
                    link.setAttribute(key, '');
                } else {
                    link.setAttribute(key, hint[key]);
                }
            });
            document.head.appendChild(link);
        });
    }

    // Intersection Observer for performance monitoring
    function setupPerformanceMonitoring() {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        // Track element visibility for analytics
                        const elementName = entry.target.className || entry.target.tagName;
                        console.log(`Element visible: ${elementName}`);
                    }
                });
            }, { threshold: 0.5 });

            // Observe key elements
            document.querySelectorAll('.hero, .section, .card').forEach(el => {
                observer.observe(el);
            });
        }
    }

    // Optimize third-party scripts
    function optimizeThirdPartyScripts() {
        // Defer non-critical scripts
        const scripts = document.querySelectorAll('script[src]');
        scripts.forEach(script => {
            if (!script.hasAttribute('async') && !script.hasAttribute('defer')) {
                script.setAttribute('defer', '');
            }
        });
    }

    // Web Vitals monitoring
    function monitorWebVitals() {
        // Monitor Largest Contentful Paint (LCP)
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                console.log('LCP:', lastEntry.startTime);
            });
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
        }

        // Monitor First Input Delay (FID)
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    console.log('FID:', entry.processingStart - entry.startTime);
                });
            });
            observer.observe({ entryTypes: ['first-input'] });
        }

        // Monitor Cumulative Layout Shift (CLS)
        if ('PerformanceObserver' in window) {
            let clsValue = 0;
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                });
                console.log('CLS:', clsValue);
            });
            observer.observe({ entryTypes: ['layout-shift'] });
        }
    }

    // Initialize all optimizations
    function init() {
        // Run immediately
        addResourceHints();
        inlineCriticalCSS();
        
        // Run when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                optimizeImages();
                setupPerformanceMonitoring();
                optimizeThirdPartyScripts();
            });
        } else {
            optimizeImages();
            setupPerformanceMonitoring();
            optimizeThirdPartyScripts();
        }

        // Run when page is fully loaded
        window.addEventListener('load', () => {
            preloadCriticalResources();
            loadNonCriticalCSS();
            registerServiceWorker();
            monitorWebVitals();
        });
    }

    // Start optimization
    init();

})();

// Create Service Worker file
const serviceWorkerContent = `
const CACHE_NAME = 'sysgen-v1';
const urlsToCache = [
    '/',
    '/css/base.css',
    '/src/animations.js',
    '/src/performance.js',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});
`;

// Write service worker to file (this would need to be done server-side)
console.log('Service Worker content ready for sw.js file');