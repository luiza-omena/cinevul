let orders = [];
let currentPage = 1;
let ordersPerPage = 10;
let activeFilters = {};

(async () => {
  try {
    const res = await fetch(`${API_BASE}/admin/orders`, { credentials: "include" });
    const data = await res.json();

    if (data.error) {
      document.write(`
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Acesso Negado</title>
            <link rel="stylesheet" href="css/global.css">
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Bebas+Neue&display=swap" rel="stylesheet">
            <style>
              body {
                background-color: #121212;
                font-family: 'Inter', sans-serif;
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
              }
              .unauth-container {
                background-color: #1c1c1c;
                padding: 2rem;
                border-radius: 8px;
                box-shadow: 0 0 15px rgba(229, 9, 20, 0.3);
                text-align: center;
              }
              .unauth-container h2 {
                color: #e50914;
                margin-bottom: 1rem;
              }
              .unauth-container p {
                color: #ccc;
                margin-bottom: 1.5rem;
              }
              .login-btn {
                padding: 0.5rem 1rem;
                background-color: #e50914;
                color: white;
                border: none;
                border-radius: 5px;
                text-decoration: none;
                font-weight: bold;
                transition: background-color 0.3s ease;
              }
              .login-btn:hover {
                background-color: #ff3d3d;
              }
            </style>
          </head>
          <body>
            <div class="unauth-container">
              <h2>Acesso não autorizado</h2>
              <p>Esta página é restrita a administradores.</p>
              <a class="login-btn" href="login.html">Fazer login</a>
            </div>
          </body>
        </html>
      `);
      document.close();
      return;
    }    

    orders = data;
    renderPage();

  } catch (err) {
    console.error("Erro ao carregar pedidos:", err);
    document.write(`
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Erro</title>
          <link rel="stylesheet" href="css/global.css">
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Bebas+Neue&display=swap" rel="stylesheet">
          <style>
            body {
              background-color: #121212;
              font-family: 'Inter', sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
            }
            .unauth-container {
              background-color: #1c1c1c;
              padding: 2rem;
              border-radius: 8px;
              box-shadow: 0 0 15px rgba(229, 9, 20, 0.3);
              text-align: center;
            }
            .unauth-container h2 {
              color: #e50914;
              margin-bottom: 1rem;
            }
            .unauth-container p {
              color: #ccc;
              margin-bottom: 1.5rem;
            }
          </style>
        </head>
        <body>
          <div class="unauth-container">
            <h2>Erro ao carregar pedidos</h2>
            <p>Tente novamente mais tarde.</p>
          </div>
        </body>
      </html>
    `);
    document.close();    
  }
})();

