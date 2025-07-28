        // Variables globales
        let editingProductId = null;

        // Funciones del modal
        function openProductModal(productId = null) {
            const modal = document.getElementById('productModal');
            const modalTitle = document.getElementById('modalTitle');
            
            if (productId) {
                modalTitle.textContent = 'Editar Producto';
                editingProductId = productId;
                // Aquí cargarías los datos del producto para editar
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
                // Aquí implementarías la lógica para guardar el producto
                alert('Producto guardado correctamente');
                closeProductModal();
                // Recargar la tabla de productos
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
                // Implementar lógica de eliminación
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