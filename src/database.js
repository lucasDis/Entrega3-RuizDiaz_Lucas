// Sistema de base de datos temporal con localStorage y Supabase
class DatabaseManager {
  constructor() {
    this.isSupabaseAvailable = typeof supabase !== 'undefined';
    this.initializeLocalStorage();
  }

  initializeLocalStorage() {
    const tables = ['productos', 'clientes', 'proveedores', 'ventas', 'compras', 'movimientos', 'pagos', 'cargos'];
    
    tables.forEach(table => {
      if (!localStorage.getItem(table)) {
        localStorage.setItem(table, JSON.stringify(this.getInitialData(table)));
      }
    });
  }

  getInitialData(table) {
    const initialData = {
      productos: [
        {
          id: 'P001',
          nombre: 'Laptop Dell Inspiron 15',
          sku: 'DELL-INS-15-001',
          categoria: 'Electrónica',
          precio: 850000,
          stock: 25,
          estado: 'Activo',
          fechaCreacion: '2024-01-15'
        },
        {
          id: 'P002',
          nombre: 'Camiseta Nike Running',
          sku: 'NIKE-RUN-M-001',
          categoria: 'Deportes',
          precio: 45000,
          stock: 5,
          estado: 'Activo',
          fechaCreacion: '2024-01-20'
        },
        {
          id: 'P003',
          nombre: 'Sofá 3 Plazas Gris',
          sku: 'SOFA-3P-GR-001',
          categoria: 'Hogar',
          precio: 320000,
          stock: 0,
          estado: 'Agotado',
          fechaCreacion: '2024-01-10'
        }
      ],
      clientes: [
        {
          id: 'CL102',
          nombre: 'María López',
          email: 'maria.lopez@gmail.com',
          telefono: '11 3456 7890',
          direccion: 'Av. Corrientes 1234, CABA',
          fechaAlta: '2024-03-12',
          estado: 'Activo',
          saldo: 0
        },
        {
          id: 'CL103',
          nombre: 'Lucas García',
          email: 'lucas.garcia@yahoo.com',
          telefono: '11 9876 5432',
          direccion: 'San Martín 567, Buenos Aires',
          fechaAlta: '2024-06-01',
          estado: 'Activo',
          saldo: 150000
        }
      ],
      proveedores: [
        {
          id: 'PR301',
          empresa: 'Distribuciones Norte',
          contacto: 'Esteban Ramos',
          telefono: '11 2233 4455',
          email: 'esteban@dnorte.com',
          direccion: 'Av. San Juan 890, CABA',
          estado: 'Activo',
          saldo: -75000
        }
      ],
      ventas: [
        {
          id: 'V-001',
          cliente: 'María González',
          clienteId: 'CL102',
          fecha: '2025-01-15',
          productos: 'Laptop Dell Inspiron 15',
          total: 850000,
          estado: 'Pagado'
        }
      ],
      compras: [],
      movimientos: [],
      pagos: [],
      cargos: []
    };

    return initialData[table] || [];
  }

  async getData(table) {
    try {
      if (this.isSupabaseAvailable) {
        const { data, error } = await supabase.from(table).select('*');
        if (!error && data.length > 0) {
          return data;
        }
      }
    } catch (e) {
      console.warn('Supabase no disponible, usando localStorage');
    }
    
    return JSON.parse(localStorage.getItem(table) || '[]');
  }

  async saveData(table, data) {
    try {
      if (this.isSupabaseAvailable) {
        const { error } = await supabase.from(table).upsert(data);
        if (!error) {
          localStorage.setItem(table, JSON.stringify(data));
          return true;
        }
      }
    } catch (e) {
      console.warn('Supabase no disponible, guardando en localStorage');
    }
    
    localStorage.setItem(table, JSON.stringify(data));
    return true;
  }

  async addRecord(table, record) {
    const data = await this.getData(table);
    record.id = record.id || this.generateId(table);
    data.push(record);
    return await this.saveData(table, data);
  }

  async updateRecord(table, id, updates) {
    const data = await this.getData(table);
    const index = data.findIndex(item => item.id === id);
    if (index !== -1) {
      data[index] = { ...data[index], ...updates };
      return await this.saveData(table, data);
    }
    return false;
  }

  async deleteRecord(table, id) {
    const data = await this.getData(table);
    const filteredData = data.filter(item => item.id !== id);
    return await this.saveData(table, filteredData);
  }

  generateId(table) {
    const prefixes = {
      productos: 'P',
      clientes: 'CL',
      proveedores: 'PR',
      ventas: 'V',
      compras: 'C',
      movimientos: 'M',
      pagos: 'PAG',
      cargos: 'CAR'
    };
    
    const prefix = prefixes[table] || 'ID';
    const timestamp = Date.now().toString().slice(-6);
    return `${prefix}${timestamp}`;
  }
}

// Instancia global
window.db = new DatabaseManager();