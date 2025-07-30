document.addEventListener('DOMContentLoaded', () => {
  setupTabs();
  setupModalListeners();
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

function setupModalListeners() {
  const saleProduct = document.getElementById('saleProduct');
  const saleQuantity = document.getElementById('saleQuantity');
  const saleTotal = document.getElementById('saleTotal');

  if (saleProduct && saleQuantity && saleTotal) {
    saleProduct.addEventListener('change', calculateSaleTotal);
    saleQuantity.addEventListener('input', calculateSaleTotal);
  }

  const purchaseQuantity = document.getElementById('purchaseQuantity');
  const purchasePrice = document.getElementById('purchasePrice');
  const purchaseTotal = document.getElementById('purchaseTotal');

  if (purchaseQuantity && purchasePrice && purchaseTotal) {
    purchaseQuantity.addEventListener('input', calculatePurchaseTotal);
    purchasePrice.addEventListener('input', calculatePurchaseTotal);
  }
}

function calculateSaleTotal() {
  const product = document.getElementById('saleProduct').value;
  const quantity = parseInt(document.getElementById('saleQuantity').value) || 0;
  const saleTotal = document.getElementById('saleTotal');

  const prices = {
    P001: 850000,
    P002: 45000,
    P003: 320000
  };

  saleTotal.value = `$${(prices[product] || 0) * quantity}`;
}

function calculatePurchaseTotal() {
  const quantity = parseInt(document.getElementById('purchaseQuantity').value) || 0;
  const price = parseFloat(document.getElementById('purchasePrice').value) || 0;
  const purchaseTotal = document.getElementById('purchaseTotal');

  purchaseTotal.value = `$${(quantity * price).toLocaleString('es-AR')}`;
}
