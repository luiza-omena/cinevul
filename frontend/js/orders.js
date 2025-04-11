let orders = [];
let currentPage = 1;
let ordersPerPage = 10;
let activeFilters = {};

document.addEventListener("DOMContentLoaded", async () => {
  await loadAdminOrders();

  const applyBtn = document.getElementById("applyFilter");
  if (applyBtn) {
    applyBtn.addEventListener("click", () => {
      const search = document.getElementById("searchInput").value.trim();
      const type = document.getElementById("typeFilter").value;

      if (search && !activeFilters.search) {
        activeFilters.search = search;
      }

      if (type && !activeFilters.type) {
        activeFilters.type = type;
      }

      renderActiveFilters();
      renderOrders();
    });
  }

  const prevBtn = document.getElementById("prevPage");
  if (prevBtn) {
    prevBtn.addEventListener("click", () => changePage(-1));
  }

  const nextBtn = document.getElementById("nextPage");
  if (nextBtn) {
    nextBtn.addEventListener("click", () => changePage(1));
  }

  const perPageSelect = document.getElementById("perPageSelect");
  if (perPageSelect) {
    perPageSelect.addEventListener("change", (e) => {
      ordersPerPage = parseInt(e.target.value);
      currentPage = 1;
      renderOrders();
    });
  }
});

async function loadAdminOrders() {
  try {
    const res = await fetch("http://localhost:8000/admin/orders", {
      credentials: "include"
    });

    const data = await res.json();
    const container = document.querySelector(".container");

    if (data.error) {
      toggleAuthVisibility(false);
      container.innerHTML = `
        <div class="center-message">
          <div class="unauth-container">
            <h2>Acesso não autorizado</h2>
            <p>Esta página é restrita a administradores.</p>
            <a class="login-btn" href="login.html">Fazer login</a>
          </div>
        </div>
      `;
      return;
    }

    toggleAuthVisibility(true);
    orders = data;
    renderOrders();
  } catch (err) {
    console.error("Erro ao carregar pedidos:", err);
    const container = document.querySelector(".container");
    container.innerHTML = `
      <div class="center-message">
        <div class="unauth-container">
          <h2>Erro ao carregar pedidos</h2>
          <p>Tente novamente mais tarde.</p>
        </div>
      </div>
    `;
  }
}

function renderActiveFilters() {
  const container = document.getElementById("activeFilters");
  container.innerHTML = Object.entries(activeFilters).map(([key, value]) => `
    <div class="filter-chip">
      ${key === 'search' ? `Busca: "${value}"` : `Tipo: ${value}`}
      <button onclick="removeFilter('${key}')">×</button>
    </div>
  `).join("");
}

function removeFilter(key) {
  delete activeFilters[key];
  if (key === 'search') document.getElementById("searchInput").value = '';
  if (key === 'type') document.getElementById("typeFilter").value = '';
  renderActiveFilters();
  renderOrders();
}

function renderOrders() {
  const ordersList = document.getElementById("ordersList");

  let filtered = [...orders];

  if (activeFilters.search) {
    const search = activeFilters.search.toLowerCase();
    filtered = filtered.filter(o =>
      o.movie_title.toLowerCase().includes(search) ||
      o.type.toLowerCase().includes(search) ||
      o.seats.toLowerCase().includes(search) ||
      o.username.toLowerCase().includes(search)
    );
  }

  if (activeFilters.type) {
    filtered = filtered.filter(o => o.type === activeFilters.type);
  }

  const totalPages = Math.ceil(filtered.length / ordersPerPage);
  currentPage = Math.max(1, Math.min(currentPage, totalPages));

  const start = (currentPage - 1) * ordersPerPage;
  const end = start + ordersPerPage;
  const pageOrders = filtered.slice(start, end);

  ordersList.innerHTML = pageOrders.map(o => `
    <div class="order-card">
      <h3>Pedido #${o.id}</h3>
      <p><strong>Filme:</strong> ${o.movie_title}</p>
      <p><strong>Usuário:</strong> ${o.username}</p>
      <p><strong>Quantidade:</strong> ${o.quantity}</p>
      <p><strong>Tipo:</strong> ${o.type}</p>
      <p><strong>Cadeiras:</strong> ${o.seats}</p>
      <p><strong>Total:</strong> R$ ${parseFloat(o.total_price).toFixed(2)}</p>
      ${o.proof ? `<p><strong>Comprovante:</strong> ${o.proof}</p>` : ""}
    </div>
  `).join("");

  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  const paginationNumbers = document.getElementById("paginationNumbers");
  paginationNumbers.innerHTML = '';

  const maxVisible = 5;
  let startPage = Math.max(1, currentPage - 2);
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);

  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  if (startPage > 1) {
    paginationNumbers.innerHTML += `<span onclick="goToPage(1)">1</span>`;
    if (startPage > 2) paginationNumbers.innerHTML += `<span>...</span>`;
  }

  for (let i = startPage; i <= endPage; i++) {
    paginationNumbers.innerHTML += `
      <span class="${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</span>
    `;
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) paginationNumbers.innerHTML += `<span>...</span>`;
    paginationNumbers.innerHTML += `<span onclick="goToPage(${totalPages})">${totalPages}</span>`;
  }

  document.getElementById("prevPage").disabled = currentPage === 1;
  document.getElementById("nextPage").disabled = currentPage === totalPages;
}

function changePage(delta) {
  currentPage += delta;
  renderOrders();
}

function goToPage(page) {
  currentPage = page;
  renderOrders();
}