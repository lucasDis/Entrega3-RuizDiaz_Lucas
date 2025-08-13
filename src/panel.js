
// autenticación real.
// Por ahora solo redirigimos a la vista de administración si se confirma.
function checkAdminAccess() {
  const proceed = confirm('Acceder a administración (requiere cuenta de admin).');
  if (proceed) {
    location.href = 'admin-empresa.html';
  }
}

// Función para toggle del dropdown de usuario
function toggleUserDropdown() {
  const dropdown = document.getElementById('userDropdown');
  const button = document.getElementById('userMenuButton');
  
  dropdown.classList.toggle('show');
  button.classList.toggle('active');
}

// Cerrar dropdown al hacer click fuera
document.addEventListener('click', function(event) {
  const dropdown = document.getElementById('userDropdown');
  const button = document.getElementById('userMenuButton');
  
  if (dropdown && button && !button.contains(event.target)) {
    dropdown.classList.remove('show');
    button.classList.remove('active');
  }
});

// Función para abrir sidebar móvil
function toggleMobileSidebar() {
  const sidebar = document.getElementById('mobileSidebar');
  const overlay = document.getElementById('sidebarOverlay');
  
  sidebar.classList.add('open');
  overlay.classList.add('show');
  document.body.style.overflow = 'hidden';
}

// Función para cerrar sidebar móvil
function closeMobileSidebar() {
  const sidebar = document.getElementById('mobileSidebar');
  const overlay = document.getElementById('sidebarOverlay');
  
  sidebar.classList.remove('open');
  overlay.classList.remove('show');
  document.body.style.overflow = '';
}

// Cerrar sidebar con tecla ESC
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    closeMobileSidebar();
  }
});

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