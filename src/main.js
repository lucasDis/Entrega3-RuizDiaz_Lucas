
document.addEventListener('DOMContentLoaded', function() {
    
  // ===============================
  // SMOOTH SCROLLING FOR ANCHORS
  // ===============================
  const smoothScrollToTarget = (target) => {
      const element = document.querySelector(target);
      if (element) {
          const headerHeight = document.querySelector('.custom-navbar').offsetHeight;
          const targetPosition = element.offsetTop - headerHeight;
          
          window.scrollTo({
              top: targetPosition,
              behavior: 'smooth'
          });
      }
  };
  
  // Handle all anchor links
  document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', function(e) {
          e.preventDefault();
          const target = this.getAttribute('href');
          if (target !== '#') {
              smoothScrollToTarget(target);
          }
      });
  });
  
  // ===============================
  // NAVBAR SCROLL EFFECT
  // ===============================
  const navbar = document.querySelector('.custom-navbar');
  let lastScrollTop = 0;
  
  const handleNavbarScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      if (scrollTop > 100) {
          navbar.classList.add('navbar-scrolled');
      } else {
          navbar.classList.remove('navbar-scrolled');
      }
      
      // Hide navbar on scroll down, show on scroll up
      if (scrollTop > lastScrollTop && scrollTop > 300) {
          navbar.style.transform = 'translateY(-100%)';
      } else {
          navbar.style.transform = 'translateY(0)';
      }
      
      lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
  };
  
  window.addEventListener('scroll', throttle(handleNavbarScroll, 100));
  
  // ===============================
  // INTERSECTION OBSERVER ANIMATIONS
  // ===============================
  const observerOptions = {
      root: null,
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.1
  };
  
  const animateOnScroll = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              
              // Special handling for counter animations
              if (entry.target.classList.contains('stat-number')) {
                  animateCounter(entry.target);
              }
              
              // Stagger animations for grid items
              if (entry.target.classList.contains('stat-card')) {
                  const cards = document.querySelectorAll('.stat-card');
                  cards.forEach((card, index) => {
                      setTimeout(() => {
                          card.classList.add('visible');
                      }, index * 200);
                  });
              }
          }
      });
  }, observerOptions);
  
  // Observe elements for animations
  const elementsToAnimate = document.querySelectorAll('.fade-in-up, .stat-card, .feature-item, .testimonial-section > div');
  elementsToAnimate.forEach(el => {
      animateOnScroll.observe(el);
  });
  
  // ===============================
  // COUNTER ANIMATIONS
  // ===============================
  const animateCounter = (element) => {
      const target = element.textContent.trim();
      const isPercentage = target.includes('%');
      const isNumber = target.includes(',');
      const isStars = target.includes('★');
      const isTime = target.includes('/');
      
      if (isNumber || isPercentage) {
          const finalValue = parseFloat(target.replace(/[^\d.]/g, ''));
          let current = 0;
          const increment = finalValue / 100;
          const timer = setInterval(() => {
              current += increment;
              if (current >= finalValue) {
                  current = finalValue;
                  clearInterval(timer);
              }
              
              if (isPercentage) {
                  element.textContent = current.toFixed(1) + '%';
              } else if (target.includes(',')) {
                  element.textContent = Math.floor(current).toLocaleString();
              } else {
                  element.textContent = Math.floor(current);
              }
          }, 20);
      }
  };
  
  // ===============================
  // PARALLAX EFFECTS
  // ===============================
  // Desactivamos el parallax de overlays para que no se separen de la imagen de fondo
  // Mantener overlays fijos pegados al fondo
  const parallaxElements = document.querySelectorAll('.hero-section, .cta-section');
  const handleParallax = () => {
      parallaxElements.forEach(element => {
          const overlay = element.querySelector('.hero-overlay, .cta-overlay');
          if (overlay) {
              overlay.style.transform = '';
          }
      });
  };
  window.addEventListener('scroll', throttle(handleParallax, 100));
  
  // ===============================
  // MOBILE MENU HANDLING
  // ===============================
  const navbarToggler = document.querySelector('.navbar-toggler');
  const navbarNav = document.querySelector('#navbarNav');
  
  if (navbarToggler && navbarNav) {
      // Close mobile menu when clicking on a link
      const navLinks = navbarNav.querySelectorAll('.nav-link');
      navLinks.forEach(link => {
          link.addEventListener('click', () => {
              if (navbarNav.classList.contains('show')) {
                  navbarToggler.click();
              }
          });
      });
      
      // Close mobile menu when clicking outside
      document.addEventListener('click', (e) => {
          if (!e.target.closest('.navbar') && navbarNav.classList.contains('show')) {
              navbarToggler.click();
          }
      });
  }
  
  // ===============================
  // FORM HANDLING
  // ===============================
  const handleFormSubmissions = () => {
      const forms = document.querySelectorAll('form');
      
      forms.forEach(form => {
          form.addEventListener('submit', function(e) {
              e.preventDefault();
              
              // Basic form validation
              const requiredFields = form.querySelectorAll('[required]');
              let isValid = true;
              
              requiredFields.forEach(field => {
                  if (!field.value.trim()) {
                      isValid = false;
                      field.classList.add('is-invalid');
                  } else {
                      field.classList.remove('is-invalid');
                  }
              });
              
              if (isValid) {
                  // Simulate form submission
                  showNotification('¡Mensaje enviado correctamente!', 'success');
                  form.reset();
              } else {
                  showNotification('Por favor, completa todos los campos requeridos.', 'error');
              }
          });
      });
  };
  
  // ===============================
  // NOTIFICATION SYSTEM
  // ===============================
  const showNotification = (message, type = 'info') => {
      const notification = document.createElement('div');
      notification.className = `notification notification-${type}`;
      notification.innerHTML = `
          <div class="notification-content">
              <span class="notification-icon">
                  ${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}
              </span>
              <span class="notification-message">${message}</span>
              <button class="notification-close">&times;</button>
          </div>
      `;
      
      // Add styles for notification
      if (!document.querySelector('#notification-styles')) {
          const styles = document.createElement('style');
          styles.id = 'notification-styles';
          styles.textContent = `
              .notification {
                  position: fixed;
                  top: 20px;
                  right: 20px;
                  z-index: 9999;
                  background: white;
                  border-radius: 8px;
                  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                  padding: 16px 20px;
                  transform: translateX(100%);
                  transition: transform 0.3s ease;
              }
              .notification.show {
                  transform: translateX(0);
              }
              .notification-success {
                  border-left: 4px solid #27ae60;
              }
              .notification-error {
                  border-left: 4px solid #e74c3c;
              }
              .notification-info {
                  border-left: 4px solid #3498db;
              }
              .notification-content {
                  display: flex;
                  align-items: center;
                  gap: 10px;
              }
              .notification-icon {
                  font-weight: bold;
                  font-size: 18px;
              }
              .notification-success .notification-icon { color: #27ae60; }
              .notification-error .notification-icon { color: #e74c3c; }
              .notification-info .notification-icon { color: #3498db; }
              .notification-close {
                  background: none;
                  border: none;
                  font-size: 18px;
                  cursor: pointer;
                  opacity: 0.7;
              }
              .notification-close:hover {
                  opacity: 1;
              }
          `;
          document.head.appendChild(styles);
      }
      
      document.body.appendChild(notification);
      
      // Show notification
      setTimeout(() => notification.classList.add('show'), 100);
      
      // Auto hide after 5 seconds
      setTimeout(() => {
          notification.classList.remove('show');
          setTimeout(() => notification.remove(), 300);
      }, 5000);
      
      // Close button functionality
      notification.querySelector('.notification-close').addEventListener('click', () => {
          notification.classList.remove('show');
          setTimeout(() => notification.remove(), 300);
      });
  };
  
  // ===============================
  // LAZY LOADING FOR IMAGES
  // ===============================
  const lazyLoadImages = () => {
      const images = document.querySelectorAll('img[data-src]');
      
      const imageObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
              if (entry.isIntersecting) {
                  const img = entry.target;
                  img.src = img.dataset.src;
                  img.classList.remove('lazy');
                  imageObserver.unobserve(img);
              }
          });
      });
      
      images.forEach(img => imageObserver.observe(img));
  };
  
  // ===============================
  // PERFORMANCE OPTIMIZATIONS
  // ===============================
  
  // Throttle function for performance
  function throttle(func, limit) {
      let inThrottle;
      return function() {
          const args = arguments;
          const context = this;
          if (!inThrottle) {
              func.apply(context, args);
              inThrottle = true;
              setTimeout(() => inThrottle = false, limit);
          }
      };
  }
  
  // Debounce function for performance
  function debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
          const later = () => {
              clearTimeout(timeout);
              func(...args);
          };
          clearTimeout(timeout);
          timeout = setTimeout(later, wait);
      };
  }
  
  // ===============================
  // ACCESSIBILITY IMPROVEMENTS
  // ===============================
  const improveAccessibility = () => {
      // Add focus visible for keyboard navigation
      document.addEventListener('keydown', (e) => {
          if (e.key === 'Tab') {
              document.body.classList.add('using-keyboard');
          }
      });
      
      document.addEventListener('mousedown', () => {
          document.body.classList.remove('using-keyboard');
      });
      
      // Add focus styles for keyboard users
      if (!document.querySelector('#accessibility-styles')) {
          const styles = document.createElement('style');
          styles.id = 'accessibility-styles';
          styles.textContent = `
              .using-keyboard *:focus {
                  outline: 2px solid #f39c12 !important;
                  outline-offset: 2px;
              }
              body:not(.using-keyboard) *:focus {
                  outline: none;
              }
              @media (prefers-reduced-motion: reduce) {
                  *, *::before, *::after {
                      animation-duration: 0.01ms !important;
                      animation-iteration-count: 1 !important;
                      transition-duration: 0.01ms !important;
                  }
              }
          `;
          document.head.appendChild(styles);
      }
  };
  
  // ===============================
  // INITIALIZE ALL FUNCTIONALITY
  // ===============================
  const init = () => {
      handleFormSubmissions();
      lazyLoadImages();
      improveAccessibility();
      
      // Add loaded class to body for CSS animations
      document.body.classList.add('loaded');
      
      // Performance monitoring
      if ('performance' in window) {
          window.addEventListener('load', () => {
              const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
              console.log(`Page loaded in ${loadTime}ms`);
          });
      }
  };
  
  // Start initialization
  init();
  
  // ===============================
  // CONTACT FORM SPECIFIC HANDLING
  // ===============================
  const contactButtons = document.querySelectorAll('.btn-cta-primary, .cta-link[href*="mailto"], .cta-link[href*="tel"]');
  
  contactButtons.forEach(button => {
      button.addEventListener('click', (e) => {
          // Track contact interactions
          if (window.gtag) {
              gtag('event', 'contact_interaction', {
                  'event_category': 'engagement',
                  'event_label': button.textContent.trim()
              });
          }
          
          // Show feedback for contact attempts
          if (button.textContent.includes('CONTACTAR')) {
              e.preventDefault();
              showNotification('¡Gracias por tu interés! Te contactaremos pronto.', 'success');
          }
      });
  });
  
  // ===============================
  // SEO AND ANALYTICS HELPERS
  // ===============================
  const trackPageView = () => {
      // Track page sections in view
      const sections = document.querySelectorAll('section[id]');
      
      const sectionObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
              if (entry.isIntersecting) {
                  const sectionName = entry.target.id;
                  
                  // Update page title for better SEO
                  const originalTitle = document.title;
                  const sectionTitles = {
                      'inicio': 'Inicio - Sysgen',
                      'funcionalidades': 'Funcionalidades - Sysgen',
                      'contacto': 'Contacto - Sysgen'
                  };
                  
                  if (sectionTitles[sectionName]) {
                      document.title = sectionTitles[sectionName];
                  }
                  
                  // Track with analytics if available
                  if (window.gtag) {
                      gtag('event', 'page_view', {
                          'page_title': sectionTitles[sectionName] || originalTitle,
                          'page_location': window.location.href + '#' + sectionName
                      });
                  }
              }
          });
      }, { threshold: 0.5 });
      
      sections.forEach(section => sectionObserver.observe(section));
  };
  
  trackPageView();
  
});

// ===============================
// GLOBAL UTILITIES
// ===============================

// Global function to scroll to top
window.scrollToTop = () => {
  window.scrollTo({
      top: 0,
      behavior: 'smooth'
  });
};

// Global function for external link tracking
window.trackExternalLink = (url, label) => {
  if (window.gtag) {
      gtag('event', 'click', {
          'event_category': 'external_link',
          'event_label': label,
          'transport_type': 'beacon'
      });
  }
  
  setTimeout(() => {
      window.open(url, '_blank', 'noopener,noreferrer');
  }, 100);
};