function renderPage() {
  const totalPages = Math.ceil(getFilteredOrders().length / ordersPerPage);
  currentPage = Math.max(1, Math.min(currentPage, totalPages));

  const start = (currentPage - 1) * ordersPerPage;
  const end = start + ordersPerPage;
  const pageOrders = getFilteredOrders().slice(start, end);

  let html = `
    <div class="menu-wrapper auth-only">
      <button class="menu-btn" onclick="toggleMenu()">
        <img src="assets/icons/Burger.svg" alt="Menu" class="burger-icon">
      </button>
      <div class="dropdown hidden" id="userMenu">
        <a href="dashboard.html">Dashboard</a>
        <a href="index.html">Início</a>
        <a href="profile.html">Perfil</a>
        <a href="movies.html">Filmes</a>
        <a href="users.html">Usuários</a>
        <a href="dashboard-movies.html">Gerenciar Filmes</a>
        <button onclick="logout()">Sair</button>
      </div>
    </div>

    <div class="container">
      <h1 class="auth-only">Pedidos</h1>

      <div class="filters auth-only">
        <div class="search-filters">
          <input type="text" id="searchInput" placeholder="Buscar por filme, tipo, cadeiras ou usuário..." value="${activeFilters.search || ''}">
          <button onclick="applyFilters()" class="filter-btn">➤</button>
        </div>
        <select id="typeFilter" onchange="applyFilters()">
          <option value="">Todos os tipos</option>
          <option value="inteira" ${activeFilters.type === 'inteira' ? 'selected' : ''}>Inteira</option>
          <option value="meia" ${activeFilters.type === 'meia' ? 'selected' : ''}>Meia</option>
        </select>
      </div>

      <div id="activeFilters" class="active-filters auth-only">
        ${activeFilters.search ? `<div class='filter-chip'>Busca: "${activeFilters.search}" <button onclick='removeFilter("search")'>×</button></div>` : ''}
        ${activeFilters.type ? `<div class='filter-chip'>Tipo: ${activeFilters.type} <button onclick='removeFilter("type")'>×</button></div>` : ''}
      </div>
  `;

  pageOrders.forEach(o => {
    html += `
      <div class="order-card">
        <h3>Pedido #${o.id}</h3>
        <p><strong>Filme:</strong> ${o.movie_title}</p>
        <p><strong>Usuário:</strong> ${o.username}</p>
        <p><strong>Quantidade:</strong> ${o.quantity}</p>
        <p><strong>Tipo:</strong> ${o.type}</p>
        <p><strong>Cadeiras:</strong> ${o.seats}</p>
        <p><strong>Total:</strong> R$ ${parseFloat(o.total_price).toFixed(2)}</p>
        ${o.proof ? `<p><strong>Comprovante:</strong> ${o.proof}</p>` : ''}
      </div>
    `;
  });

  html += `<div class="pagination auth-only"><button onclick="changePage(-1)" ${currentPage === 1 ? 'disabled' : ''}>⟨</button>`;

  for (let i = 1; i <= totalPages; i++) {
    html += `<span class="${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</span>`;
  }

  html += `<button onclick="changePage(1)" ${currentPage === totalPages ? 'disabled' : ''}>⟩</button>`;

  html += `
      <select onchange="changePerPage(this.value)" class="per-page-select">
        <option value="5" ${ordersPerPage === 5 ? 'selected' : ''}>5 por página</option>
        <option value="10" ${ordersPerPage === 10 ? 'selected' : ''}>10 por página</option>
        <option value="20" ${ordersPerPage === 20 ? 'selected' : ''}>20 por página</option>
        <option value="50" ${ordersPerPage === 50 ? 'selected' : ''}>50 por página</option>
      </select>
    </div>
  </div>`;

  document.open();
  document.write(`
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Pedidos</title>
        <link rel="stylesheet" href="css/global.css">
        <link rel="stylesheet" href="css/orders.css">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Bebas+Neue&display=swap" rel="stylesheet">
      </head>
      <body>
        ${html}
        <script src="js/utils.js"></script>
        <script>
          function changePage(delta) {
            currentPage += delta;
            renderPage();
          }

          function goToPage(page) {
            currentPage = page;
            renderPage();
          }

          function changePerPage(value) {
            ordersPerPage = parseInt(value);
            currentPage = 1;
            renderPage();
          }

          function applyFilters() {
            const search = document.getElementById("searchInput").value.trim();
            const type = document.getElementById("typeFilter").value;
            activeFilters = {};
            if (search) activeFilters.search = search;
            if (type) activeFilters.type = type;
            currentPage = 1;
            renderPage();
          }

          function removeFilter(key) {
            delete activeFilters[key];
            currentPage = 1;
            renderPage();
          }

          function getFilteredOrders() {
            let filtered = [...orders];
            if (activeFilters.search) {
              const s = activeFilters.search.toLowerCase();
              filtered = filtered.filter(o =>
                o.movie_title.toLowerCase().includes(s) ||
                o.type.toLowerCase().includes(s) ||
                o.seats.toLowerCase().includes(s) ||
                o.username.toLowerCase().includes(s)
              );
            }
            if (activeFilters.type) {
              filtered = filtered.filter(o => o.type === activeFilters.type);
            }
            return filtered;
          }

          document.addEventListener("click", function(e) {
            const dropdown = document.getElementById("userMenu");
            const menuBtn = document.querySelector(".menu-btn");
            if (dropdown && !dropdown.contains(e.target) && !menuBtn.contains(e.target)) {
              dropdown.classList.add("hidden");
            }
          });
        </script>
      </body>
    </html>
  `);
  document.close();
}

function getFilteredOrders() {
  let filtered = [...orders];
  if (activeFilters.search) {
    const s = activeFilters.search.toLowerCase();
    filtered = filtered.filter(o =>
      o.movie_title.toLowerCase().includes(s) ||
      o.type.toLowerCase().includes(s) ||
      o.seats.toLowerCase().includes(s) ||
      o.username.toLowerCase().includes(s)
    );
  }
  if (activeFilters.type) {
    filtered = filtered.filter(o => o.type === activeFilters.type);
  }
  return filtered;
}