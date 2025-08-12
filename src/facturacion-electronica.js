
class FacturacionElectronica {
  constructor() {
    this.db = window.db;
    this.afip = new AFIPIntegration();
    this.productos = [];
    this.clientes = [];
    this.numeracionActual = {};
    this.init();
  }

  async init() {
    await this.cargarDatos();
    this.setupEventListeners();
    this.configurarFechaActual();
    this.cargarNumeracion();
  }

  async cargarDatos() {
    this.productos = await this.db.getData('productos');
    this.clientes = await this.db.getData('clientes');
    this.proveedores = await this.db.getData('proveedores');
  }

  setupEventListeners() {
    const form = document.getElementById('facturaForm');
    if (form) {
      form.addEventListener('submit', (e) => this.procesarFactura(e));
    }

    // Event listeners para autocompletado
    document.addEventListener('input', (e) => {
      if (e.target.matches('input[placeholder*="Buscar producto"]')) {
        this.buscarProducto(e.target);
      }
    });

    // Event listener para cambio de punto de venta y tipo
    const puntoVenta = document.getElementById('puntoVenta');
    const tipoComprobante = document.getElementById('tipoComprobante');
    
    if (puntoVenta) {
      puntoVenta.addEventListener('change', () => this.actualizarNumeracion());
    }
    
    if (tipoComprobante) {
      tipoComprobante.addEventListener('change', () => this.actualizarNumeracion());
    }
  }

  configurarFechaActual() {
    const fechaInput = document.getElementById('fechaComprobante');
    if (fechaInput) {
      fechaInput.value = new Date().toISOString().split('T')[0];
    }
  }

  async cargarNumeracion() {
    const numeracion = await this.db.getData('numeracion_comprobantes') || [];
    this.numeracionActual = {};
    
    numeracion.forEach(item => {
      const key = `${item.punto_venta}_${item.tipo_comprobante}`;
      this.numeracionActual[key] = item.ultimo_numero;
    });
  }

  async actualizarNumeracion() {
    const puntoVenta = document.getElementById('puntoVenta').value;
    const tipoComprobante = document.getElementById('tipoComprobante').value;
    
    if (puntoVenta && tipoComprobante) {
      const key = `${puntoVenta}_${tipoComprobante}`;
      const ultimoNumero = this.numeracionActual[key] || 0;
      const siguienteNumero = (ultimoNumero + 1).toString().padStart(8, '0');
      
      document.getElementById('numeroComprobante').value = `${puntoVenta}-${siguienteNumero}`;
    }
  }

  async buscarProducto(input) {
    const query = input.value.toLowerCase();
    if (query.length < 2) return;

    const resultados = this.productos.filter(producto => 
      producto.nombre.toLowerCase().includes(query) ||
      producto.sku.toLowerCase().includes(query) ||
      producto.categoria.toLowerCase().includes(query)
    );

    this.mostrarAutocomplete(input, resultados);
  }

  mostrarAutocomplete(input, resultados) {
    const container = input.parentNode;
    let autocomplete = container.querySelector('.autocomplete-results');
    
    if (!autocomplete) {
      autocomplete = document.createElement('div');
      autocomplete.className = 'autocomplete-results';
      container.appendChild(autocomplete);
    }

    if (resultados.length === 0) {
      autocomplete.style.display = 'none';
      return;
    }

    autocomplete.innerHTML = resultados.map(producto => `
      <div class="autocomplete-item" onclick="facturacionElectronica.seleccionarProducto(this, '${producto.id}')">
        <strong>${producto.nombre}</strong><br>
        <small>SKU: ${producto.sku} - $${producto.precio.toLocaleString()}</small>
      </div>
    `).join('');

    autocomplete.style.display = 'block';
  }

  seleccionarProducto(item, productoId) {
    const producto = this.productos.find(p => p.id === productoId);
    if (!producto) return;

    const row = item.closest('tr');
    const inputs = row.querySelectorAll('input, select');
    
    inputs[0].value = producto.nombre; // Nombre del producto
    inputs[2].value = producto.precio; // Precio unitario
    
    // Determinar IVA según el producto
    const ivaSelect = row.querySelector('select');
    if (producto.categoria === 'Alimentos') {
      ivaSelect.value = '10.5';
    } else {
      ivaSelect.value = '21';
    }

    // Ocultar autocomplete
    const autocomplete = item.closest('.autocomplete-results');
    autocomplete.style.display = 'none';

    this.calcularSubtotal(inputs[1]); // Recalcular con cantidad
  }

