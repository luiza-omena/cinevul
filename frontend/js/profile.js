let orders = [];
let currentPage = 1;
let ordersPerPage = 10;
let activeFilters = {};

document.addEventListener("DOMContentLoaded", async () => {
  await loadUserProfile();

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


async function loadUserProfile() {
  const res = await fetch(`${API_BASE}/profile`, { credentials: "include" });
  const data = await res.json();
  const container = document.querySelector(".container");

  if (data.error) {
    toggleAuthVisibility(false);
  
    const container = document.querySelector(".container");
    container.innerHTML = `
      <div class="center-message">
        <div class="unauth-container">
          <h2>Você não está logado</h2>
          <p>Para visualizar seu perfil e pedidos, faça login na plataforma.</p>
          <a class="login-btn" href="login.html">Login</a>
        </div>
      </div>
    `;
    return;
  }  

  toggleAuthVisibility(true);

  const { user, orders: fetchedOrders } = data;
  orders = fetchedOrders;

  document.getElementById("userInfo").innerHTML = `
  <h3 style="cursor: default; text-align: center; color: #e50914;">${user.full_name}</h3>

  <div style="display: flex; justify-content: center; gap: 1rem; flex-direction: column; align-items: center; margin-top: 1rem;">
    
    <div style="display: flex; align-items: center; gap: 0.5rem;">
      <strong>Usuário:</strong>
      <span>${user.username}</span>
      <button onclick="openEditModal('username', ${user.id}, '${user.username}')" 
        style="background: none; border: none; cursor: pointer; display: flex; align-items: center;">
        <img src="assets/icons/edit.svg" alt="Editar" style="width: 1rem; height: 1rem;" />
      </button>
    </div>

    <div style="display: flex; align-items: center; gap: 0.5rem;">
      <strong>Email:</strong>
      <span>${user.email || 'N/A'}</span>
      <button onclick="openEditModal('email', ${user.id}, '${user.email || ''}')" 
        style="background: none; border: none; cursor: pointer; display: flex; align-items: center;">
        <img src="assets/icons/edit.svg" alt="Editar" style="width: 1rem; height: 1rem;" />
      </button>
    </div>

    <div style="display: flex; align-items: center; gap: 0.5rem;">
      <strong>Celular:</strong>
      <span>${user.phone || 'N/A'}</span>
      <button onclick="openEditModal('phone', ${user.id}, '${user.phone || ''}')" 
        style="background: none; border: none; cursor: pointer; display: flex; align-items: center;">
        <img src="assets/icons/edit.svg" alt="Editar" style="width: 1rem; height: 1rem;" />
      </button>
    </div>

  </div>
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

function openEditModal(type, userId, currentValue) {
  const titleMap = {
    username: "Editar Nome de Usuário",
    email: "Editar E-mail",
    phone: "Editar Celular"
  };

  const placeholderMap = {
    username: "Novo nome de usuário",
    email: "Novo e-mail",
    phone: "Novo número de celular"
  };

  document.getElementById("editModalTitle").textContent = titleMap[type];
  document.getElementById("editFieldValue").placeholder = placeholderMap[type];
  document.getElementById("editFieldValue").value = currentValue || "";
  document.getElementById("editFieldType").value = type;
  document.getElementById("editUserId").value = userId;

  document.getElementById("editProfileModal").classList.remove("hidden");
}

function closeEditModal() {
  document.getElementById("editProfileModal").classList.add("hidden");
}

async function submitEdit() {
  const userId = document.getElementById("editUserId").value;
  const field = document.getElementById("editFieldType").value;
  const value = document.getElementById("editFieldValue").value;

  const res = await fetch(`${API_BASE}/edit-${field}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: userId, value })
  });

  const data = await res.json();

  if (data.success) {
    closeEditModal();
    loadUserProfile();
  } else {
    alert("Erro ao atualizar.");
  }
}