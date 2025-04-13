const API_BASE = "http://localhost:8000";

async function logout() {
  const res = await fetch(`${API_BASE}/logout`, {
    method: "POST",
    credentials: "include"
  });

  const data = await res.json();

  if (data.success) {
    setTimeout(() => {
      window.location.href = "login.html";
    }, 300);
  }
}

function toggleMenu() {
  const menu = document.getElementById("userMenu");
  menu.classList.toggle("hidden");
}

document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("click", (event) => {
    const menu = document.getElementById("userMenu");
    const btn = document.querySelector(".menu-btn");
    if (!menu || !btn) return;

    if (!menu.contains(event.target) && !btn.contains(event.target)) {
      menu.classList.add("hidden");
    }
  });
});

window.toggleMenu = toggleMenu;
window.logout = logout;

function toggleAuthVisibility(isAuthenticated) {
  const authElements = document.querySelectorAll(".auth-only");
  const menu = document.querySelector(".menu-wrapper");

  authElements.forEach(el => {
    if (isAuthenticated) {
      el.classList.remove("hidden");
    } else {
      el.classList.add("hidden");
    }
  });

  if (menu) {
    if (isAuthenticated) menu.classList.remove("hidden");
    else menu.classList.add("hidden");
  }
}

window.toggleAuthVisibility = toggleAuthVisibility;

async function isUserAdmin() {
  try {
    const res = await fetch(`${API_BASE}/isAdmin`, { credentials: "include" });
    const data = await res.json();
    return data["is_admin"];
  } catch (err) {
    console.error("Erro ao verificar se o usuário é admin:", err);
    return false;
  }
}

async function addDashboardLinkIfAdmin() {
  if (window.location.pathname.includes("dashboard.html")) {
    return;
  }
  if (await isUserAdmin()) {
    const menu = document.getElementById("userMenu");
    if (menu && !menu.querySelector("a[href='dashboard.html']")) {
      menu.insertAdjacentHTML("afterbegin", `<a href="dashboard.html">Dashboard</a>`);
    }
  }
}

document.addEventListener("DOMContentLoaded", addDashboardLinkIfAdmin);

async function isUserLoggedIn() {
  try {
    const res = await fetch(`${API_BASE}/isAuthenticated`, {
      credentials: "include"
    });
    const data = await res.json();
    return data.isAuthenticated;
  } catch (err) {
    console.error("Erro ao verificar autenticação:", err);
    return false;
  }
}
window.isUserLoggedIn = isUserLoggedIn;

const url = new URL(window.location.href);

if (url.searchParams.get("debug") === "devtools") {
  fetch(`${API_BASE}/devtools/`, {
    credentials: "include"
  })
    .then(res => res.json())
    .then(data => {
      document.body.innerHTML = "<pre style='color:#fff;background:#111;padding:20px'>" +
        JSON.stringify(data, null, 2) +
        "</pre>";
    })
    .catch(err => {
      document.body.innerHTML = "<h2 style='color:red'>Erro ao carregar devtools</h2>";
      console.error(err);
    });
}