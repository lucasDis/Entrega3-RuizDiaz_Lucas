function logout() {
  if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
    window.location.href = "../Principal/login.html";
  }
}

function checkAdminAccess() {
  const password = prompt('Ingrese la contraseña de administrador:');
  if (password === 'admin123') {
    location.href = 'admin-empresa.html';
  } else if (password !== null) {
    alert('Contraseña incorrecta. Acceso denegado.');
  }
}

// Efectos hover para las tarjetas de acciones rápidas
document.addEventListener('DOMContentLoaded', function() {
  const actionCards = document.querySelectorAll('.admin-card[onclick]');
  actionCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-3px) scale(1.02)';
      this.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0) scale(1)';
      this.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
    });
  });
});