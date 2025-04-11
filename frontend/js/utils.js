const API_BASE = "http://localhost:8000";

async function logout() {
  console.log("🚪 Logout iniciado");
  const res = await fetch(`${API_BASE}/logout`, {
    method: "POST",
    credentials: "include"
  });

  const data = await res.json();
  console.log("🧹 Resposta do logout:", data);

  if (data.success) {
    setTimeout(() => {
      window.location.href = "login.html";
    }, 500);
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
