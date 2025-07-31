
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