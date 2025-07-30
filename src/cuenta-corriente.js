document.addEventListener('DOMContentLoaded', () => {
  setupTabs();
});

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
