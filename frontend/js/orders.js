let orders = [];
let currentPage = 1;
let ordersPerPage = 10;
let activeFilters = {};
const normalizeType = (type) => (type === "inteira" ? "full" : type === "meia" ? "half" : type);
const typeLabel = (type) => (normalizeType(type) === "full" ? "Full" : normalizeType(type) === "half" ? "Half" : type);

(async () => {
  try {
    const res = await fetch(`${API_BASE}/admin/orders`, { credentials: "include" });
    const data = await res.json();

    if (data.error) {
      document.write(`
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Access Denied</title>
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
              <h2>Unauthorized access</h2>
              <p>This page is restricted to administrators.</p>
              <a class="login-btn" href="login.html">Sign in</a>
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
    console.error("Error loading orders:", err);
    document.write(`
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Error</title>
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
            <h2>Error loading orders</h2>
            <p>Please try again later.</p>
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
        <a href="index.html">Home</a>
        <a href="profile.html">Profile</a>
        <a href="movies.html">Movies</a>
        <a href="users.html">Users</a>
        <a href="dashboard-movies.html">Manage Movies</a>
        <button onclick="logout()">Log out</button>
      </div>
    </div>

    <div class="container">
      <h1 class="auth-only">Orders</h1>

      <div class="filters auth-only">
        <div class="search-filters">
          <input type="text" id="searchInput" placeholder="Search by movie, type, seats, or user..." value="${activeFilters.search || ''}">
          <button onclick="applyFilters()" class="filter-btn">➤</button>
        </div>
        <select id="typeFilter" onchange="applyFilters()">
          <option value="">All types</option>
          <option value="full" ${activeFilters.type === 'full' ? 'selected' : ''}>Full</option>
          <option value="half" ${activeFilters.type === 'half' ? 'selected' : ''}>Half</option>
        </select>
      </div>

      <div id="activeFilters" class="active-filters auth-only">
        ${activeFilters.search ? `<div class='filter-chip'>Search: "${activeFilters.search}" <button onclick='removeFilter("search")'>×</button></div>` : ''}
        ${activeFilters.type ? `<div class='filter-chip'>Type: ${typeLabel(activeFilters.type)} <button onclick='removeFilter("type")'>×</button></div>` : ''}
      </div>
  `;

  pageOrders.forEach(o => {
    html += `
      <div class="order-card">
        <h3>Order #${o.id}</h3>
        <p><strong>Movie:</strong> ${o.movie_title}</p>
        <p><strong>User:</strong> ${o.username}</p>
        <p><strong>Quantity:</strong> ${o.quantity}</p>
        <p><strong>Type:</strong> ${typeLabel(o.type)}</p>
        <p><strong>Seats:</strong> ${o.seats}</p>
        <p><strong>Total:</strong> R$ ${parseFloat(o.total_price).toFixed(2)}</p>
        ${o.proof ? `<p><strong>Proof:</strong> ${o.proof}</p>` : ''}
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
        <option value="5" ${ordersPerPage === 5 ? 'selected' : ''}>5 per page</option>
        <option value="10" ${ordersPerPage === 10 ? 'selected' : ''}>10 per page</option>
        <option value="20" ${ordersPerPage === 20 ? 'selected' : ''}>20 per page</option>
        <option value="50" ${ordersPerPage === 50 ? 'selected' : ''}>50 per page</option>
      </select>
    </div>
  </div>`;

  document.open();
  document.write(`
    <html>
      <head>
        <meta charset="UTF-8">
        <title>Orders</title>
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
              filtered = filtered.filter(o => normalizeType(o.type) === activeFilters.type);
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
    filtered = filtered.filter(o => normalizeType(o.type) === activeFilters.type);
  }
  return filtered;
}