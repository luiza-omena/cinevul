let users = [];
let currentPage = 1;
let usersPerPage = 10;
let activeFilters = {};

document.addEventListener("DOMContentLoaded", async () => {
  await loadAdminUsers();

  const applyBtn = document.getElementById("applyFilter");
  if (applyBtn) {
    applyBtn.addEventListener("click", () => {
      const search = document.getElementById("searchInput").value.trim();
      const type = document.getElementById("typeFilter").value;

      if (search) {
        activeFilters.search = search;
      } else {
        delete activeFilters.search;
      }

      if (type) {
        activeFilters.type = type;
      } else {
        delete activeFilters.type;
      }

      renderActiveFilters();
      renderUsers();
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
      usersPerPage = parseInt(e.target.value);
      currentPage = 1;
      renderUsers();
    });
  }
});

async function loadAdminUsers() {
  try {
    const res = await fetch(`${API_BASE}/admin/users`, { credentials: "include" });
    const data = await res.json();

    const container = document.querySelector(".container");
    const menuWrapper = document.querySelector(".menu-wrapper");

    if (data.error) {
      toggleAuthVisibility(false);
      menuWrapper.classList.add("hidden");
      container.classList.add("hidden");

      const errorDiv = document.createElement("div");
      errorDiv.innerHTML = `
        <div class="center-message">
          <div class="unauth-container">
            <h2>Acesso não autorizado</h2>
            <p>Esta página é restrita a administradores.</p>
            <a class="login-btn" href="login.html">Fazer login</a>
          </div>
        </div>
      `;
      document.body.appendChild(errorDiv);
      return;
    }

    toggleAuthVisibility(true);
    users = data;
    renderUsers();
  } catch (err) {
    console.error("Erro ao carregar usuários:", err);
    const container = document.querySelector(".container");
    container.classList.add("hidden");
    const menuWrapper = document.querySelector(".menu-wrapper");
    menuWrapper.classList.add("hidden");

    const errorDiv = document.createElement("div");
    errorDiv.innerHTML = `
      <div class="center-message">
        <div class="unauth-container">
          <h2>Erro ao carregar usuários</h2>
          <p>Tente novamente mais tarde.</p>
        </div>
      </div>
    `;
    document.body.appendChild(errorDiv);
  }
}

function renderActiveFilters() {
  const container = document.getElementById("activeFilters");
  container.innerHTML = Object.entries(activeFilters).map(([key, value]) => {
    let label = key === "search" ? `Busca: "${value}"` : `Tipo: ${value === "admin" ? "Admin" : "Não Admin"}`;
    return `
      <div class="filter-chip">
        ${label}
        <button onclick="removeFilter('${key}')">×</button>
      </div>
    `;
  }).join("");
}

function removeFilter(key) {
  delete activeFilters[key];
  if (key === "search") document.getElementById("searchInput").value = "";
  if (key === "type") document.getElementById("typeFilter").value = "";
  renderActiveFilters();
  renderUsers();
}

function renderUsers() {
  const userList = document.getElementById("usersList");
  let filtered = [...users];
  if (activeFilters.search) {
    const search = activeFilters.search.toLowerCase();
    filtered = filtered.filter(u => {
      const fullName = (u.full_name || "").toLowerCase();
      const username = (u.username || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      const phoneStr = (typeof u.phone === "string" || typeof u.phone === "number")
        ? String(u.phone).toLowerCase()
        : "";
      return fullName.includes(search) || username.includes(search) || email.includes(search) || phoneStr.includes(search);
    });
  }

  if (activeFilters.type) {
    if (activeFilters.type === "admin") {
      filtered = filtered.filter(u => u.is_admin === true);
    } else if (activeFilters.type === "naoadmin") {
      filtered = filtered.filter(u => u.is_admin === false);
    }
  }

  
  const totalPages = Math.ceil(filtered.length / usersPerPage);
  currentPage = Math.max(1, Math.min(currentPage, totalPages));
  const start = (currentPage - 1) * usersPerPage;
  const end = start + usersPerPage;
  const pageUsers = filtered.slice(start, end);

  userList.innerHTML = pageUsers.map(u => {
    const phoneDisplay = (typeof u.phone === "string" || typeof u.phone === "number")
      ? u.phone
      : "N/A";
    return `
      <div class="user-card">
        <div class="user-info">
          <p><strong>${u.full_name}</strong> (${u.username})</p>
          <p>Email: ${u.email}</p>
          <p>Celular: ${phoneDisplay}</p>
        </div>
        <button class="delete-btn" onclick="deleteUser(${u.id})">
          <img src="assets/icons/Trash.svg" alt="Excluir">
        </button>
      </div>
    `;
  }).join("");

  renderPagination(totalPages);
}


function renderPagination(totalPages) {
  const paginationNumbers = document.getElementById("paginationNumbers");
  paginationNumbers.innerHTML = "";

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
      <span class="${i === currentPage ? "active" : ""}" onclick="goToPage(${i})">${i}</span>
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
  renderUsers();
}

function goToPage(page) {
  currentPage = page;
  renderUsers();
}

let deleteUserId = null;

function openDeleteModal(id) {
  deleteUserId = id;
  document.getElementById("deleteModal").classList.remove("hidden");
}

function closeDeleteModal() {
  deleteUserId = null;
  document.getElementById("deleteModal").classList.add("hidden");
}

function deleteUser(id) {
  openDeleteModal(id);
}

document.getElementById("confirmDelete").addEventListener("click", async () => {
  if (!deleteUserId) return;
  try {
    const res = await fetch(`${API_BASE}/admin/delete-user`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: deleteUserId })
    });
    const data = await res.json();
    if (data.success) {
      closeDeleteModal();
      location.reload();
    } else {
      alert("Erro ao excluir usuário.");
      closeDeleteModal();
    }
  } catch (err) {
    alert("Erro ao excluir usuário.");
    closeDeleteModal();
  }
});

document.getElementById("cancelDelete").addEventListener("click", () => {
  closeDeleteModal();
});