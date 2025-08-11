// Gestión de Cuenta Corriente
class CuentaCorrienteManager {
  constructor() {
    this.db = window.db;
    this.init();
  }

  async init() {
    this.setupEventListeners();
    await this.loadData();
  }

  setupEventListeners() {
    // Event listeners para modales
    document.addEventListener('click', (e) => {
      if (e.target.closest('[onclick*="openPaymentModal"]')) {
        e.preventDefault();
        this.openPaymentModal();
      }
      if (e.target.closest('[onclick*="openChargeModal"]')) {
        e.preventDefault();
        this.openChargeModal();
      }
      if (e.target.closest('[onclick*="generateAccountReport"]')) {
        e.preventDefault();
        this.generateAccountReport();
      }
    });
  }

  async loadData() {
    // Cargar datos para los dropdowns
    this.clientes = await this.db.getData('clientes');
    this.proveedores = await this.db.getData('proveedores');
  }

  openPaymentModal() {
    const modalHtml = `
      <div id="paymentModal" class="modal" style="display: block; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5);">
        <div class="modal-dialog" style="position: relative; margin: 5% auto; width: 90%; max-width: 600px;">
          <div class="modal-content" style="background: white; border-radius: 12px; padding: 0; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
            <div class="modal-header" style="padding: 20px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
              <h5 class="modal-title" style="margin: 0; font-weight: 600;">Registrar Pago</h5>
              <button type="button" class="close" onclick="cuentaCorrienteManager.closePaymentModal()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
            </div>
            <div class="modal-body" style="padding: 20px;">
              <form id="paymentForm">
                <div class="form-group" style="margin-bottom: 1rem;">
                  <label class="form-label" style="font-weight: 600; margin-bottom: 0.5rem; display: block;">Tipo</label>
                  <select class="form-control" id="paymentType" onchange="cuentaCorrienteManager.updatePaymentForm()" style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px;">
                    <option value="client">Pago de Cliente</option>
                    <option value="supplier">Pago a Proveedor</option>
                  </select>
                </div>
                <div class="form-group" style="margin-bottom: 1rem;">
                  <label class="form-label" id="paymentEntityLabel" style="font-weight: 600; margin-bottom: 0.5rem; display: block;">Cliente</label>
                  <select class="form-control" id="paymentEntity" required style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px;">
                    <option value="">Seleccionar cliente</option>
                    ${this.clientes.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('')}
                  </select>
                </div>
                <div class="form-group" style="margin-bottom: 1rem;">
                  <label class="form-label" style="font-weight: 600; margin-bottom: 0.5rem; display: block;">Monto</label>
                  <input type="number" class="form-control" id="paymentAmount" min="0" step="0.01" required style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px;">
                </div>
                <div class="form-group" style="margin-bottom: 1rem;">
                  <label class="form-label" style="font-weight: 600; margin-bottom: 0.5rem; display: block;">Método de Pago</label>
                  <select class="form-control" id="paymentMethod" required style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px;">
                    <option value="">Seleccionar método</option>
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="cheque">Cheque</option>
                    <option value="tarjeta">Tarjeta</option>
                  </select>
                </div>
                <div class="form-group" style="margin-bottom: 1rem;">
                  <label class="form-label" style="font-weight: 600; margin-bottom: 0.5rem; display: block;">Concepto</label>
                  <textarea class="form-control" id="paymentConcept" rows="3" style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px; resize: vertical;"></textarea>
                </div>
              </form>
            </div>
            <div class="modal-footer" style="padding: 20px; border-top: 1px solid #e5e7eb; display: flex; gap: 0.5rem; justify-content: flex-end;">
              <button type="button" class="btn btn-secondary" onclick="cuentaCorrienteManager.closePaymentModal()" style="padding: 0.75rem 1.5rem; border: none; border-radius: 8px; cursor: pointer;">Cancelar</button>
              <button type="button" class="btn btn-success" onclick="cuentaCorrienteManager.savePayment()" style="padding: 0.75rem 1.5rem; border: none; border-radius: 8px; cursor: pointer; background: #059669; color: white;">
                <i class="fas fa-save"></i> Registrar Pago
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  }

  updatePaymentForm() {
    const paymentType = document.getElementById('paymentType').value;
    const entityLabel = document.getElementById('paymentEntityLabel');
    const entitySelect = document.getElementById('paymentEntity');

    if (paymentType === 'client') {
      entityLabel.textContent = 'Cliente';
      entitySelect.innerHTML = `
        <option value="">Seleccionar cliente</option>
        ${this.clientes.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('')}
      `;
    } else {
      entityLabel.textContent = 'Proveedor';
      entitySelect.innerHTML = `
        <option value="">Seleccionar proveedor</option>
        ${this.proveedores.map(p => `<option value="${p.id}">${p.empresa}</option>`).join('')}
      `;
    }
  }

  async savePayment() {
    const form = document.getElementById('paymentForm');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const paymentData = {
      tipo: document.getElementById('paymentType').value,
      entidadId: document.getElementById('paymentEntity').value,
      monto: parseFloat(document.getElementById('paymentAmount').value),
      metodo: document.getElementById('paymentMethod').value,
      concepto: document.getElementById('paymentConcept').value,
      fecha: new Date().toISOString().split('T')[0],
      hora: new Date().toLocaleTimeString('es-AR')
    };

    try {
      await this.db.addRecord('pagos', paymentData);
      
      // Actualizar saldo de cliente/proveedor
      if (paymentData.tipo === 'client') {
        const cliente = this.clientes.find(c => c.id === paymentData.entidadId);
        if (cliente) {
          await this.db.updateRecord('clientes', cliente.id, {
            saldo: (cliente.saldo || 0) - paymentData.monto
          });
        }
      } else {
        const proveedor = this.proveedores.find(p => p.id === paymentData.entidadId);
        if (proveedor) {
          await this.db.updateRecord('proveedores', proveedor.id, {
            saldo: (proveedor.saldo || 0) + paymentData.monto
          });
        }
      }

      // Registrar movimiento
      await this.db.addRecord('movimientos', {
        tipo: 'Pago',
        referencia: paymentData.id,
        detalle: `Pago ${paymentData.tipo === 'client' ? 'de cliente' : 'a proveedor'}: ${paymentData.concepto}`,
        importe: paymentData.monto,
        fecha: paymentData.fecha
      });

      this.closePaymentModal();
      this.showNotification('Pago registrado correctamente', 'success');
    } catch (error) {
      this.showNotification('Error al registrar el pago', 'error');
      console.error(error);
    }
  }

  closePaymentModal() {
    const modal = document.getElementById('paymentModal');
    if (modal) {
      modal.remove();
    }
  }

  openChargeModal() {
    const modalHtml = `
      <div id="chargeModal" class="modal" style="display: block; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5);">
        <div class="modal-dialog" style="position: relative; margin: 5% auto; width: 90%; max-width: 600px;">
          <div class="modal-content" style="background: white; border-radius: 12px; padding: 0; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
            <div class="modal-header" style="padding: 20px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
              <h5 class="modal-title" style="margin: 0; font-weight: 600;">Registrar Cargo</h5>
              <button type="button" class="close" onclick="cuentaCorrienteManager.closeChargeModal()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
            </div>
            <div class="modal-body" style="padding: 20px;">
              <form id="chargeForm">
                <div class="form-group" style="margin-bottom: 1rem;">
                  <label class="form-label" style="font-weight: 600; margin-bottom: 0.5rem; display: block;">Cliente</label>
                  <select class="form-control" id="chargeClient" required style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px;">
                    <option value="">Seleccionar cliente</option>
                    ${this.clientes.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('')}
                  </select>
                </div>
                <div class="form-group" style="margin-bottom: 1rem;">
                  <label class="form-label" style="font-weight: 600; margin-bottom: 0.5rem; display: block;">Monto</label>
                  <input type="number" class="form-control" id="chargeAmount" min="0" step="0.01" required style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px;">
                </div>
                <div class="form-group" style="margin-bottom: 1rem;">
                  <label class="form-label" style="font-weight: 600; margin-bottom: 0.5rem; display: block;">Concepto</label>
                  <textarea class="form-control" id="chargeConcept" rows="3" required style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px; resize: vertical;"></textarea>
                </div>
              </form>
            </div>
            <div class="modal-footer" style="padding: 20px; border-top: 1px solid #e5e7eb; display: flex; gap: 0.5rem; justify-content: flex-end;">
              <button type="button" class="btn btn-secondary" onclick="cuentaCorrienteManager.closeChargeModal()" style="padding: 0.75rem 1.5rem; border: none; border-radius: 8px; cursor: pointer;">Cancelar</button>
              <button type="button" class="btn btn-primary" onclick="cuentaCorrienteManager.saveCharge()" style="padding: 0.75rem 1.5rem; border: none; border-radius: 8px; cursor: pointer; background: #1e40af; color: white;">
                <i class="fas fa-save"></i> Registrar Cargo
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);
  }

  async saveCharge() {
    const form = document.getElementById('chargeForm');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const chargeData = {
      clienteId: document.getElementById('chargeClient').value,
      monto: parseFloat(document.getElementById('chargeAmount').value),
      concepto: document.getElementById('chargeConcept').value,
      fecha: new Date().toISOString().split('T')[0],
      hora: new Date().toLocaleTimeString('es-AR')
    };

    try {
      await this.db.addRecord('cargos', chargeData);
      
      // Actualizar saldo del cliente
      const cliente = this.clientes.find(c => c.id === chargeData.clienteId);
      if (cliente) {
        await this.db.updateRecord('clientes', cliente.id, {
          saldo: (cliente.saldo || 0) + chargeData.monto
        });
      }

      // Registrar movimiento
      await this.db.addRecord('movimientos', {
        tipo: 'Cargo',
        referencia: chargeData.id,
        detalle: `Cargo a cliente: ${chargeData.concepto}`,
        importe: chargeData.monto,
        fecha: chargeData.fecha
      });

      this.closeChargeModal();
      this.showNotification('Cargo registrado correctamente', 'success');
    } catch (error) {
      this.showNotification('Error al registrar el cargo', 'error');
      console.error(error);
    }
  }

  closeChargeModal() {
    const modal = document.getElementById('chargeModal');
    if (modal) {
      modal.remove();
    }
  }

  async generateAccountReport() {
    const modalHtml = `
      <div id="reportModal" class="modal" style="display: block; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5);">
        <div class="modal-dialog" style="position: relative; margin: 5% auto; width: 90%; max-width: 700px;">
          <div class="modal-content" style="background: white; border-radius: 12px; padding: 0; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
            <div class="modal-header" style="padding: 20px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
              <h5 class="modal-title" style="margin: 0; font-weight: 600;">Reporte de Cuentas Corrientes</h5>
              <button type="button" class="close" onclick="cuentaCorrienteManager.closeReportModal()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
            </div>
            <div class="modal-body" style="padding: 20px;">
              <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                <div class="form-group">
                  <label class="form-label" style="font-weight: 600; margin-bottom: 0.5rem; display: block;">Tipo de Reporte</label>
                  <select class="form-control" id="reportType" style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px;">
                    <option value="clientes">Clientes</option>
                    <option value="proveedores">Proveedores</option>
                    <option value="general">General</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label" style="font-weight: 600; margin-bottom: 0.5rem; display: block;">Formato</label>
                  <select class="form-control" id="reportFormat" style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px;">
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                    <option value="csv">CSV</option>
                  </select>
                </div>
              </div>
              <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                <div class="form-group">
                  <label class="form-label" style="font-weight: 600; margin-bottom: 0.5rem; display: block;">Fecha Desde</label>
                  <input type="date" class="form-control" id="reportDateFrom" style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px;">
                </div>
                <div class="form-group">
                  <label class="form-label" style="font-weight: 600; margin-bottom: 0.5rem; display: block;">Fecha Hasta</label>
                  <input type="date" class="form-control" id="reportDateTo" style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px;">
                </div>
              </div>
              <div class="form-group" style="margin-bottom: 1rem;">
                <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
                  <input type="checkbox" id="includeZeroBalances" checked>
                  <span>Incluir cuentas con saldo cero</span>
                </label>
              </div>
            </div>
            <div class="modal-footer" style="padding: 20px; border-top: 1px solid #e5e7eb; display: flex; gap: 0.5rem; justify-content: flex-end;">
              <button type="button" class="btn btn-secondary" onclick="cuentaCorrienteManager.closeReportModal()" style="padding: 0.75rem 1.5rem; border: none; border-radius: 8px; cursor: pointer;">Cancelar</button>
              <button type="button" class="btn btn-primary" onclick="cuentaCorrienteManager.downloadReport()" style="padding: 0.75rem 1.5rem; border: none; border-radius: 8px; cursor: pointer; background: #1e40af; color: white;">
                <i class="fas fa-download"></i> Generar Reporte
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Establecer fechas por defecto
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    
    document.getElementById('reportDateFrom').value = firstDay.toISOString().split('T')[0];
    document.getElementById('reportDateTo').value = today.toISOString().split('T')[0];
  }

  async downloadReport() {
    const reportType = document.getElementById('reportType').value;
    const format = document.getElementById('reportFormat').value;
    const dateFrom = document.getElementById('reportDateFrom').value;
    const dateTo = document.getElementById('reportDateTo').value;
    const includeZero = document.getElementById('includeZeroBalances').checked;

    let data = [];
    let filename = '';

    // Obtener datos según el tipo de reporte
    switch (reportType) {
      case 'clientes':
        data = await this.db.getData('clientes');
        filename = 'reporte_clientes';
        break;
      case 'proveedores':
        data = await this.db.getData('proveedores');
        filename = 'reporte_proveedores';
        break;
      case 'general':
        const clientes = await this.db.getData('clientes');
        const proveedores = await this.db.getData('proveedores');
        data = [
          ...clientes.map(c => ({ ...c, tipo: 'Cliente' })),
          ...proveedores.map(p => ({ ...p, tipo: 'Proveedor', nombre: p.empresa }))
        ];
        filename = 'reporte_general';
        break;
    }

    // Filtrar por saldo cero si es necesario
    if (!includeZero) {
      data = data.filter(item => (item.saldo || 0) !== 0);
    }

    // Generar archivo según formato
    let content, mimeType, extension;

    switch (format) {
      case 'csv':
        content = this.generateReportCSV(data, reportType);
        mimeType = 'text/csv';
        extension = 'csv';
        break;
      case 'excel':
        content = this.generateReportCSV(data, reportType); // Simulamos Excel con CSV
        mimeType = 'application/vnd.ms-excel';
        extension = 'xlsx';
        break;
      case 'pdf':
        content = this.generateReportHTML(data, reportType);
        mimeType = 'text/html';
        extension = 'html';
        break;
    }

    // Descargar archivo
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    this.closeReportModal();
    this.showNotification('Reporte generado correctamente', 'success');
  }

  generateReportCSV(data, type) {
    let headers = [];
    
    if (type === 'clientes') {
      headers = ['ID', 'Nombre', 'Email', 'Teléfono', 'Saldo', 'Estado'];
      return [headers, ...data.map(item => [
        item.id,
        item.nombre,
        item.email,
        item.telefono,
        item.saldo || 0,
        item.estado
      ])].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
    } else if (type === 'proveedores') {
      headers = ['ID', 'Empresa', 'Contacto', 'Email', 'Teléfono', 'Saldo', 'Estado'];
      return [headers, ...data.map(item => [
        item.id,
        item.empresa,
        item.contacto,
        item.email,
        item.telefono,
        item.saldo || 0,
        item.estado
      ])].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
    } else {
      headers = ['Tipo', 'ID', 'Nombre/Empresa', 'Email', 'Teléfono', 'Saldo', 'Estado'];
      return [headers, ...data.map(item => [
        item.tipo,
        item.id,
        item.nombre || item.empresa,
        item.email,
        item.telefono,
        item.saldo || 0,
        item.estado
      ])].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
    }
  }

  generateReportHTML(data, type) {
    const title = type === 'clientes' ? 'Reporte de Clientes' : 
                  type === 'proveedores' ? 'Reporte de Proveedores' : 
                  'Reporte General de Cuentas Corrientes';

    let tableHeaders = '';
    let tableRows = '';

    if (type === 'clientes') {
      tableHeaders = '<th>ID</th><th>Nombre</th><th>Email</th><th>Teléfono</th><th>Saldo</th><th>Estado</th>';
      tableRows = data.map(item => `
        <tr>
          <td>${item.id}</td>
          <td>${item.nombre}</td>
          <td>${item.email}</td>
          <td>${item.telefono}</td>
          <td>$${(item.saldo || 0).toLocaleString('es-AR')}</td>
          <td>${item.estado}</td>
        </tr>
      `).join('');
    } else if (type === 'proveedores') {
      tableHeaders = '<th>ID</th><th>Empresa</th><th>Contacto</th><th>Email</th><th>Teléfono</th><th>Saldo</th><th>Estado</th>';
      tableRows = data.map(item => `
        <tr>
          <td>${item.id}</td>
          <td>${item.empresa}</td>
          <td>${item.contacto}</td>
          <td>${item.email}</td>
          <td>${item.telefono}</td>
          <td>$${(item.saldo || 0).toLocaleString('es-AR')}</td>
          <td>${item.estado}</td>
        </tr>
      `).join('');
    } else {
      tableHeaders = '<th>Tipo</th><th>ID</th><th>Nombre/Empresa</th><th>Email</th><th>Teléfono</th><th>Saldo</th><th>Estado</th>';
      tableRows = data.map(item => `
        <tr>
          <td>${item.tipo}</td>
          <td>${item.id}</td>
          <td>${item.nombre || item.empresa}</td>
          <td>${item.email}</td>
          <td>${item.telefono}</td>
          <td>$${(item.saldo || 0).toLocaleString('es-AR')}</td>
          <td>${item.estado}</td>
        </tr>
      `).join('');
    }

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #1e40af; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { padding: 10px; border: 1px solid #ddd; text-align: left; }
          th { background-color: #f5f5f5; font-weight: bold; }
          .date { color: #666; font-size: 0.9em; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p class="date">Generado el: ${new Date().toLocaleDateString('es-AR')}</p>
        <table>
          <thead>
            <tr>${tableHeaders}</tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </body>
      </html>
    `;
  }

  closeReportModal() {
    const modal = document.getElementById('reportModal');
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
  if (document.querySelector('.admin-main')) {
    window.cuentaCorrienteManager = new CuentaCorrienteManager();
  }
});

// Funciones globales para compatibilidad
window.openPaymentModal = () => window.cuentaCorrienteManager?.openPaymentModal();
window.openChargeModal = () => window.cuentaCorrienteManager?.openChargeModal();
window.generateAccountReport = () => window.cuentaCorrienteManager?.generateAccountReport();