  calcularSubtotal(element) {
    const row = element.closest('tr');
    const inputs = row.querySelectorAll('input');
    const select = row.querySelector('select');
    
    const cantidad = parseFloat(inputs[1].value) || 0;
    const precio = parseFloat(inputs[2].value) || 0;
    const ivaPercent = parseFloat(select.value) || 0;
    
    const subtotal = cantidad * precio;
    const iva = subtotal * (ivaPercent / 100);
    const total = subtotal + iva;
    
    row.querySelector('.subtotal').textContent = `$${total.toLocaleString('es-AR', {minimumFractionDigits: 2})}`;
    
    this.calcularTotales();
  }

  calcularTotales() {
    let subtotalTotal = 0;
    let iva105Total = 0;
    let iva21Total = 0;
    let iva27Total = 0;

    const rows = document.querySelectorAll('#productosTableBody tr');
    rows.forEach(row => {
      const inputs = row.querySelectorAll('input');
      const select = row.querySelector('select');
      
      const cantidad = parseFloat(inputs[1].value) || 0;
      const precio = parseFloat(inputs[2].value) || 0;
      const ivaPercent = parseFloat(select.value) || 0;
      
      const subtotal = cantidad * precio;
      const iva = subtotal * (ivaPercent / 100);
      
      subtotalTotal += subtotal;
      
      if (ivaPercent === 10.5) iva105Total += iva;
      else if (ivaPercent === 21) iva21Total += iva;
      else if (ivaPercent === 27) iva27Total += iva;
    });

    const total = subtotalTotal + iva105Total + iva21Total + iva27Total;

    document.getElementById('subtotalFactura').textContent = `$${subtotalTotal.toLocaleString('es-AR', {minimumFractionDigits: 2})}`;
    document.getElementById('iva105').textContent = `$${iva105Total.toLocaleString('es-AR', {minimumFractionDigits: 2})}`;
    document.getElementById('iva21').textContent = `$${iva21Total.toLocaleString('es-AR', {minimumFractionDigits: 2})}`;
    document.getElementById('iva27').textContent = `$${iva27Total.toLocaleString('es-AR', {minimumFractionDigits: 2})}`;
    document.getElementById('totalFactura').textContent = `$${total.toLocaleString('es-AR', {minimumFractionDigits: 2})}`;
  }

