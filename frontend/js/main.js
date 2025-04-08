const API_BASE = "http://localhost:8000";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  if (form) {
    form.addEventListener("submit", handleLogin);
  }
});

async function handleLogin(e) {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  console.log("\uD83D\uDD10 Enviando login para:", username);

  const res = await fetch("http://localhost:8000/login", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  console.log("\uD83D\uDCCA Resposta do login:", data);

  const msg = document.getElementById("loginMsg");

  if (data.success) {
    msg.style.color = "lightgreen";
    msg.textContent = "Login realizado com sucesso!";
    setTimeout(() => {
      window.location.href = "movies.html";
    }, 1000);
  } else {
    msg.style.color = "#e50914";
    msg.textContent = "Usuário ou senha incorretos.";
  }
}

async function loadMovies() {
  console.log("🎬 Buscando filmes...");
  const res = await fetch("http://localhost:8000/movies", {
    credentials: "include",
  });
  console.log("🔁 Resposta bruta da API:", res);
  const data = await res.json();
  console.log("📦 Conteúdo recebido:", data);
  
  const container = document.getElementById("moviesList");

  if (data.error === "Usuário não autenticado") {
    container.innerHTML = "<p style='color: red;'>Você precisa estar logado para acessar os filmes.</p>";
    return;
  }

  if (!Array.isArray(data)) {
    container.innerHTML = "<p>Erro ao carregar filmes.</p>";
    console.error("Resposta inválida:", data);
    return;
  }

  container.innerHTML = data.map(m => `
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

async function registerUser(e) {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const full_name = document.getElementById("full_name").value;
  const birth_date = document.getElementById("birth_date").value;

  const res = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, full_name, birth_date })
  });

  const data = await res.json();
  const msg = document.getElementById("registerMsg");

  if (data.success) {
    msg.textContent = "Cadastro realizado com sucesso!";
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1000);
  } else {
    msg.textContent = "Erro ao cadastrar. Verifique os dados.";
  }
}

async function logout() {
  console.log("🚪 Logout iniciado");
  const res = await fetch("http://localhost:8000/logout", {
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
