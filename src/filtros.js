const { data } = await supabase
  .from('ventas')
  .select('*')
  .eq('cliente_id', clienteSeleccionado)
  .gte('fecha', '2025-01-01')
  .lte('fecha', '2025-12-31');
