document.addEventListener("DOMContentLoaded", function () {
  // Scroll desde el hero hasta la siguiente sección
  const scrollDownBtn = document.getElementById("scroll-down");
  if (scrollDownBtn) {
    scrollDownBtn.addEventListener("click", () => {
      const nextSection = document.querySelector("#funcionalidades");
      if (nextSection) {
        nextSection.scrollIntoView({ behavior: "smooth" });
      }
    });
  }

  const backToHeroBtn = document.getElementById("back-to-hero");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 400) {
      backToHeroBtn.classList.add("show");
    } else {
      backToHeroBtn.classList.remove("show");
    }
  });
  if (backToHeroBtn) {
    backToHeroBtn.addEventListener("click", () => {
      document.getElementById("inicio").scrollIntoView({ behavior: "smooth" });
    });
  }

  // Gestionar todos los enlaces de anclaje
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const target = this.getAttribute("href");
      if (target !== "#") {
        smoothScrollToTarget(target);
      }
    });
  });

  // ===============================
  // EFECTO DE DESPLAZAMIENTO DE LA BARRA DE NAVEGACIÓN
  // ===============================
  const navbar = document.querySelector(".custom-navbar");
  let lastScrollTop = 0;

  const handleNavbarScroll = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > 100) {
      navbar.classList.add("navbar-scrolled");
    } else {
      navbar.classList.remove("navbar-scrolled");
    }

    // Hide navbar on scroll down, show on scroll up
    if (scrollTop > lastScrollTop && scrollTop > 300) {
      navbar.style.transform = "translateY(-100%)";
    } else {
      navbar.style.transform = "translateY(0)";
    }

    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
  };

  window.addEventListener("scroll", throttle(handleNavbarScroll, 100));

  // ===============================
  // ANIMACIONES DEL OBSERVADOR DE INTERSECCIONES
  // ===============================
  const observerOptions = {
    root: null,
    rootMargin: "0px 0px -50px 0px",
    threshold: 0.1,
  };

  const animateOnScroll = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");

        // Manejo especial para animaciones de mostrador
        if (entry.target.classList.contains("stat-number")) {
          animateCounter(entry.target);
        }

        // Animaciones escalonadas para elementos de cuadrícula
        if (entry.target.classList.contains("stat-card")) {
          const cards = document.querySelectorAll(".stat-card");
          cards.forEach((card, index) => {
            setTimeout(() => {
              card.classList.add("visible");
            }, index * 200);
          });
        }
      }
    });
  }, observerOptions);

  // Observa los elementos para las animaciones
  const elementsToAnimate = document.querySelectorAll(
    ".fade-in-up, .stat-card, .feature-item, .testimonial-section > div"
  );
  elementsToAnimate.forEach((el) => {
    animateOnScroll.observe(el);
  });

  // ===============================
  // ANIMACIONES CONTRARIAS
  // ===============================
  const animateCounter = (element) => {
    const target = element.textContent.trim();
    const isPercentage = target.includes("%");
    const isNumber = target.includes(",");
    const isStars = target.includes("★");
    const isTime = target.includes("/");

    if (isNumber || isPercentage) {
      const finalValue = parseFloat(target.replace(/[^\d.]/g, ""));
      let current = 0;
      const increment = finalValue / 100;
      const timer = setInterval(() => {
        current += increment;
        if (current >= finalValue) {
          current = finalValue;
          clearInterval(timer);
        }

        if (isPercentage) {
          element.textContent = current.toFixed(1) + "%";
        } else if (target.includes(",")) {
          element.textContent = Math.floor(current).toLocaleString();
        } else {
          element.textContent = Math.floor(current);
        }
      }, 20);
    }
  };

  // ===============================
  // EFECTOS DE PARALLAX
  // ===============================
  // Desactiva el parallax de overlays para que no se separen de la imagen de fondo
  // Mantiene overlays fijos pegados al fondo
  const parallaxElements = document.querySelectorAll(
    ".hero-section, .cta-section"
  );
  const handleParallax = () => {
    parallaxElements.forEach((element) => {
      const overlay = element.querySelector(".hero-overlay, .cta-overlay");
      if (overlay) {
        overlay.style.transform = "";
      }
    });
  };
  window.addEventListener("scroll", throttle(handleParallax, 100));

  // ===============================
  // MANEJO DEL MENÚ MÓVIL
  // ===============================
  const navbarToggler = document.querySelector(".navbar-toggler");
  const navbarNav = document.querySelector("#navbarNav");

  if (navbarToggler && navbarNav) {
    // Cerrar el menú móvil al hacer clic en un enlace
    const navLinks = navbarNav.querySelectorAll(".nav-link");
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        if (navbarNav.classList.contains("show")) {
          navbarToggler.click();
        }
      });
    });

    // Cerrar el menú móvil al hacer clic fuera de él
    document.addEventListener("click", (e) => {
      if (
        !e.target.closest(".navbar") &&
        navbarNav.classList.contains("show")
      ) {
        navbarToggler.click();
      }
    });
  }

  // ===============================
  // TRATAMIENTO DE FORMULARIOS
  // ===============================
  const handleFormSubmissions = () => {
    const forms = document.querySelectorAll("form");

    forms.forEach((form) => {
      form.addEventListener("submit", function (e) {
        e.preventDefault();

        // Validación básica de formularios
        const requiredFields = form.querySelectorAll("[required]");
        let isValid = true;

        requiredFields.forEach((field) => {
          if (!field.value.trim()) {
            isValid = false;
            field.classList.add("is-invalid");
          } else {
            field.classList.remove("is-invalid");
          }
        });

        if (isValid) {
          // Simular el envío del formulario
          showNotification("¡Mensaje enviado correctamente!", "success");
          form.reset();
        } else {
          showNotification(
            "Por favor, completa todos los campos requeridos.",
            "error"
          );
        }
      });
    });
  };

  // ===============================
  // CARGA DIFERIDA DE IMÁGENES
  // ===============================
  const lazyLoadImages = () => {
    const images = document.querySelectorAll("img[data-src]");

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.remove("lazy");
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach((img) => imageObserver.observe(img));
  };

  // ===============================
  // OPTIMIZACIONES DEL RENDIMIENTO
  // ===============================

  // Función de aceleración para mejorar el rendimiento
  function throttle(func, limit) {
    let inThrottle;
    return function () {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  // Función antirrebote para mejorar el rendimiento
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
  // MEJORAS EN LA ACCESIBILIDAD
  // ===============================
  const improveAccessibility = () => {
    document.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        document.body.classList.add("using-keyboard");
      }
    });

    document.addEventListener("mousedown", () => {
      document.body.classList.remove("using-keyboard");
    });

    if (!document.querySelector("#accessibility-styles")) {
      const styles = document.createElement("style");
      styles.id = "accessibility-styles";
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
  // INHABILITACION DE BOTONES
  // ===============================
  const init = () => {
    handleFormSubmissions();
    lazyLoadImages();
    improveAccessibility();
  
    document.body.classList.add("loaded");
  
    if ("performance" in window) {
      window.addEventListener("load", () => {
        const loadTime =
          performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`Page loaded in ${loadTime}ms`);
      });
    }
  
    // Agrega esta línea para inicializar la inhabilitación de botones
    trackPageView();
  };

  init();

  // ===============================
  // SERVICIOS PÚBLICOS GLOBALES
  // ===============================

  // Función global para desplazarse hasta la parte superior
  window.scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Función global para el seguimiento de enlaces externos
  window.trackExternalLink = (url, label) => {
    if (window.gtag) {
      gtag("event", "click", {
        event_category: "external_link",
        event_label: label,
        transport_type: "beacon",
      });
    }

    setTimeout(() => {
      window.open(url, "_blank", "noopener,noreferrer");
    }, 100);
  };
});
