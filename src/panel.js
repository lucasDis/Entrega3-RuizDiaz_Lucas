function logout() {
  if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
    window.location.href = "../Principal/login.html";
  }
}

// autenticación real.
// Por ahora solo redirigimos a la vista de administración si se confirma.
function checkAdminAccess() {
  const proceed = confirm('Acceder a administración (requiere cuenta de admin).');
  if (proceed) {
    location.href = 'admin-empresa.html';
  }
}