const API_BASE = "http://localhost:8000";

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;

      const res = await fetch(`${API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      const msg = document.getElementById("loginMsg");
      if (data.success) {
        msg.textContent = "Login realizado com sucesso!";
        window.location.href = "movies.html";
      } else {
        msg.textContent = "Usuário ou senha inválidos!";
      }
    });
  }
});

async function loadMovies() {
  const res = await fetch(`${API_BASE}/movies`);
  const movies = await res.json();
  const container = document.getElementById("moviesList");
  container.innerHTML = movies.map(m => `
    <div class="movie-card">
      <h3>${m.title}</h3>
      <p>Lançamento: ${m.release_year}</p>
      <button onclick="orderTicket(${m.id})">Comprar Ingresso</button>
    </div>
  `).join("");
}

async function orderTicket(movieId) {
  const userId = 1; // pode vir do localStorage no futuro
  const res = await fetch(`${API_BASE}/order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, movie_id: movieId })
  });

  const data = await res.json();
  alert(data.success ? "Ingresso comprado!" : "Erro ao comprar.");
}

async function loadDashboard() {
  const res = await fetch(`${API_BASE}/dashboard`);
  const data = await res.json();
  const el = document.getElementById("dashboardData");
  el.innerHTML = `
    <p>Total de usuários: ${data.total_users}</p>
    <p>Total de pedidos: ${data.total_orders}</p>
    <p>Total de filmes: ${data.total_movies}</p>
  `;
}
