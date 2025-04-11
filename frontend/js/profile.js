let orders = [];
let currentPage = 1;
let ordersPerPage = 10;
let activeFilters = {};

document.addEventListener("DOMContentLoaded", async () => {
  await loadUserProfile();

  document.getElementById("applyFilter").addEventListener("click", () => {
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

  document.getElementById("prevPage").addEventListener("click", () => changePage(-1));
  document.getElementById("nextPage").addEventListener("click", () => changePage(1));
  document.getElementById("perPageSelect").addEventListener("change", (e) => {
    ordersPerPage = parseInt(e.target.value);
    currentPage = 1;
    renderOrders();
  });
});

async function loadUserProfile() {
  const res = await fetch(`${API_BASE}/profile`, { credentials: "include" });
  const data = await res.json();

  const userInfo = document.getElementById("userInfo");

  if (data.error) {
    userInfo.innerHTML = `<p style="color: #e50914;">${data.error}</p>`;
    return;
  }

  const { user, orders: fetchedOrders } = data;
  orders = fetchedOrders;

  userInfo.innerHTML = `
  <h3>${user.full_name}</h3>
  <p><strong>Usuário:</strong> ${user.username}
    <button onclick="openEditModal(${user.id}, '${user.username}')" style="margin-left: 0.5rem; cursor: pointer;">🖉</button>
  </p>
  <p><strong>Nascimento:</strong> ${user.birth_date}</p>
  <p><strong>Email:</strong> ${user.email || 'N/A'}</p>
`;

  renderOrders();
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
  const userOrders = document.getElementById("userOrders");

  let filtered = [...orders];

  if (activeFilters.search) {
    const search = activeFilters.search.toLowerCase();
    filtered = filtered.filter(o =>
      o.movie_title.toLowerCase().includes(search) ||
      o.type.toLowerCase().includes(search) ||
      o.seats.toLowerCase().includes(search)
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

  userOrders.innerHTML = pageOrders.map(o => `
    <div class="order-card">
      <h3>Pedido #${o.order_id} - ${o.movie_title}</h3>
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

// Abre o modal com o ID e nome atual preenchidos
function openEditModal(userId, currentUsername) {
  document.getElementById("editUserId").value = userId;
  document.getElementById("newUsername").value = currentUsername;
  document.getElementById("editUsernameModal").classList.remove("hidden");
}

// Fecha o modal
function closeEditModal() {
  document.getElementById("editUsernameModal").classList.add("hidden");
}

// Submissão do formulário de edição
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("editUsernameForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = document.getElementById("editUserId").value;
    const newUsername = document.getElementById("newUsername").value;

    const res = await fetch(`${API_BASE}/edit-username`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, new_username: newUsername })
    });

    const result = await res.json();

    if (result.success) {
      closeEditModal();
      await loadUserProfile(); // recarrega dados atualizados
    } else {
      alert("Erro ao atualizar nome de usuário");
    }
  });
});
