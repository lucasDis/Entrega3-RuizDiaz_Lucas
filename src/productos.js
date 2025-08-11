// Gestión de productos
class ProductManager {
  constructor() {
    this.db = window.db;
    this.currentProducts = [];
    this.init();
  }

  async init() {
    await this.loadProducts();
    this.setupEventListeners();
  }

  async loadProducts() {
    this.currentProducts = await this.db.getData('productos');
    this.renderProducts();
    this.updateStats();
  }

  renderProducts() {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;

    tbody.innerHTML = this.currentProducts.map(product => `
      <tr>
        <td>${product.id}</td>
        <td>
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 40px; height: 40px; background: #f3f4f6; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
              <i class="fas ${this.getCategoryIcon(product.categoria)}" style="color: #6b7280;"></i>
            </div>
            <div>
              <strong>${product.nombre}</strong>
              <div style="font-size: 0.75rem; color: #6b7280;">SKU: ${product.sku}</div>
            </div>
          </div>
        </td>
        <td>${product.categoria}</td>
        <td>$${product.precio.toLocaleString('es-AR')}</td>
        <td>
          <span class="badge ${this.getStockBadgeClass(product.stock)}">${product.stock} unidades</span>
        </td>
        <td>
          <span class="badge ${this.getStatusBadgeClass(product.estado)}">${product.estado}</span>
        </td>
        <td class="actions">
          <button class="btn btn-sm btn-primary" onclick="productManager.editProduct('${product.id}')">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn btn-sm btn-warning" onclick="productManager.viewProduct('${product.id}')">
            <i class="fas fa-eye"></i>
          </button>
          <button class="btn btn-sm btn-danger" onclick="productManager.deleteProduct('${product.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');
  }

  getCategoryIcon(categoria) {
    const icons = {
      'Electrónica': 'fa-laptop',
      'Deportes': 'fa-tshirt',
      'Hogar': 'fa-couch',
      'Ropa': 'fa-tshirt',
      'Libros': 'fa-book'
    };
    return icons[categoria] || 'fa-box';
  }

  getStockBadgeClass(stock) {
    if (stock === 0) return 'badge-danger';
    if (stock <= 5) return 'badge-warning';
    return 'badge-success';
  }

  getStatusBadgeClass(estado) {
    const classes = {
      'Activo': 'badge-success',
      'Inactivo': 'badge-secondary',
      'Agotado': 'badge-danger'
    };
    return classes[estado] || 'badge-secondary';
  }

  updateStats() {
    const total = this.currentProducts.length;
    const activos = this.currentProducts.filter(p => p.estado === 'Activo').length;
    const stockBajo = this.currentProducts.filter(p => p.stock <= 5 && p.stock > 0).length;
    const sinStock = this.currentProducts.filter(p => p.stock === 0).length;

    // Actualizar estadísticas en el DOM
    const statCards = document.querySelectorAll('.stat-card');
    if (statCards.length >= 4) {
      statCards[0].querySelector('.stat-value').textContent = total.toLocaleString();
      statCards[1].querySelector('.stat-value').textContent = activos.toLocaleString();
      statCards[2].querySelector('.stat-value').textContent = stockBajo.toLocaleString();
      statCards[3].querySelector('.stat-value').textContent = sinStock.toLocaleString();
    }
  }

  setupEventListeners() {
    // Filtros
    const searchInput = document.getElementById('searchProduct');
    const categoryFilter = document.getElementById('categoryFilter');
    const statusFilter = document.getElementById('statusFilter');

    if (searchInput) {
      searchInput.addEventListener('input', () => this.filterProducts());
    }
    if (categoryFilter) {
      categoryFilter.addEventListener('change', () => this.filterProducts());
    }
    if (statusFilter) {
      statusFilter.addEventListener('change', () => this.filterProducts());
    }
  }

  filterProducts() {
    const search = document.getElementById('searchProduct')?.value.toLowerCase() || '';
    const category = document.getElementById('categoryFilter')?.value || '';
    const status = document.getElementById('statusFilter')?.value || '';

    let filtered = this.currentProducts;

    if (search) {
      filtered = filtered.filter(p => 
        p.nombre.toLowerCase().includes(search) ||
        p.sku.toLowerCase().includes(search) ||
        p.categoria.toLowerCase().includes(search)
      );
    }

    if (category) {
      filtered = filtered.filter(p => p.categoria === category);
    }

    if (status) {
      filtered = filtered.filter(p => p.estado === status);
    }

    // Renderizar productos filtrados
    const tbody = document.getElementById('productsTableBody');
    if (tbody) {
      tbody.innerHTML = filtered.map(product => `
        <tr>
          <td>${product.id}</td>
          <td>
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 40px; height: 40px; background: #f3f4f6; border-radius: 4px; display: flex; align-items: center; justify-content: center;">
                <i class="fas ${this.getCategoryIcon(product.categoria)}" style="color: #6b7280;"></i>
              </div>
              <div>
                <strong>${product.nombre}</strong>
                <div style="font-size: 0.75rem; color: #6b7280;">SKU: ${product.sku}</div>
              </div>
            </div>
          </td>
          <td>${product.categoria}</td>
          <td>$${product.precio.toLocaleString('es-AR')}</td>
          <td>
            <span class="badge ${this.getStockBadgeClass(product.stock)}">${product.stock} unidades</span>
          </td>
          <td>
            <span class="badge ${this.getStatusBadgeClass(product.estado)}">${product.estado}</span>
          </td>
          <td class="actions">
            <button class="btn btn-sm btn-primary" onclick="productManager.editProduct('${product.id}')">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-warning" onclick="productManager.viewProduct('${product.id}')">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn btn-sm btn-danger" onclick="productManager.deleteProduct('${product.id}')">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      `).join('');
    }
  }

  async openProductModal(productId = null) {
    const isEdit = !!productId;
    let product = null;

    if (isEdit) {
      product = this.currentProducts.find(p => p.id === productId);
    }

    const modalHtml = `
      <div id="productModal" class="modal" style="display: block; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5);">
        <div class="modal-dialog" style="position: relative; margin: 5% auto; width: 90%; max-width: 600px;">
          <div class="modal-content" style="background: white; border-radius: 12px; padding: 0; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
            <div class="modal-header" style="padding: 20px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
              <h5 class="modal-title" style="margin: 0; font-weight: 600;">${isEdit ? 'Editar Producto' : 'Nuevo Producto'}</h5>
              <button type="button" class="close" onclick="productManager.closeProductModal()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
            </div>
            <div class="modal-body" style="padding: 20px;">
              <form id="productForm">
                <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                  <div class="form-group">
                    <label class="form-label" style="font-weight: 600; margin-bottom: 0.5rem; display: block;">Nombre del Producto</label>
                    <input type="text" class="form-control" id="productName" value="${product?.nombre || ''}" required style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px;">
                  </div>
                  <div class="form-group">
                    <label class="form-label" style="font-weight: 600; margin-bottom: 0.5rem; display: block;">Código SKU</label>
                    <input type="text" class="form-control" id="productSku" value="${product?.sku || ''}" required style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px;">
                  </div>
                </div>
                <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                  <div class="form-group">
                    <label class="form-label" style="font-weight: 600; margin-bottom: 0.5rem; display: block;">Categoría</label>
                    <select class="form-control" id="productCategory" required style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px;">
                      <option value="">Seleccionar</option>
                      <option value="Electrónica" ${product?.categoria === 'Electrónica' ? 'selected' : ''}>Electrónica</option>
                      <option value="Ropa" ${product?.categoria === 'Ropa' ? 'selected' : ''}>Ropa</option>
                      <option value="Hogar" ${product?.categoria === 'Hogar' ? 'selected' : ''}>Hogar</option>
                      <option value="Deportes" ${product?.categoria === 'Deportes' ? 'selected' : ''}>Deportes</option>
                      <option value="Libros" ${product?.categoria === 'Libros' ? 'selected' : ''}>Libros</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label" style="font-weight: 600; margin-bottom: 0.5rem; display: block;">Estado</label>
                    <select class="form-control" id="productStatus" required style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px;">
                      <option value="Activo" ${product?.estado === 'Activo' ? 'selected' : ''}>Activo</option>
                      <option value="Inactivo" ${product?.estado === 'Inactivo' ? 'selected' : ''}>Inactivo</option>
                    </select>
                  </div>
                </div>
                <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                  <div class="form-group">
                    <label class="form-label" style="font-weight: 600; margin-bottom: 0.5rem; display: block;">Precio</label>
                    <input type="number" class="form-control" id="productPrice" value="${product?.precio || ''}" required min="0" step="0.01" style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px;">
                  </div>
                  <div class="form-group">
                    <label class="form-label" style="font-weight: 600; margin-bottom: 0.5rem; display: block;">Stock</label>
                    <input type="number" class="form-control" id="productStock" value="${product?.stock || ''}" required min="0" style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px;">
                  </div>
                </div>
              </form>
            </div>
            <div class="modal-footer" style="padding: 20px; border-top: 1px solid #e5e7eb; display: flex; gap: 0.5rem; justify-content: flex-end;">
              <button type="button" class="btn btn-secondary" onclick="productManager.closeProductModal()" style="padding: 0.75rem 1.5rem; border: none; border-radius: 8px; cursor: pointer;">Cancelar</button>
              <button type="button" class="btn btn-success" onclick="productManager.saveProduct('${productId || ''}')" style="padding: 0.75rem 1.5rem; border: none; border-radius: 8px; cursor: pointer; background: #059669; color: white;">
                <i class="fas fa-save"></i> ${isEdit ? 'Actualizar' : 'Guardar'} Producto
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  }

  closeProductModal() {
    const modal = document.getElementById('productModal');
    if (modal) {
      modal.remove();
    }
  }

  async saveProduct(productId = '') {
    const form = document.getElementById('productForm');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const productData = {
      nombre: document.getElementById('productName').value,
      sku: document.getElementById('productSku').value,
      categoria: document.getElementById('productCategory').value,
      precio: parseFloat(document.getElementById('productPrice').value),
      stock: parseInt(document.getElementById('productStock').value),
      estado: document.getElementById('productStatus').value,
      fechaCreacion: productId ? undefined : new Date().toISOString().split('T')[0]
    };

    try {
      if (productId) {
        await this.db.updateRecord('productos', productId, productData);
        this.showNotification('Producto actualizado correctamente', 'success');
      } else {
        await this.db.addRecord('productos', productData);
        this.showNotification('Producto creado correctamente', 'success');
      }

      this.closeProductModal();
      await this.loadProducts();
    } catch (error) {
      this.showNotification('Error al guardar el producto', 'error');
      console.error(error);
    }
  }

  async editProduct(productId) {
    await this.openProductModal(productId);
  }

  async viewProduct(productId) {
    const product = this.currentProducts.find(p => p.id === productId);
    if (!product) return;

    const modalHtml = `
      <div id="viewProductModal" class="modal" style="display: block; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5);">
        <div class="modal-dialog" style="position: relative; margin: 5% auto; width: 90%; max-width: 500px;">
          <div class="modal-content" style="background: white; border-radius: 12px; padding: 0; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
            <div class="modal-header" style="padding: 20px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
              <h5 class="modal-title" style="margin: 0; font-weight: 600;">Detalles del Producto</h5>
              <button type="button" class="close" onclick="productManager.closeViewModal()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
            </div>
            <div class="modal-body" style="padding: 20px;">
              <div style="text-align: center; margin-bottom: 20px;">
                <div style="width: 80px; height: 80px; background: #f3f4f6; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px;">
                  <i class="fas ${this.getCategoryIcon(product.categoria)}" style="font-size: 2rem; color: #6b7280;"></i>
                </div>
                <h4 style="margin: 0; color: #111827;">${product.nombre}</h4>
                <p style="margin: 5px 0; color: #6b7280;">SKU: ${product.sku}</p>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div>
                  <strong>Categoría:</strong><br>
                  <span style="color: #6b7280;">${product.categoria}</span>
                </div>
                <div>
                  <strong>Estado:</strong><br>
                  <span class="badge ${this.getStatusBadgeClass(product.estado)}">${product.estado}</span>
                </div>
                <div>
                  <strong>Precio:</strong><br>
                  <span style="color: #059669; font-weight: 600;">$${product.precio.toLocaleString('es-AR')}</span>
                </div>
                <div>
                  <strong>Stock:</strong><br>
                  <span class="badge ${this.getStockBadgeClass(product.stock)}">${product.stock} unidades</span>
                </div>
              </div>
              ${product.fechaCreacion ? `
                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
                  <strong>Fecha de creación:</strong><br>
                  <span style="color: #6b7280;">${new Date(product.fechaCreacion).toLocaleDateString('es-AR')}</span>
                </div>
              ` : ''}
            </div>
            <div class="modal-footer" style="padding: 20px; border-top: 1px solid #e5e7eb; display: flex; gap: 0.5rem; justify-content: flex-end;">
              <button type="button" class="btn btn-primary" onclick="productManager.editProduct('${product.id}'); productManager.closeViewModal();" style="padding: 0.75rem 1.5rem; border: none; border-radius: 8px; cursor: pointer; background: #1e40af; color: white;">
                <i class="fas fa-edit"></i> Editar
              </button>
              <button type="button" class="btn btn-secondary" onclick="productManager.closeViewModal()" style="padding: 0.75rem 1.5rem; border: none; border-radius: 8px; cursor: pointer;">Cerrar</button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  }

  closeViewModal() {
    const modal = document.getElementById('viewProductModal');
    if (modal) {
      modal.remove();
    }
  }

  async deleteProduct(productId) {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      return;
    }

    try {
      await this.db.deleteRecord('productos', productId);
      this.showNotification('Producto eliminado correctamente', 'success');
      await this.loadProducts();
    } catch (error) {
      this.showNotification('Error al eliminar el producto', 'error');
      console.error(error);
    }
  }

  async exportProducts() {
    const products = await this.db.getData('productos');
    
    // Mostrar modal de selección de formato
    const modalHtml = `
      <div id="exportModal" class="modal" style="display: block; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5);">
        <div class="modal-dialog" style="position: relative; margin: 15% auto; width: 90%; max-width: 400px;">
          <div class="modal-content" style="background: white; border-radius: 12px; padding: 0; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
            <div class="modal-header" style="padding: 20px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
              <h5 class="modal-title" style="margin: 0; font-weight: 600;">Exportar Productos</h5>
              <button type="button" class="close" onclick="productManager.closeExportModal()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
            </div>
            <div class="modal-body" style="padding: 20px;">
              <p style="margin-bottom: 15px;">Selecciona el formato de exportación:</p>
              <div style="display: grid; gap: 10px;">
                <button class="btn btn-outline-primary" onclick="productManager.downloadFile('xlsx')" style="padding: 10px; border: 2px solid #1e40af; color: #1e40af; background: white; border-radius: 8px; cursor: pointer;">
                  <i class="fas fa-file-excel"></i> Excel (.xlsx)
                </button>
                <button class="btn btn-outline-primary" onclick="productManager.downloadFile('csv')" style="padding: 10px; border: 2px solid #1e40af; color: #1e40af; background: white; border-radius: 8px; cursor: pointer;">
                  <i class="fas fa-file-csv"></i> CSV (.csv)
                </button>
                <button class="btn btn-outline-primary" onclick="productManager.downloadFile('json')" style="padding: 10px; border: 2px solid #1e40af; color: #1e40af; background: white; border-radius: 8px; cursor: pointer;">
                  <i class="fas fa-file-code"></i> JSON (.json)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  }

  closeExportModal() {
    const modal = document.getElementById('exportModal');
    if (modal) {
      modal.remove();
    }
  }

  async downloadFile(format) {
    const products = await this.db.getData('productos');
    let content, filename, mimeType;

    switch (format) {
      case 'xlsx':
        content = this.generateExcelContent(products);
        filename = `productos_${new Date().toISOString().split('T')[0]}.xlsx`;
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;
      case 'csv':
        content = this.generateCSVContent(products);
        filename = `productos_${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
        break;
      case 'json':
        content = JSON.stringify(products, null, 2);
        filename = `productos_${new Date().toISOString().split('T')[0]}.json`;
        mimeType = 'application/json';
        break;
    }

    // Crear y descargar archivo
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    this.closeExportModal();
    this.showNotification(`Archivo ${format.toUpperCase()} descargado correctamente`, 'success');
  }

  generateCSVContent(products) {
    const headers = ['ID', 'Nombre', 'SKU', 'Categoría', 'Precio', 'Stock', 'Estado', 'Fecha Creación'];
    const rows = products.map(p => [
      p.id,
      p.nombre,
      p.sku,
      p.categoria,
      p.precio,
      p.stock,
      p.estado,
      p.fechaCreacion || ''
    ]);

    return [headers, ...rows].map(row => 
      row.map(field => `"${field}"`).join(',')
    ).join('\n');
  }

  generateExcelContent(products) {
    // Simulación de contenido Excel (en un proyecto real usarías una librería como SheetJS)
    const csv = this.generateCSVContent(products);
    return csv; // Para este ejemplo, devolvemos CSV
  }

  showNotification(message, type = 'info') {
    // Crear notificación
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      padding: 15px 20px;
      border-radius: 8px;
      color: white;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      animation: slideIn 0.3s ease;
    `;

    const colors = {
      success: '#059669',
      error: '#dc2626',
      info: '#1e40af',
      warning: '#d97706'
    };

    notification.style.backgroundColor = colors[type] || colors.info;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Auto-remove después de 3 segundos
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }, 3000);

    // Agregar estilos de animación si no existen
    if (!document.querySelector('#notification-animations')) {
      const style = document.createElement('style');
      style.id = 'notification-animations';
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('productsTableBody')) {
    window.productManager = new ProductManager();
  }
});

// Funciones globales para compatibilidad
window.openProductModal = () => window.productManager?.openProductModal();
window.filterProducts = () => window.productManager?.filterProducts();