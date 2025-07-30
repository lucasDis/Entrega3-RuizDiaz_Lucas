document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-tab[data-tab]').forEach(tab => {
    tab.addEventListener('click', () => {
      const href = tab.getAttribute('data-tab');
      if (href === 'compra-venta') location.href = 'compra-venta.html';
      if (href === 'cuenta-corriente') location.href = 'cuenta-corriente.html';
    });
  });
});

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
