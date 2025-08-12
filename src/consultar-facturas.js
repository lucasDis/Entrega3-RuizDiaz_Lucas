
class ConsultarFacturas {
    constructor() {
      this.db = window.db;
      this.afip = new AFIPIntegration();
      this.facturas = [];
      this.init();
    }
  
    async init() {
      await this.cargarFacturas();
      this.setupEventListeners();
      this.configurarFechasDefecto();
    }
  
    async cargarFacturas() {
      this.facturas = await this.db.getData('facturas') || [];
      this.renderizarTabla();
    }
  
    setupEventListeners() {
      // Event listeners para botones
      document.addEventListener('click', (e) => {
        if (e.target.closest('[onclick*="consultarComprobante"]')) {
          e.preventDefault();
          this.consultarComprobante();
        }
        if (e.target.closest('[onclick*="filtrarFacturas"]')) {
          e.preventDefault();
          this.filtrarFacturas();
        }
        if (e.target.closest('[onclick*="exportarFacturas"]')) {
          e.preventDefault();
          this.exportarFacturas();
        }
      });
    }
  
    configurarFechasDefecto() {
      const hoy = new Date().toISOString().split('T')[0];
      const hace30Dias = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const fechaDesde = document.getElementById('fechaDesde');
      const fechaHasta = document.getElementById('fechaHasta');
      
      if (fechaDesde) fechaDesde.value = hace30Dias;
      if (fechaHasta) fechaHasta.value = hoy;
    }
  
    async consultarComprobante() {
      const puntoVenta = document.getElementById('consultaPuntoVenta').value;
      const tipo = document.getElementById('consultaTipo').value;
      const numero = document.getElementById('consultaNumero').value;
      const cae = document.getElementById('consultaCAE').value;
  
      if (!puntoVenta && !tipo && !numero && !cae) {
        this.mostrarNotificacion('warning', 'Debe completar al menos un campo de búsqueda');
        return;
      }
  
      try {
        this.mostrarLoading(true);
        
        let resultado;
        
        if (cae) {
          // Buscar por CAE
          resultado = await this.buscarPorCAE(cae);
        } else if (puntoVenta && tipo && numero) {
          // Consultar en AFIP
          resultado = await this.afip.consultarComprobante(puntoVenta, tipo, numero);
        } else {
          // Buscar en base local
          resultado = await this.buscarEnBaseLocal(puntoVenta, tipo, numero);
        }
  
        this.mostrarResultadoConsulta(resultado);
        
      } catch (error) {
        this.mostrarNotificacion('error', 'Error en la consulta: ' + error.message);
      } finally {
        this.mostrarLoading(false);
      }
    }
  
    async buscarPorCAE(cae) {
      const factura = this.facturas.find(f => f.cae === cae);
      
      if (factura) {
        return {
          success: true,
          estado: factura.estado,
          factura: factura,
          origen: 'local'
        };
      } else {
        return {
          success: false,
          error: 'CAE no encontrado en registros locales'
        };
      }
    }
  
    async buscarEnBaseLocal(puntoVenta, tipo, numero) {
      const numeroCompleto = puntoVenta && numero ? `${puntoVenta}-${numero.padStart(8, '0')}` : null;
      
      const factura = this.facturas.find(f => {
        let coincide = true;
        
        if (puntoVenta && f.puntoVenta !== puntoVenta) coincide = false;
        if (tipo && f.tipoComprobante !== tipo) coincide = false;
        if (numeroCompleto && f.numero !== numeroCompleto) coincide = false;
        
        return coincide;
      });
  
      if (factura) {
        return {
          success: true,
          estado: factura.estado,
          factura: factura,
          origen: 'local'
        };
      } else {
        return {
          success: false,
          error: 'Comprobante no encontrado'
        };
      }
    }
  
