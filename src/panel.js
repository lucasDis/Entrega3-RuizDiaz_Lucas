function logout() {
  if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
    window.location.href = "../Principal/login.html";
  }
}

function openProductModal() {
  window.location.href = 'nuevo-producto.html';
}

function editProduct(id) {
  alert('Editar producto ID: ' + id);
}

function viewProduct(id) {
  alert('Ver producto ID: ' + id);
}

function deleteProduct(id) {
  if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
    alert('Producto eliminado ID: ' + id);
  }
}

function filterProducts() {
  const search = document.getElementById('searchProduct').value;
  const category = document.getElementById('categoryFilter').value;
  const status = document.getElementById('statusFilter').value;

  console.log('Filtros aplicados:', { search, category, status });
}

document.addEventListener('DOMContentLoaded', function () {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const currentPage = location.pathname.split('/').pop();

  tabBtns.forEach(btn => {
    // Marcar activa la pestaña correspondiente
    if (btn.getAttribute('data-tab') === currentPage) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
    // Navegación al hacer click
    btn.addEventListener('click', function () {
      if (btn.getAttribute('data-tab') !== currentPage) {
        window.location.href = btn.getAttribute('data-tab');
      }
    });
  });
});

function exportProducts() {
  alert('Exportando productos...');
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