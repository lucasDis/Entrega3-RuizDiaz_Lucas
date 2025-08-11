// Gestión de Clientes y Proveedores
class ClientesProveedoresManager {
  constructor() {
    this.db = window.db;
    this.currentType = 'clientes'; // 'clientes' o 'proveedores'
    this.init();
  }

  async init() {
    await this.loadData();
    this.setupEventListeners();
  }

  async loadData() {
    if (window.location.pathname.includes('clientes.html')) {
      this.currentType = 'clientes';
      this.currentData = await this.db.getData('clientes');
    } else if (window.location.pathname.includes('proveedores.html')) {
      this.currentType = 'proveedores';
      this.currentData = await this.db.getData('proveedores');
    }
    this.renderData();
  }

  renderData() {
    const tbody = document.querySelector('.admin-table tbody');
    if (!tbody) return;

    if (this.currentType === 'clientes') {
      tbody.innerHTML = this.currentData.map(cliente => `
        <tr>
          <td>${cliente.id}</td>
          <td>${cliente.nombre}</td>
          <td>${cliente.email}</td>
          <td>${cliente.telefono}</td>
          <td>${cliente.fechaAlta}</td>
          <td><span class="badge ${cliente.estado === 'Activo' ? 'badge-success' : 'badge-secondary'}">${cliente.estado}</span></td>
          <td>
            <button class="btn btn-sm btn-primary" onclick="clientesProveedoresManager.edit('${cliente.id}')">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-danger" onclick="clientesProveedoresManager.delete('${cliente.id}')">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      `).join('');
    } else {
      tbody.innerHTML = this.currentData.map(proveedor => `
        <tr>
          <td>${proveedor.id}</td>
          <td>${proveedor.empresa}</td>
          <td>${proveedor.contacto}</td>
          <td>${proveedor.telefono}</td>
          <td>${proveedor.email}</td>
          <td><span class="badge ${proveedor.estado === 'Activo' ? 'badge-success' : 'badge-secondary'}">${proveedor.estado}</span></td>
          <td>
            <button class="btn btn-sm btn-primary" onclick="clientesProveedoresManager.edit('${proveedor.id}')">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-danger" onclick="clientesProveedoresManager.delete('${proveedor.id}')">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      `).join('');
    }
  }