    mostrarResultadoConsulta(resultado) {
      const container = document.getElementById('resultadoConsulta');
      const estadoDiv = document.getElementById('estadoComprobante');
      
      if (resultado.success) {
        const factura = resultado.factura;
        const estadoTexto = this.getEstadoTexto(resultado.estado);
        const estadoClass = this.getEstadoClass(resultado.estado);
        
        estadoDiv.innerHTML = `
          <div class="row">
            <div class="col-md-6">
              <h5>Estado del Comprobante</h5>
              <span class="badge ${estadoClass}">${estadoTexto}</span>
              ${factura.cae ? `<p class="mt-2"><strong>CAE:</strong> ${factura.cae}</p>` : ''}
              ${factura.fechaVencimientoCAE ? `<p><strong>Vence:</strong> ${factura.fechaVencimientoCAE}</p>` : ''}
            </div>
            <div class="col-md-6">
              <h5>Datos del Comprobante</h5>
              <p><strong>Número:</strong> ${factura.numero}</p>
              <p><strong>Fecha:</strong> ${factura.fecha}</p>
              <p><strong>Cliente:</strong> ${factura.cliente.nombre}</p>
              <p><strong>Total:</strong> $${factura.totales.total.toLocaleString('es-AR', {minimumFractionDigits: 2})}</p>
            </div>
          </div>
          <div class="mt-3">
            <button class="btn btn-primary btn-sm" onclick="consultarFacturas.verDetalle('${factura.id}')">
              <i class="fas fa-eye"></i> Ver Detalle Completo
            </button>
            <button class="btn btn-success btn-sm" onclick="consultarFacturas.descargarPDF('${factura.id}')">
              <i class="fas fa-file-pdf"></i> Descargar PDF
            </button>
          </div>
        `;
      } else {
        estadoDiv.innerHTML = `
          <div class="alert alert-danger">
            <i class="fas fa-exclamation-triangle"></i>
            ${resultado.error}
          </div>
        `;
      }
      
      container.style.display = 'block';
    }
  
    getEstadoTexto(estado) {
      const estados = {
        'autorizado': 'Autorizado',
        'pendiente': 'Pendiente de CAE',
        'rechazado': 'Rechazado por AFIP',
        'anulado': 'Anulado'
      };
      return estados[estado] || estado;
    }
  
    getEstadoClass(estado) {
      const classes = {
        'autorizado': 'badge-success',
        'pendiente': 'badge-warning',
        'rechazado': 'badge-danger',
        'anulado': 'badge-secondary'
      };
      return classes[estado] || 'badge-secondary';
    }
  
    async filtrarFacturas() {
      const fechaDesde = document.getElementById('fechaDesde').value;
      const fechaHasta = document.getElementById('fechaHasta').value;
      const cliente = document.getElementById('filtroCliente').value.toLowerCase();
      const estado = document.getElementById('filtroEstado').value;
  
      let facturasFiltradas = [...this.facturas];
  
      if (fechaDesde) {
        facturasFiltradas = facturasFiltradas.filter(f => f.fecha >= fechaDesde);
      }
  
      if (fechaHasta) {
        facturasFiltradas = facturasFiltradas.filter(f => f.fecha <= fechaHasta);
      }
  
      if (cliente) {
        facturasFiltradas = facturasFiltradas.filter(f => 
          f.cliente.nombre.toLowerCase().includes(cliente) ||
          f.cliente.cuit.includes(cliente)
        );
      }
  
      if (estado) {
        facturasFiltradas = facturasFiltradas.filter(f => f.estado === estado);
      }
  
      this.renderizarTabla(facturasFiltradas);
    }
  