  agregarLineaProducto() {
    const tbody = document.getElementById('productosTableBody');
    const newRow = document.createElement('tr');
    
    newRow.innerHTML = `
      <td>
        <input type="text" class="form-control" placeholder="Buscar producto..." onkeyup="facturacionElectronica.buscarProducto(this)">
        <div class="autocomplete-results" style="display: none;"></div>
      </td>
      <td><input type="number" class="form-control" value="1" min="1" onchange="facturacionElectronica.calcularSubtotal(this)"></td>
      <td><input type="number" class="form-control" step="0.01" onchange="facturacionElectronica.calcularSubtotal(this)"></td>
      <td>
        <select class="form-control" onchange="facturacionElectronica.calcularSubtotal(this)">
          <option value="0">0%</option>
          <option value="10.5">10.5%</option>
          <option value="21" selected>21%</option>
          <option value="27">27%</option>
        </select>
      </td>
      <td><span class="subtotal">$0.00</span></td>
      <td>
        <button type="button" class="btn btn-sm btn-danger" onclick="facturacionElectronica.eliminarLinea(this)">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;
    
    tbody.appendChild(newRow);
  }

  eliminarLinea(button) {
    const row = button.closest('tr');
    row.remove();
    this.calcularTotales();
  }

  async validarCUIT() {
    const cuitInput = document.getElementById('clienteCuit');
    const cuit = cuitInput.value.replace(/[-_]/g, '');
    
    if (cuit.length === 11) {
      try {
        const datosCliente = await this.afip.consultarContribuyente(cuit);
        if (datosCliente) {
          document.getElementById('clienteNombre').value = datosCliente.razonSocial;
          document.getElementById('clienteCondicionIVA').value = datosCliente.condicionIVA;
          document.getElementById('clienteDomicilio').value = datosCliente.domicilio;
          
          this.mostrarNotificacion('success', 'Datos del cliente cargados desde AFIP');
        }
      } catch (error) {
        this.mostrarNotificacion('warning', 'No se pudieron obtener datos de AFIP');
      }
    }
  }

  async procesarFactura(event) {
    event.preventDefault();
    
    try {
      // Validar formulario
      if (!this.validarFormulario()) return;
      
      // Crear objeto factura
      const factura = this.construirFactura();
      
      // Mostrar loading
      this.mostrarLoading(true);
      
      // Obtener CAE de AFIP
      const responseAFIP = await this.afip.obtenerCAE(factura);
      
      if (responseAFIP.success) {
        factura.cae = responseAFIP.cae;
        factura.fechaVencimientoCAE = responseAFIP.fechaVencimiento;
        factura.estado = 'autorizado';
        
        // Guardar en base de datos
        await this.guardarFactura(factura);
        
        // Actualizar numeración
        await this.actualizarNumeracionDB(factura);
        
        // Generar PDF
        await this.generarPDF(factura);
        
        // Enviar email si corresponde
        if (factura.cliente.email) {
          await this.enviarEmailCliente(factura);
        }
        
        this.mostrarNotificacion('success', `Factura autorizada. CAE: ${responseAFIP.cae}`);
        this.limpiarFormulario();
        
      } else {
        this.mostrarNotificacion('error', `Error AFIP: ${responseAFIP.error}`);
      }
      
    } catch (error) {
      this.mostrarNotificacion('error', `Error al procesar factura: ${error.message}`);
    } finally {
      this.mostrarLoading(false);
    }
  }

  validarFormulario() {
    const required = ['puntoVenta', 'tipoComprobante', 'clienteCuit', 'clienteNombre', 'clienteCondicionIVA'];
    
    for (const field of required) {
      const element = document.getElementById(field);
      if (!element.value.trim()) {
        this.mostrarNotificacion('error', `El campo ${field} es obligatorio`);
        element.focus();
        return false;
      }
    }
    
    // Validar que haya al menos un producto
    const productos = this.obtenerProductosFormulario();
    if (productos.length === 0) {
      this.mostrarNotificacion('error', 'Debe agregar al menos un producto');
      return false;
    }
    
    return true;
  }

  construirFactura() {
    const productos = this.obtenerProductosFormulario();
    const totales = this.calcularTotalesFactura(productos);
    
    return {
      id: this.generateId(),
      fecha: document.getElementById('fechaComprobante').value,
      puntoVenta: document.getElementById('puntoVenta').value,
      tipoComprobante: document.getElementById('tipoComprobante').value,
      numero: document.getElementById('numeroComprobante').value,
      cliente: {
        cuit: document.getElementById('clienteCuit').value,
        nombre: document.getElementById('clienteNombre').value,
        condicionIVA: document.getElementById('clienteCondicionIVA').value,
        domicilio: document.getElementById('clienteDomicilio').value,
        email: document.getElementById('clienteEmail').value,
        telefono: document.getElementById('clienteTelefono').value
      },
      productos,
      totales,
      observaciones: document.getElementById('observaciones').value,
      usuario: 'Juan Pérez', // Obtener del sistema de usuarios
      fechaCreacion: new Date().toISOString(),
      estado: 'pendiente'
    };
  }

  obtenerProductosFormulario() {
    const productos = [];
    const rows = document.querySelectorAll('#productosTableBody tr');
    
    rows.forEach(row => {
      const inputs = row.querySelectorAll('input');
      const select = row.querySelector('select');
      
      const nombre = inputs[0].value.trim();
      const cantidad = parseFloat(inputs[1].value) || 0;
      const precio = parseFloat(inputs[2].value) || 0;
      const ivaPercent = parseFloat(select.value) || 0;
      
      if (nombre && cantidad > 0 && precio > 0) {
        productos.push({
          nombre,
          cantidad,
          precio,
          ivaPercent,
          subtotal: cantidad * precio,
          iva: (cantidad * precio) * (ivaPercent / 100)
        });
      }
    });
    
    return productos;
  }

  calcularTotalesFactura(productos) {
    const totales = {
      subtotal: 0,
      iva105: 0,
      iva21: 0,
      iva27: 0,
      total: 0
    };
    
    productos.forEach(producto => {
      totales.subtotal += producto.subtotal;
      
      if (producto.ivaPercent === 10.5) totales.iva105 += producto.iva;
      else if (producto.ivaPercent === 21) totales.iva21 += producto.iva;
      else if (producto.ivaPercent === 27) totales.iva27 += producto.iva;
    });
    
    totales.total = totales.subtotal + totales.iva105 + totales.iva21 + totales.iva27;
    
    return totales;
  }

  async guardarFactura(factura) {
    return await this.db.addRecord('facturas', factura);
  }

  async actualizarNumeracionDB(factura) {
    const key = `${factura.puntoVenta}_${factura.tipoComprobante}`;
    const numeroActual = parseInt(factura.numero.split('-')[1]);
    
    this.numeracionActual[key] = numeroActual;
    
    // Guardar en base de datos
    const numeracion = await this.db.getData('numeracion_comprobantes') || [];
    const index = numeracion.findIndex(item => 
      item.punto_venta === factura.puntoVenta && 
      item.tipo_comprobante === factura.tipoComprobante
    );
    
    const registro = {
      punto_venta: factura.puntoVenta,
      tipo_comprobante: factura.tipoComprobante,
      ultimo_numero: numeroActual
    };
    
    if (index !== -1) {
      numeracion[index] = registro;
    } else {
      numeracion.push(registro);
    }
    
    await this.db.saveData('numeracion_comprobantes', numeracion);
  }

  async generarPDF(factura) {
    // Implementar generación de PDF con jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Aquí iría la lógica completa de generación del PDF
    // con todos los datos legales requeridos
    
    doc.save(`Factura_${factura.numero}.pdf`);
  }

  async enviarEmailCliente(factura) {
    // Implementar envío de email
    console.log(`Enviando factura por email a ${factura.cliente.email}`);
  }

  limpiarFormulario() {
    document.getElementById('facturaForm').reset();
    document.getElementById('productosTableBody').innerHTML = this.getInitialProductRow();
    this.configurarFechaActual();
    this.calcularTotales();
  }

  getInitialProductRow() {
    return `
      <tr>
        <td>
          <input type="text" class="form-control" placeholder="Buscar producto..." onkeyup="facturacionElectronica.buscarProducto(this)">
          <div class="autocomplete-results" style="display: none;"></div>
        </td>
        <td><input type="number" class="form-control" value="1" min="1" onchange="facturacionElectronica.calcularSubtotal(this)"></td>
        <td><input type="number" class="form-control" step="0.01" onchange="facturacionElectronica.calcularSubtotal(this)"></td>
        <td>
          <select class="form-control" onchange="facturacionElectronica.calcularSubtotal(this)">
            <option value="0">0%</option>
            <option value="10.5">10.5%</option>
            <option value="21" selected>21%</option>
            <option value="27">27%</option>
          </select>
        </td>
        <td><span class="subtotal">$0.00</span></td>
        <td>
          <button type="button" class="btn btn-sm btn-danger" onclick="facturacionElectronica.eliminarLinea(this)">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }

