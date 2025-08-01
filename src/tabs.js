function setupTabs() {
  const tabs = document.querySelectorAll('[data-subtab]');
  tabs.forEach(tab => {
    tab.addEventListener('click', function () {
      const tabName = this.getAttribute('data-subtab');

      tabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');

      document.querySelectorAll('.tab-content').forEach(content => {
        content.style.display = 'none';
      });

      document.getElementById(`${tabName}-content`).style.display = 'block';
    });
  });
}

document.addEventListener('DOMContentLoaded', function () {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const currentPage = location.pathname.split('/').pop();

  tabBtns.forEach(btn => {
    // Marcar activa la pestaña correspondiente
    if (btn.getAttribute('data-tab') === currentPage) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
    // Navegación al hacer click
    btn.addEventListener('click', function () {
      if (btn.getAttribute('data-tab') !== currentPage) {
        window.location.href = btn.getAttribute('data-tab');
      }
    });
  });
});