    renderizarTabla(facturas = this.facturas) {
      const tbody = document.getElementById('facturasTableBody');
      if (!tbody) return;
  
      if (facturas.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="9" class="text-center">No se encontraron facturas</td>
          </tr>
        `;
        return;
      }
  
      tbody.innerHTML = facturas.map(factura => `
        <tr>
          <td>${this.formatearFecha(factura.fecha)}</td>
          <td>${this.getTipoComprobanteTexto(factura.tipoComprobante)}</td>
          <td>${factura.numero}</td>
          <td>${factura.cliente.nombre}</td>
          <td>$${factura.totales.total.toLocaleString('es-AR', {minimumFractionDigits: 2})}</td>
          <td>${factura.cae || '-'}</td>
          <td><span class="badge ${this.getEstadoClass(factura.estado)}">${this.getEstadoTexto(factura.estado)}</span></td>
          <td>${factura.usuario}</td>
          <td class="actions">
            <button class="btn btn-sm btn-primary" onclick="consultarFacturas.verDetalle('${factura.id}')" title="Ver detalle">
              <i class="fas fa-eye"></i>
            </button>
            <button class="btn btn-sm btn-success" onclick="consultarFacturas.descargarPDF('${factura.id}')" title="Descargar PDF">
              <i class="fas fa-file-pdf"></i>
            </button>
            <button class="btn btn-sm btn-warning" onclick="consultarFacturas.enviarEmail('${factura.id}')" title="Enviar por email">
              <i class="fas fa-envelope"></i>
            </button>
            ${factura.tipoComprobante.startsWith('8') ? `
              <button class="btn btn-sm btn-secondary" onclick="consultarFacturas.imprimirFiscal('${factura.id}')" title="Reimprimir fiscal">
                <i class="fas fa-print"></i>
              </button>
            ` : ''}
            ${factura.estado === 'autorizado' ? `
              <button class="btn btn-sm btn-danger" onclick="consultarFacturas.anularFactura('${factura.id}')" title="Anular">
                <i class="fas fa-ban"></i>
              </button>
            ` : ''}
            ${factura.estado === 'pendiente' ? `
              <button class="btn btn-sm btn-warning" onclick="consultarFacturas.reintentarCAE('${factura.id}')" title="Reintentar CAE">
                <i class="fas fa-redo"></i>
              </button>
            ` : ''}
          </td>
        </tr>
      `).join('');
    }
  
    formatearFecha(fecha) {
      return new Date(fecha).toLocaleDateString('es-AR');
    }
  
    getTipoComprobanteTexto(tipo) {
      const tipos = {
        '01': 'Factura A',
        '06': 'Factura B',
        '11': 'Factura C',
        '81': 'Ticket Fiscal A',
        '82': 'Ticket Fiscal B',
        '83': 'Ticket Fiscal C',
        '03': 'Nota Crédito A',
        '08': 'Nota Crédito B',
        '13': 'Nota Crédito C'
      };
      return tipos[tipo] || tipo;
    }
  
    async verDetalle(facturaId) {
      const factura = this.facturas.find(f => f.id === facturaId);
      if (!factura) return;
  
      // Crear modal con detalle completo
      const modalHtml = `
        <div id="detalleFacturaModal" class="modal" style="display: block;">
          <div class="modal-dialog modal-lg">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Detalle de Factura ${factura.numero}</h5>
                <button type="button" class="close" onclick="consultarFacturas.cerrarModal()">&times;</button>
              </div>
              <div class="modal-body">
                <div class="row">
                  <div class="col-md-6">
                    <h6>Datos del Comprobante</h6>
                    <p><strong>Tipo:</strong> ${this.getTipoComprobanteTexto(factura.tipoComprobante)}</p>
                    <p><strong>Número:</strong> ${factura.numero}</p>
                    <p><strong>Fecha:</strong> ${this.formatearFecha(factura.fecha)}</p>
                    <p><strong>Estado:</strong> <span class="badge ${this.getEstadoClass(factura.estado)}">${this.getEstadoTexto(factura.estado)}</span></p>
                    ${factura.cae ? `<p><strong>CAE:</strong> ${factura.cae}</p>` : ''}
                    <p><strong>Usuario:</strong> ${factura.usuario}</p>
                  </div>
                  <div class="col-md-6">
                    <h6>Datos del Cliente</h6>
                    <p><strong>CUIT:</strong> ${factura.cliente.cuit}</p>
                    <p><strong>Nombre:</strong> ${factura.cliente.nombre}</p>
                    <p><strong>Domicilio:</strong> ${factura.cliente.domicilio}</p>
                    ${factura.cliente.email ? `<p><strong>Email:</strong> ${factura.cliente.email}</p>` : ''}
                  </div>
                </div>
                
                <h6>Productos/Servicios</h6>
                <table class="table table-sm">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Precio Unit.</th>
                      <th>% IVA</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${factura.productos.map(prod => `
                      <tr>
                        <td>${prod.nombre}</td>
                        <td>${prod.cantidad}</td>
                        <td>$${prod.precio.toLocaleString('es-AR', {minimumFractionDigits: 2})}</td>
                        <td>${prod.ivaPercent}%</td>
                        <td>$${(prod.subtotal + prod.iva).toLocaleString('es-AR', {minimumFractionDigits: 2})}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
                
                <div class="row">
                  <div class="col-md-6 offset-md-6">
                    <table class="table table-sm">
                      <tr><td>Subtotal:</td><td>$${factura.totales.subtotal.toLocaleString('es-AR', {minimumFractionDigits: 2})}</td></tr>
                      <tr><td>IVA 10.5%:</td><td>$${factura.totales.iva105.toLocaleString('es-AR', {minimumFractionDigits: 2})}</td></tr>
                      <tr><td>IVA 21%:</td><td>$${factura.totales.iva21.toLocaleString('es-AR', {minimumFractionDigits: 2})}</td></tr>
                      <tr><td>IVA 27%:</td><td>$${factura.totales.iva27.toLocaleString('es-AR', {minimumFractionDigits: 2})}</td></tr>
                      <tr class="table-active"><td><strong>TOTAL:</strong></td><td><strong>$${factura.totales.total.toLocaleString('es-AR', {minimumFractionDigits: 2})}</strong></td></tr>
                    </table>
                  </div>
                </div>
                
                ${factura.observaciones ? `<p><strong>Observaciones:</strong> ${factura.observaciones}</p>` : ''}
              </div>
              <div class="modal-footer">
                <button class="btn btn-success" onclick="consultarFacturas.descargarPDF('${factura.id}')">
                  <i class="fas fa-file-pdf"></i> Descargar PDF
                </button>
                <button class="btn btn-secondary" onclick="consultarFacturas.cerrarModal()">Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      `;
  
      document.body.insertAdjacentHTML('beforeend', modalHtml);
    }
  
    cerrarModal() {
      const modal = document.getElementById('detalleFacturaModal');
      if (modal) modal.remove();
    }
  
    async descargarPDF(facturaId) {
      const factura = this.facturas.find(f => f.id === facturaId);
      if (!factura) return;
  
      // Aquí iría la lógica de generación de PDF
      this.mostrarNotificacion('info', 'Generando PDF...');
      
      // Simular descarga
      setTimeout(() => {
        this.mostrarNotificacion('success', 'PDF descargado correctamente');
      }, 2000);
    }
  
    async enviarEmail(facturaId) {
      const factura = this.facturas.find(f => f.id === facturaId);
      if (!factura) return;
  
      if (!factura.cliente.email) {
        this.mostrarNotificacion('warning', 'El cliente no tiene email registrado');
        return;
      }
  
      this.mostrarNotificacion('info', 'Enviando factura por email...');
      
      // Simular envío
      setTimeout(() => {
        this.mostrarNotificacion('success', `Factura enviada a ${factura.cliente.email}`);
      }, 2000);
    }
  
    async imprimirFiscal(facturaId) {
      const factura = this.facturas.find(f => f.id === facturaId);
      if (!factura) return;
  
      this.mostrarNotificacion('info', 'Enviando a impresora fiscal...');
      
      // Simular impresión
      setTimeout(() => {
        this.mostrarNotificacion('success', 'Comprobante impreso correctamente');
      }, 3000);
    }
  
    async anularFactura(facturaId) {
      const factura = this.facturas.find(f => f.id === facturaId);
      if (!factura) return;
  
      const motivo = prompt('Ingrese el motivo de anulación:');
      if (!motivo) return;
  
      if (!confirm(`¿Está seguro de anular la factura ${factura.numero}?`)) return;
  
      try {
        this.mostrarLoading(true);
        
        // Emitir nota de crédito
        const resultado = await this.afip.anularComprobante(factura, motivo);
        
        if (resultado.success) {
          // Actualizar estado
          factura.estado = 'anulado';
          factura.motivoAnulacion = motivo;
          factura.fechaAnulacion = new Date().toISOString();
          
          await this.db.updateRecord('facturas', factura.id, factura);
          await this.cargarFacturas();
          
          this.mostrarNotificacion('success', 'Factura anulada correctamente');
        } else {
          this.mostrarNotificacion('error', 'Error al anular: ' + resultado.error);
        }
        
      } catch (error) {
        this.mostrarNotificacion('error', 'Error: ' + error.message);
      } finally {
        this.mostrarLoading(false);
      }
    }
  
    async reintentarCAE(facturaId) {
      const factura = this.facturas.find(f => f.id === facturaId);
      if (!factura) return;
  
      try {
        this.mostrarLoading(true);
        
        const resultado = await this.afip.obtenerCAE(factura);
        
        if (resultado.success) {
          factura.cae = resultado.cae;
          factura.fechaVencimientoCAE = resultado.fechaVencimiento;
          factura.estado = 'autorizado';
          
          await this.db.updateRecord('facturas', factura.id, factura);
          await this.cargarFacturas();
          
          this.mostrarNotificacion('success', `CAE obtenido: ${resultado.cae}`);
        } else {
          this.mostrarNotificacion('error', 'Error: ' + resultado.error);
        }
        
      } catch (error) {
        this.mostrarNotificacion('error', 'Error: ' + error.message);
      } finally {
        this.mostrarLoading(false);
      }
    }
  
    async exportarFacturas() {
      const fechaDesde = document.getElementById('fechaDesde').value;
      const fechaHasta = document.getElementById('fechaHasta').value;
      
      // Obtener facturas filtradas
      let facturas = [...this.facturas];
      
      if (fechaDesde) facturas = facturas.filter(f => f.fecha >= fechaDesde);
      if (fechaHasta) facturas = facturas.filter(f => f.fecha <= fechaHasta);
  
      // Crear CSV
      const csvData = this.generarCSV(facturas);
      this.descargarArchivo(csvData, `facturas_${fechaDesde}_${fechaHasta}.csv`, 'text/csv');
    }
  
    generarCSV(facturas) {
      const headers = ['Fecha', 'Tipo', 'Número', 'Cliente', 'CUIT', 'Total', 'IVA', 'Estado', 'CAE', 'Usuario'];
      
      const rows = facturas.map(f => [
        f.fecha,
        this.getTipoComprobanteTexto(f.tipoComprobante),
        f.numero,
        f.cliente.nombre,
        f.cliente.cuit,
        f.totales.total,
        f.totales.iva105 + f.totales.iva21 + f.totales.iva27,
        f.estado,
        f.cae || '',
        f.usuario
      ]);
  
      return [headers, ...rows].map(row => 
        row.map(field => `"${field}"`).join(',')
      ).join('\n');
    }
  
    descargarArchivo(contenido, nombreArchivo, tipo) {
      const blob = new Blob([contenido], { type: tipo });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = nombreArchivo;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
  
    mostrarLoading(show) {
      const overlay = document.getElementById('loadingOverlay') || this.createLoadingOverlay();
      overlay.style.display = show ? 'flex' : 'none';
    }
  
    createLoadingOverlay() {
      const overlay = document.createElement('div');
      overlay.id = 'loadingOverlay';
      overlay.innerHTML = `
        <div class="loading-content">
          <i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 1rem;"></i>
          <p>Consultando AFIP...</p>
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
  }
  
  // Funciones globales para compatibilidad
  window.consultarComprobante = () => window.consultarFacturas?.consultarComprobante();
  window.filtrarFacturas = () => window.consultarFacturas?.filtrarFacturas();
  window.exportarFacturas = () => window.consultarFacturas?.exportarFacturas();
  window.verDetalle = (id) => window.consultarFacturas?.verDetalle(id);
  window.descargarPDF = (id) => window.consultarFacturas?.descargarPDF(id);
  window.enviarEmail = (id) => window.consultarFacturas?.enviarEmail(id);
  window.imprimirFiscal = (id) => window.consultarFacturas?.imprimirFiscal(id);
  window.anularFactura = (id) => window.consultarFacturas?.anularFactura(id);
  window.reintentarCAE = (id) => window.consultarFacturas?.reintentarCAE(id);
  
  // Inicializar cuando el DOM esté listo
  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('facturasTableBody')) {
      window.consultarFacturas = new ConsultarFacturas();
    }
  });  