  mostrarLoading(show) {
    // Implementar overlay de loading
    const overlay = document.getElementById('loadingOverlay') || this.createLoadingOverlay();
    overlay.style.display = show ? 'flex' : 'none';
  }

  createLoadingOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'loadingOverlay';
    overlay.innerHTML = `
      <div class="loading-content">
        <i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 1rem;"></i>
        <p>Procesando factura con AFIP...</p>
      </div>
    `;
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
      background: rgba(0,0,0,0.7); display: none; align-items: center; 
      justify-content: center; z-index: 9999; color: white; text-align: center;
    `;
    document.body.appendChild(overlay);
    return overlay;
  }

  mostrarNotificacion(tipo, mensaje) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${tipo}`;
    notification.style.cssText = `
      position: fixed; top: 20px; right: 20px; padding: 1rem; border-radius: 8px;
      color: white; z-index: 10000; min-width: 300px; animation: slideIn 0.3s ease;
    `;
    
    const colors = {
      success: '#10b981',
      error: '#ef4444',
      warning: '#f59e0b',
      info: '#3b82f6'
    };
    
    notification.style.backgroundColor = colors[tipo] || colors.info;
    notification.textContent = mensaje;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  }

  generateId() {
    return 'FAC' + Date.now().toString().slice(-8);
  }
}

// Funciones globales para compatibilidad con HTML
window.buscarProducto = (input) => window.facturacionElectronica?.buscarProducto(input);
window.calcularSubtotal = (element) => window.facturacionElectronica?.calcularSubtotal(element);
window.agregarLineaProducto = () => window.facturacionElectronica?.agregarLineaProducto();
window.eliminarLinea = (button) => window.facturacionElectronica?.eliminarLinea(button);
window.validarCUIT = () => window.facturacionElectronica?.validarCUIT();
window.limpiarFormulario = () => window.facturacionElectronica?.limpiarFormulario();
window.previsualizarFactura = () => console.log('Previsualizar factura');

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('facturaForm')) {
    window.facturacionElectronica = new FacturacionElectronica();
  }
});