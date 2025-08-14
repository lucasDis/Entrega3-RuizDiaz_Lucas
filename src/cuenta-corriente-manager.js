// Correcciones para cuenta-corriente-manager.js
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
    // Event listeners para modales - corregidos
    document.addEventListener("click", (e) => {
      // Usar getAttribute en lugar de closest con onclick
      const target = e.target.closest("button, .admin-card");
      if (target) {
        if (
          target.getAttribute("onclick")?.includes("openPaymentModal") ||
          target.textContent.includes("Registrar Pago")
        ) {
          e.preventDefault();
          this.openPaymentModal();
        }
        if (
          target.getAttribute("onclick")?.includes("openChargeModal") ||
          target.textContent.includes("Registrar Cargo")
        ) {
          e.preventDefault();
          this.openChargeModal();
        }
        if (
          target.getAttribute("onclick")?.includes("generateAccountReport") ||
          target.textContent.includes("Reporte de Cuentas")
        ) {
          e.preventDefault();
          this.generateAccountReport();
        }
      }
    });
  }

  async loadData() {
    try {
      // Cargar datos para los dropdowns
      this.clientes = await this.db.getData("clientes");
      this.proveedores = await this.db.getData("proveedores");
    } catch (error) {
      console.error("Error cargando datos:", error);
      this.clientes = [];
      this.proveedores = [];
    }
  }

  openPaymentModal() {
    // Cerrar modal existente si hay uno
    this.closePaymentModal();

    const modalHtml = `
      <div id="paymentModal" class="modal" style="display: block; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5);">
        <div class="modal-dialog" style="position: relative; margin: 5% auto; width: 90%; max-width: 600px;">
          <div class="modal-content" style="background: white; border-radius: 12px; padding: 0; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
            <div class="modal-header" style="padding: 20px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
              <h5 class="modal-title" style="margin: 0; font-weight: 600; color: #111827;">Registrar Pago</h5>
              <button type="button" class="close" onclick="window.cuentaCorrienteManager.closePaymentModal()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #6b7280;">&times;</button>
            </div>
            <div class="modal-body" style="padding: 20px;">
              <form id="paymentForm">
                <div class="form-group" style="margin-bottom: 1rem;">
                  <label class="form-label" style="font-weight: 600; margin-bottom: 0.5rem; display: block; color: #374151;">Tipo</label>
                  <select class="form-control" id="paymentType" onchange="window.cuentaCorrienteManager.updatePaymentForm()" style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px; background: white;">
                    <option value="client">Pago de Cliente</option>
                    <option value="supplier">Pago a Proveedor</option>
                  </select>
                </div>
                <div class="form-group" style="margin-bottom: 1rem;">
                  <label class="form-label" id="paymentEntityLabel" style="font-weight: 600; margin-bottom: 0.5rem; display: block; color: #374151;">Cliente</label>
                  <select class="form-control" id="paymentEntity" required style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px; background: white;">
                    <option value="">Seleccionar cliente</option>
                    ${this.clientes
                      .map(
                        (c) => `<option value="${c.id}">${c.nombre}</option>`
                      )
                      .join("")}
                  </select>
                </div>
                <div class="form-group" style="margin-bottom: 1rem;">
                  <label class="form-label" style="font-weight: 600; margin-bottom: 0.5rem; display: block; color: #374151;">Monto</label>
                  <input type="number" class="form-control" id="paymentAmount" min="0" step="0.01" required style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px;">
                </div>
                <div class="form-group" style="margin-bottom: 1rem;">
                  <label class="form-label" style="font-weight: 600; margin-bottom: 0.5rem; display: block; color: #374151;">Método de Pago</label>
                  <select class="form-control" id="paymentMethod" required style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px; background: white;">
                    <option value="">Seleccionar método</option>
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="cheque">Cheque</option>
                    <option value="tarjeta">Tarjeta</option>
                  </select>
                </div>
                <div class="form-group" style="margin-bottom: 1rem;">
                  <label class="form-label" style="font-weight: 600; margin-bottom: 0.5rem; display: block; color: #374151;">Concepto</label>
                  <textarea class="form-control" id="paymentConcept" rows="3" style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px; resize: vertical;"></textarea>
                </div>
              </form>
            </div>
            <div class="modal-footer" style="padding: 20px; border-top: 1px solid #e5e7eb; display: flex; gap: 0.5rem; justify-content: flex-end;">
              <button type="button" class="btn btn-secondary" onclick="window.cuentaCorrienteManager.closePaymentModal()" style="padding: 0.75rem 1.5rem; border: none; border-radius: 8px; cursor: pointer; background: #6b7280; color: white;">Cancelar</button>
              <button type="button" class="btn btn-success" onclick="window.cuentaCorrienteManager.savePayment()" style="padding: 0.75rem 1.5rem; border: none; border-radius: 8px; cursor: pointer; background: #059669; color: white;">
                <i class="fas fa-save"></i> Registrar Pago
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHtml);
  }

  updatePaymentForm() {
    const paymentType = document.getElementById("paymentType")?.value;
    const entityLabel = document.getElementById("paymentEntityLabel");
    const entitySelect = document.getElementById("paymentEntity");

    if (!paymentType || !entityLabel || !entitySelect) return;

    if (paymentType === "client") {
      entityLabel.textContent = "Cliente";
      entitySelect.innerHTML = `
        <option value="">Seleccionar cliente</option>
        ${this.clientes
          .map((c) => `<option value="${c.id}">${c.nombre}</option>`)
          .join("")}
      `;
    } else {
      entityLabel.textContent = "Proveedor";
      entitySelect.innerHTML = `
        <option value="">Seleccionar proveedor</option>
        ${this.proveedores
          .map((p) => `<option value="${p.id}">${p.empresa}</option>`)
          .join("")}
      `;
    }
  }

  async savePayment() {
    const form = document.getElementById("paymentForm");
    if (!form || !form.checkValidity()) {
      form?.reportValidity();
      return;
    }

    const paymentData = {
      tipo: document.getElementById("paymentType")?.value,
      entidadId: document.getElementById("paymentEntity")?.value,
      monto: parseFloat(document.getElementById("paymentAmount")?.value || 0),
      metodo: document.getElementById("paymentMethod")?.value,
      concepto: document.getElementById("paymentConcept")?.value,
      fecha: new Date().toISOString().split("T")[0],
      hora: new Date().toLocaleTimeString("es-AR"),
    };

    try {
      await this.db.addRecord("pagos", paymentData);
      this.closePaymentModal();
      this.showNotification("Pago registrado correctamente", "success");

      // Recargar la página para mostrar cambios
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      this.showNotification("Error al registrar el pago", "error");
      console.error(error);
    }
  }

  closePaymentModal() {
    const modal = document.getElementById("paymentModal");
    if (modal) {
      modal.remove();
    }
  }

  openChargeModal() {
    // Cerrar modal existente si hay uno
    this.closeChargeModal();

    const modalHtml = `
      <div id="chargeModal" class="modal" style="display: block; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.5);">
        <div class="modal-dialog" style="position: relative; margin: 5% auto; width: 90%; max-width: 600px;">
          <div class="modal-content" style="background: white; border-radius: 12px; padding: 0; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
            <div class="modal-header" style="padding: 20px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center;">
              <h5 class="modal-title" style="margin: 0; font-weight: 600; color: #111827;">Registrar Cargo</h5>
              <button type="button" class="close" onclick="window.cuentaCorrienteManager.closeChargeModal()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #6b7280;">&times;</button>
            </div>
            <div class="modal-body" style="padding: 20px;">
              <form id="chargeForm">
                <div class="form-group" style="margin-bottom: 1rem;">
                  <label class="form-label" style="font-weight: 600; margin-bottom: 0.5rem; display: block; color: #374151;">Cliente</label>
                  <select class="form-control" id="chargeClient" required style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px; background: white;">
                    <option value="">Seleccionar cliente</option>
                    ${this.clientes
                      .map(
                        (c) => `<option value="${c.id}">${c.nombre}</option>`
                      )
                      .join("")}
                  </select>
                </div>
                <div class="form-group" style="margin-bottom: 1rem;">
                  <label class="form-label" style="font-weight: 600; margin-bottom: 0.5rem; display: block; color: #374151;">Monto</label>
                  <input type="number" class="form-control" id="chargeAmount" min="0" step="0.01" required style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px;">
                </div>
                <div class="form-group" style="margin-bottom: 1rem;">
                  <label class="form-label" style="font-weight: 600; margin-bottom: 0.5rem; display: block; color: #374151;">Concepto</label>
                  <textarea class="form-control" id="chargeConcept" rows="3" required style="width: 100%; padding: 0.75rem; border: 2px solid #e5e7eb; border-radius: 8px; resize: vertical;"></textarea>
                </div>
              </form>
            </div>
            <div class="modal-footer" style="padding: 20px; border-top: 1px solid #e5e7eb; display: flex; gap: 0.5rem; justify-content: flex-end;">
              <button type="button" class="btn btn-secondary" onclick="window.cuentaCorrienteManager.closeChargeModal()" style="padding: 0.75rem 1.5rem; border: none; border-radius: 8px; cursor: pointer; background: #6b7280; color: white;">Cancelar</button>
              <button type="button" class="btn btn-primary" onclick="window.cuentaCorrienteManager.saveCharge()" style="padding: 0.75rem 1.5rem; border: none; border-radius: 8px; cursor: pointer; background: #1e40af; color: white;">
                <i class="fas fa-save"></i> Registrar Cargo
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHtml);
  }

  async saveCharge() {
    const form = document.getElementById("chargeForm");
    if (!form || !form.checkValidity()) {
      form?.reportValidity();
      return;
    }

    const chargeData = {
      clienteId: document.getElementById("chargeClient")?.value,
      monto: parseFloat(document.getElementById("chargeAmount")?.value || 0),
      concepto: document.getElementById("chargeConcept")?.value,
      fecha: new Date().toISOString().split("T")[0],
      hora: new Date().toLocaleTimeString("es-AR"),
    };

    try {
      await this.db.addRecord("cargos", chargeData);
      this.closeChargeModal();
      this.showNotification("Cargo registrado correctamente", "success");

      // Recargar la página para mostrar cambios
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      this.showNotification("Error al registrar el cargo", "error");
      console.error(error);
    }
  }

  closeChargeModal() {
    const modal = document.getElementById("chargeModal");
    if (modal) {
      modal.remove();
    }
  }

  async generateAccountReport() {
    // Implementar lógica del reporte
    this.showNotification("Función de reportes en desarrollo", "info");
  }

  showNotification(message, type = "info") {
    const notification = document.createElement("div");
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
      success: "#059669",
      error: "#dc2626",
      info: "#1e40af",
      warning: "#d97706",
    };

    notification.style.backgroundColor = colors[type] || colors.info;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }, 3000);
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector(".admin-main")) {
    window.cuentaCorrienteManager = new CuentaCorrienteManager();
  }
});

// Funciones globales para compatibilidad
window.openPaymentModal = () =>
  window.cuentaCorrienteManager?.openPaymentModal();
window.openChargeModal = () => window.cuentaCorrienteManager?.openChargeModal();
window.generateAccountReport = () =>
  window.cuentaCorrienteManager?.generateAccountReport();
