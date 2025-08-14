// --- Función de administración ---
function checkAdminAccess() {
  if (confirm('¿Acceder a administración?')) {
    window.location.href = './admin-empresa.html';
  }
}

// --- Cerrar sesión ---
function logout() {
  if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
    window.location.href = '../principal/login.html';
  }
}

// --- Listeners de botones ---
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('button, .user-dropdown-item, .mobile-nav-item').forEach(button => {
    if (button.textContent.includes('Administración') || button.textContent.includes('AdministraciÃ³n')) {
      button.addEventListener('click', e => {
        e.preventDefault();
        checkAdminAccess();
      });
    }
    if (button.textContent.includes('Cerrar sesión') || button.textContent.includes('Cerrar sesiÃ³n')) {
      button.addEventListener('click', e => {
        e.preventDefault();
        logout();
      });
    }
  });
});

// --- Barra lateral móvil ---
function toggleMobileSidebar() {
  document.getElementById('mobileSidebar').classList.add('open');
  document.getElementById('sidebarOverlay').classList.add('show');
  document.body.classList.add('sidebar-open');
}

function closeMobileSidebar() {
  document.getElementById('mobileSidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('show');
  document.body.classList.remove('sidebar-open');
}

// Cerrar sidebar con ESC
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeMobileSidebar();
});

// --- Dropdown usuario ---
function toggleUserDropdown() {
  document.getElementById('userDropdown').classList.toggle('show');
  document.getElementById('userMenuButton').classList.toggle('active');
}

document.addEventListener('click', e => {
  const dropdown = document.getElementById('userDropdown');
  const button = document.getElementById('userMenuButton');
  if (dropdown && button && !button.contains(e.target)) {
    dropdown.classList.remove('show');
    button.classList.remove('active');
  }
});