  setupEventListeners() {
    // Agregar event listeners para formularios
    const form = document.querySelector('.admin-form form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveRecord();
      });
    }
  }

  async saveRecord() {
    const form = document.querySelector('.admin-form form');
    const formData = new FormData(form);
    
    const recordData = {
      fechaAlta: new Date().toISOString().split('T')[0],
      estado: 'Activo',
      saldo: 0
    };

    // Obtener datos del formulario
    for (let [key, value] of formData.entries()) {
      recordData[key] = value;
    }

    // Campos específicos según el tipo
    if (this.currentType === 'clientes') {
      recordData.nombre = form.querySelector('input[placeholder*="Nombre"]')?.value || 
                         form.querySelector('input[type="text"]')?.value;
      recordData.email = form.querySelector('input[type="email"]')?.value;
      recordData.telefono = form.querySelector('input[placeholder*="Teléfono"]')?.value;
      recordData.direccion = form.querySelector('input[placeholder*="Dirección"]')?.value;
    } else {
      recordData.empresa = form.querySelector('input[placeholder*="Razón Social"]')?.value ||
                          form.querySelector('input[type="text"]')?.value;
      recordData.contacto = form.querySelector('input[placeholder*="Contacto"]')?.value || 'N/A';
      recordData.email = form.querySelector('input[type="email"]')?.value;
      recordData.telefono = form.querySelector('input[placeholder*="Teléfono"]')?.value;
      recordData.direccion = form.querySelector('input[placeholder*="Dirección"]')?.value;
    }

    try {
      await this.db.addRecord(this.currentType, recordData);
      this.showNotification(`${this.currentType === 'clientes' ? 'Cliente' : 'Proveedor'} agregado correctamente`, 'success');
      form.reset();
      await this.loadData();
    } catch (error) {
      this.showNotification('Error al guardar', 'error');
      console.error(error);
    }
  }

  async edit(id) {
    const record = this.currentData.find(item => item.id === id);
    if (!record) return;

    const isCliente = this.currentType === 'clientes';
    const modalHtml = `
      <div id="editModal" class="modal" style="display: block; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5);">
        <div class="modal-dialog" style="position: relative; margin: 5% auto; width: 90%; max-width: 600px;">
          <div class="modal-content" style="background: white; border-radius: 12px; padding: 0; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
            <div class="modal-header" style="padding: 20px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
              <h5 class="modal-title" style="margin: 0; font-weight: 600;">Editar ${isCliente ? 'Cliente' : 'Proveedor'}</h5>
              <button type="button" class="close" onclick="clientesProveedoresManager.closeModal()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
            </div>
            <div class="modal-body" style="padding: 20px;">
              <form id="editForm">
                <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                  <div class="form-group">
                    <label class="form-label" style="font-weight: 600; margin-bottom: 0.5rem; display: block;">${isCliente ? 'Nombre' : 'Empresa'}</label>
                    <input type="text" class="form-control" id="editName" value="${isCliente ? record.nombre : record.empresa}" required style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px;">
                  </div>
                  ${!isCliente ? `
                    <div class="form-group">
                      <label class="form-label" style="font-weight: 600; margin-bottom: 0.5rem; display: block;">Contacto</label>
                      <input type="text" class="form-control" id="editContacto" value="${record.contacto || ''}" style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px;">
                    </div>
                  ` : '<div></div>'}
                </div>
                <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                  <div class="form-group">
                    <label class="form-label" style="font-weight: 600; margin-bottom: 0.5rem; display: block;">Email</label>
                    <input type="email" class="form-control" id="editEmail" value="${record.email}" style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px;">
                  </div>
                  <div class="form-group">
                    <label class="form-label" style="font-weight: 600; margin-bottom: 0.5rem; display: block;">Teléfono</label>
                    <input type="text" class="form-control" id="editTelefono" value="${record.telefono}" style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px;">
                  </div>
                </div>
                <div class="form-row" style="margin-bottom: 1rem;">
                  <div class="form-group">
                    <label class="form-label" style="font-weight: 600; margin-bottom: 0.5rem; display: block;">Dirección</label>
                    <input type="text" class="form-control" id="editDireccion" value="${record.direccion || ''}" style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px;">
                  </div>
                </div>
                <div class="form-row" style="margin-bottom: 1rem;">
                  <div class="form-group">
                    <label class="form-label" style="font-weight: 600; margin-bottom: 0.5rem; display: block;">Estado</label>
                    <select class="form-control" id="editEstado" style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px;">
                      <option value="Activo" ${record.estado === 'Activo' ? 'selected' : ''}>Activo</option>
                      <option value="Inactivo" ${record.estado === 'Inactivo' ? 'selected' : ''}>Inactivo</option>
                    </select>
                  </div>
                </div>
              </form>
            </div>
            <div class="modal-footer" style="padding: 20px; border-top: 1px solid #e5e7eb; display: flex; gap: 0.5rem; justify-content: flex-end;">
              <button type="button" class="btn btn-secondary" onclick="clientesProveedoresManager.closeModal()" style="padding: 0.75rem 1.5rem; border: none; border-radius: 8px; cursor: pointer;">Cancelar</button>
              <button type="button" class="btn btn-success" onclick="clientesProveedoresManager.saveEdit('${id}')" style="padding: 0.75rem 1.5rem; border: none; border-radius: 8px; cursor: pointer; background: #059669; color: white;">
                <i class="fas fa-save"></i> Actualizar
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  }

  async saveEdit(id) {
    const form = document.getElementById('editForm');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const updateData = {
      email: document.getElementById('editEmail').value,
      telefono: document.getElementById('editTelefono').value,
      direccion: document.getElementById('editDireccion').value,
      estado: document.getElementById('editEstado').value
    };

    if (this.currentType === 'clientes') {
      updateData.nombre = document.getElementById('editName').value;
    } else {
      updateData.empresa = document.getElementById('editName').value;
      updateData.contacto = document.getElementById('editContacto')?.value || '';
    }

    try {
      await this.db.updateRecord(this.currentType, id, updateData);
      this.showNotification(`${this.currentType === 'clientes' ? 'Cliente' : 'Proveedor'} actualizado correctamente`, 'success');
      this.closeModal();
      await this.loadData();
    } catch (error) {
      this.showNotification('Error al actualizar', 'error');
      console.error(error);
    }
  }

  async delete(id) {
    if (!confirm(`¿Estás seguro de que deseas eliminar este ${this.currentType === 'clientes' ? 'cliente' : 'proveedor'}?`)) {
      return;
    }

    try {
      await this.db.deleteRecord(this.currentType, id);
      this.showNotification(`${this.currentType === 'clientes' ? 'Cliente' : 'Proveedor'} eliminado correctamente`, 'success');
      await this.loadData();
    } catch (error) {
      this.showNotification('Error al eliminar', 'error');
      console.error(error);
    }
  }

  closeModal() {
    const modal = document.getElementById('editModal');
    if (modal) {
      modal.remove();
    }
  }

  showNotification(message, type = 'info') {
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

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }, 3000);
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.admin-table') && 
      (window.location.pathname.includes('clientes.html') || 
       window.location.pathname.includes('proveedores.html'))) {
    window.clientesProveedoresManager = new ClientesProveedoresManager();
  }
});