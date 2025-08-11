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

  // Agregar a main.js para mejor manejo de formularios

  // ===============================
  // MANEJO MEJORADO DE FORMULARIOS
  // ===============================

  const enhancedFormHandling = () => {
    // Formulario de contacto
    const contactForm = document.querySelector("#contactForm");
    if (contactForm) {
      contactForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        // Estado de carga
        submitBtn.innerHTML =
          '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        submitBtn.disabled = true;

        // Simular envío (reemplazar con API real)
        await new Promise((resolve) => setTimeout(resolve, 2000));

        try {
          // Aquí iría la llamada a tu API
          // const response = await fetch('/api/contact', { method: 'POST', body: new FormData(this) });

          showNotification(
            "¡Mensaje enviado correctamente! Te responderemos pronto.",
            "success"
          );
          this.reset();

          // Tracking de conversión
          if (typeof gtag !== "undefined") {
            gtag("event", "form_submit", {
              event_category: "Contact",
              event_label: "Contact Form",
            });
          }
        } catch (error) {
          showNotification(
            "Error al enviar el mensaje. Por favor, intenta nuevamente.",
            "error"
          );
          console.error("Form submission error:", error);
        } finally {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
        }
      });
    }

    // Formulario de login mejorado
    const loginForm = document.querySelector("#loginForm");
    if (loginForm) {
      loginForm.addEventListener("submit", function (e) {
        e.preventDefault();

        const email = document.querySelector("#email-input").value;
        const password = document.querySelector("#password-input").value;

        // Validación básica
        if (!email || !password) {
          showNotification("Por favor, completa todos los campos.", "error");
          return;
        }

        // Simulación de autenticación
        const submitBtn = this.querySelector('button[type="submit"]');
        submitBtn.innerHTML =
          '<i class="fas fa-spinner fa-spin"></i> Iniciando sesión...';
        submitBtn.disabled = true;

        setTimeout(() => {
          // Simular login exitoso
          localStorage.setItem(
            "sysgen_user",
            JSON.stringify({
              email: email,
              loginTime: new Date().toISOString(),
            })
          );

          showNotification("¡Bienvenido a Sysgen!", "success");

          setTimeout(() => {
            window.location.href = "../panelusuario/userpanel.html";
          }, 1500);
        }, 1500);
      });
    }
  };

  // Sistema de notificaciones mejorado
  const showNotification = (message, type = "info", duration = 5000) => {
    // Crear contenedor si no existe
    let container = document.querySelector("#notification-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "notification-container";
      container.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      max-width: 400px;
    `;
      document.body.appendChild(container);
    }

    // Crear notificación
    const notification = document.createElement("div");
    const icons = {
      success: "fa-check-circle",
      error: "fa-exclamation-circle",
      info: "fa-info-circle",
      warning: "fa-exclamation-triangle",
    };

    const colors = {
      success: "#27ae60",
      error: "#e74c3c",
      info: "#3498db",
      warning: "#f39c12",
    };

    notification.innerHTML = `
    <div style="
      background: white;
      border-left: 4px solid ${colors[type]};
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.15);
      padding: 16px 20px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 12px;
      animation: slideInRight 0.3s ease;
      max-width: 100%;
    ">
      <i class="fas ${icons[type]}" style="color: ${colors[type]}; font-size: 1.2rem;"></i>
      <span style="flex: 1; color: #2c3e50; font-weight: 500;">${message}</span>
      <button onclick="this.closest('div').remove()" style="
        background: none;
        border: none;
        color: #7f8c8d;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">×</button>
    </div>
  `;

    // Agregar estilos de animación si no existen
    if (!document.querySelector("#notification-styles")) {
      const styles = document.createElement("style");
      styles.id = "notification-styles";
      styles.textContent = `
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
      document.head.appendChild(styles);
    }

    container.appendChild(notification);

    // Auto-remove después de duration
    if (duration > 0) {
      setTimeout(() => {
        if (notification.parentNode) {
          notification.firstElementChild.style.animation =
            "slideOutRight 0.3s ease";
          setTimeout(() => {
            if (notification.parentNode) {
              notification.remove();
            }
          }, 300);
        }
      }, duration);
    }
  };

  // Validación de campos en tiempo real
  const realTimeValidation = () => {
    const inputs = document.querySelectorAll(
      "input[required], textarea[required]"
    );

    inputs.forEach((input) => {
      // Validación al perder el foco
      input.addEventListener("blur", function () {
        validateField(this);
      });

      // Limpiar errores al escribir
      input.addEventListener("input", function () {
        if (this.classList.contains("is-invalid")) {
          validateField(this);
        }
      });
    });
  };

  const validateField = (field) => {
    const value = field.value.trim();
    let isValid = true;
    let message = "";

    // Validación básica de campo requerido
    if (field.hasAttribute("required") && !value) {
      isValid = false;
      message = "Este campo es obligatorio";
    }

    // Validación de email
    if (field.type === "email" && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        isValid = false;
        message = "Por favor, ingresa un email válido";
      }
    }

    // Aplicar estilos de validación
    if (isValid) {
      field.classList.remove("is-invalid");
      field.classList.add("is-valid");
      removeFieldError(field);
    } else {
      field.classList.remove("is-valid");
      field.classList.add("is-invalid");
      showFieldError(field, message);
    }

    return isValid;
  };

  const showFieldError = (field, message) => {
    removeFieldError(field);

    const errorDiv = document.createElement("div");
    errorDiv.className = "invalid-feedback";
    errorDiv.style.display = "block";
    errorDiv.textContent = message;

    field.parentNode.appendChild(errorDiv);
  };

  const removeFieldError = (field) => {
    const existingError = field.parentNode.querySelector(".invalid-feedback");
    if (existingError) {
      existingError.remove();
    }
  };

  // Inicializar mejoras
  document.addEventListener("DOMContentLoaded", function () {
    enhancedFormHandling();
    realTimeValidation();
  });

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
