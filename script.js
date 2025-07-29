// Variables globales
let editingProductId = null;

// Funciones del modal
function openProductModal(productId = null) {
    const modal = document.getElementById('productModal');
    const modalTitle = document.getElementById('modalTitle');
    
    if (productId) {
        modalTitle.textContent = 'Editar Producto';
        editingProductId = productId;
    } else {
        modalTitle.textContent = 'Nuevo Producto';
        editingProductId = null;
        document.getElementById('productForm').reset();
    }
    
    modal.classList.add('active');
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    modal.classList.remove('active');
    editingProductId = null;
}

function saveProduct() {
    const form = document.getElementById('productForm');
    if (form.checkValidity()) {
        alert('Producto guardado correctamente');
        closeProductModal();
    } else {
        form.reportValidity();
    }
}

// Funciones de la tabla
function editProduct(id) {
    openProductModal(id);
}

function viewProduct(id) {
    alert(`Ver detalles del producto ${id}`);
}

function deleteProduct(id) {
    if (confirm('¿Está seguro de que desea eliminar este producto?')) {
        alert(`Producto ${id} eliminado`);
    }
}

function filterProducts() {
    // Implementar lógica de filtrado
    const search = document.getElementById('searchProduct').value;
    const category = document.getElementById('categoryFilter').value;
    const status = document.getElementById('statusFilter').value;
    
    console.log('Filtros aplicados:', { search, category, status });
}

function logout() {
    if (confirm('¿Está seguro de que desea cerrar sesión?')) {
        window.location.href = '../pages/login.html';
    }
}

// Cerrar modal al hacer clic fuera de él
document.getElementById('productModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeProductModal();
    }
});

// PARA PANEL DE USUARIO

function logout() {
  if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
    localStorage.removeItem('userSession');
    sessionStorage.clear();
    window.location.href = 'login.html';
  }
}

// Funciones adicionales para el panel de productos
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