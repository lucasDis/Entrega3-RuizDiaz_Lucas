// Animaciones y efectos interactivos
document.addEventListener('DOMContentLoaded', function() {
    // Configuración del Intersection Observer para animaciones
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    // Observer para elementos animados
    const animationObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                element.classList.add('animate');
                
                // Aplicar delay si existe
                const delay = element.dataset.delay;
                if (delay) {
                    element.style.animationDelay = delay + 'ms';
                }
                
                // Desconectar después de animar
                animationObserver.unobserve(element);
            }
        });
    }, observerOptions);

    // Observar todos los elementos con clases de animación
    const animatedElements = document.querySelectorAll('[class*="animate-"]');
    animatedElements.forEach(element => {
        // Preparar elemento para animación
        element.style.opacity = '0';
        element.style.transform = getInitialTransform(element);
        element.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        
        animationObserver.observe(element);
    });

    // Función para obtener transformación inicial basada en la clase
    function getInitialTransform(element) {
        if (element.classList.contains('animate-fade-in-up')) {
            return 'translateY(30px)';
        } else if (element.classList.contains('animate-fade-in-down')) {
            return 'translateY(-30px)';
        } else if (element.classList.contains('animate-fade-in-left')) {
            return 'translateX(-30px)';
        } else if (element.classList.contains('animate-fade-in-right')) {
            return 'translateX(30px)';
        } else if (element.classList.contains('animate-scale-in')) {
            return 'scale(0.9)';
        }
        return 'translateY(20px)';
    }

    // Aplicar animación cuando el elemento es visible
    const style = document.createElement('style');
    style.textContent = `
        .animate {
            opacity: 1 !important;
            transform: translateY(0) translateX(0) scale(1) !important;
        }
    `;
    document.head.appendChild(style);

    // Efecto parallax suave para el hero
    const hero = document.querySelector('.hero');
    if (hero) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            hero.style.transform = `translateY(${rate}px)`;
        });
    }

    // Efecto hover mejorado para cards
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
            this.style.boxShadow = 'var(--shadow-xl)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = 'var(--shadow-sm)';
        });
    });

    // Smooth scroll para enlaces internos
    const internalLinks = document.querySelectorAll('a[href^="#"]');
    internalLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Contador animado para estadísticas
    const counters = document.querySelectorAll('.stat-number');
    const counterObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.textContent.replace(/[^\d]/g, ''));
                const duration = 2000;
                const step = target / (duration / 16);
                let current = 0;
                
                const timer = setInterval(() => {
                    current += step;
                    if (current >= target) {
                        counter.textContent = counter.textContent.replace(/[\d,]+/, target.toLocaleString());
                        clearInterval(timer);
                    } else {
                        counter.textContent = counter.textContent.replace(/[\d,]+/, Math.floor(current).toLocaleString());
                    }
                }, 16);
                
                counterObserver.unobserve(counter);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => {
        counterObserver.observe(counter);
    });

    // Lazy loading optimizado para imágenes
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    
                    // Crear imagen temporal para precargar
                    const tempImg = new Image();
                    tempImg.onload = function() {
                        img.src = img.dataset.src;
                        img.classList.remove('lazy-load');
                        img.classList.add('loaded');
                    };
                    tempImg.src = img.dataset.src;
                    
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px 0px'
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            img.classList.add('lazy-load');
            imageObserver.observe(img);
        });
    }

    // Efecto de typing para títulos principales
    function typeWriter(element, text, speed = 100) {
        let i = 0;
        element.innerHTML = '';
        
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        
        type();
    }

    // Aplicar efecto typing al título principal si existe
    const mainTitle = document.querySelector('.hero-title');
    if (mainTitle) {
        const originalText = mainTitle.textContent;
        setTimeout(() => {
            typeWriter(mainTitle, originalText, 50);
        }, 500);
    }

    // Partículas flotantes en el hero (opcional)
    function createFloatingParticles() {
        const hero = document.querySelector('.hero');
        if (!hero) return;

        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'floating-particle';
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 4 + 2}px;
                height: ${Math.random() * 4 + 2}px;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: float ${Math.random() * 3 + 2}s ease-in-out infinite;
                animation-delay: ${Math.random() * 2}s;
                pointer-events: none;
            `;
            hero.appendChild(particle);
        }

        // CSS para la animación de partículas
        const particleStyle = document.createElement('style');
        particleStyle.textContent = `
            @keyframes float {
                0%, 100% { transform: translateY(0px) rotate(0deg); }
                50% { transform: translateY(-20px) rotate(180deg); }
            }
        `;
        document.head.appendChild(particleStyle);
    }

    // Crear partículas si está habilitado
    if (window.innerWidth > 768) {
        createFloatingParticles();
    }
});

// Optimización de performance
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Aplicar debounce a eventos de scroll
window.addEventListener('scroll', debounce(() => {
    // Lógica de scroll optimizada
    const scrolled = window.pageYOffset;
    const navbar = document.getElementById('mainNavbar');
    
    if (scrolled > 50) {
        navbar?.classList.add('scrolled');
    } else {
        navbar?.classList.remove('scrolled');
    }
}, 10));