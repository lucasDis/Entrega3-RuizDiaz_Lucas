document.addEventListener('DOMContentLoaded', async () => {
  try {
    if (typeof supabase === 'undefined') {
      console.error('Supabase no está disponible. Asegúrate de cargar src/supabase.js antes de filtros.js');
      return;
    }
    const { data, error } = await supabase
      .from('ventas')
      .select('*')
      .eq('cliente_id', clienteSeleccionado)
      .gte('fecha', '2025-01-01')
      .lte('fecha', '2025-12-31');

    if (error) {
      console.error('Error al obtener ventas:', error);
    } else {
      // TODO: renderizar data en la UI
      console.log('Ventas filtradas:', data);
    }
  } catch (e) {
    console.error('Error inesperado en filtros.js:', e);
  }
});
