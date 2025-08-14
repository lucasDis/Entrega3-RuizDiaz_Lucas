
// Función de administración
function checkAdminAccess() {
  const proceed = confirm('¿Acceder a administración? (requiere cuenta de admin)');
  if (proceed) {
    // Verificar si el archivo existe antes de redirigir
    try {
      // Intentar ir a la página de admin
      window.location.href = 'admin-empresa.html';
    } catch (error) {
      // Si hay error, mostrar mensaje alternativo
      alert('La página de administración no está disponible en este momento. Contacte al desarrollador.');
      console.error('Error al acceder a administración:', error);
    }
  }
}

function logout() {
  if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
    try {
      // Limpiar datos de sesión si es necesario
      localStorage.removeItem('userSession');
      sessionStorage.clear();
      
      // Redirigir al index
      window.location.href = '../../index.html';
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Redirigir de todos modos
      window.location.href = '../../index.html';
    }
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const adminButtons = document.querySelectorAll('button, .user-dropdown-item, .mobile-nav-item');
  
  adminButtons.forEach(button => {
    if (button.textContent.includes('Administración') || button.textContent.includes('AdministraciÃ³n')) {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        checkAdminAccess();
      });
    }
  });
  
  const logoutButtons = document.querySelectorAll('button, .user-dropdown-item, .mobile-nav-item');
  
  logoutButtons.forEach(button => {
    if (button.textContent.includes('Cerrar sesión') || button.textContent.includes('Cerrar sesiÃ³n')) {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        logout();
      });
    }
  });
});

// BARRA LATERAL //

// Función para abrir sidebar móvil con bloqueo de scroll
function toggleMobileSidebar() {
  const sidebar = document.getElementById('mobileSidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const body = document.body;
  
  sidebar.classList.add('open');
  overlay.classList.add('show');
  body.classList.add('sidebar-open');
}

// Función para cerrar sidebar móvil
function closeMobileSidebar() {
  const sidebar = document.getElementById('mobileSidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const body = document.body;
  
  sidebar.classList.remove('open');
  overlay.classList.remove('show');
  body.classList.remove('sidebar-open');
}

// Prevenir scroll en el overlay
document.addEventListener('DOMContentLoaded', function() {
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('touchmove', function(e) {
      e.preventDefault();
    }, { passive: false });
    
    sidebarOverlay.addEventListener('wheel', function(e) {
      e.preventDefault();
    }, { passive: false });
  }
});

// Cerrar sidebar con tecla ESC (mantener función existente)
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    closeMobileSidebar();
  }
});

// Función para toggle del dropdown de usuario (mantener existente)
function toggleUserDropdown() {
  const dropdown = document.getElementById('userDropdown');
  const button = document.getElementById('userMenuButton');
  
  dropdown.classList.toggle('show');
  button.classList.toggle('active');
}

// Cerrar dropdown al hacer click fuera (mantener existente)
document.addEventListener('click', function(event) {
  const dropdown = document.getElementById('userDropdown');
  const button = document.getElementById('userMenuButton');
  
  if (dropdown && button && !button.contains(event.target)) {
    dropdown.classList.remove('show');
    button.classList.remove('active');
  }
});

// Funciones existentes que necesitarás tener
function checkAdminAccess() {
  console.log('Verificando acceso de administrador...');
  // Ejemplo: location.href = 'admin.html';
}

function logout() {
  if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
    console.log('Cerrando sesión...');
    // Ejemplo: location.href = '../../index.html';
  }
}

// Funciones de ejemplo para la tabla
function editProduct(id) {
  console.log('Editando producto:', id);
}

function viewProduct(id) {
  console.log('Viendo producto:', id);
}

function deleteProduct(id) {
  if (confirm('¿Estás seguro de eliminar este producto?')) {
    console.log('Eliminando producto:', id);
  }
}

function checkAdminAccess() {
  // Lógica para verificar acceso de admin
  console.log('Verificando acceso de administrador...');
}

function logout() {
  // Lógica para cerrar sesión
  if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
    console.log('Cerrando sesión...');
  }
}