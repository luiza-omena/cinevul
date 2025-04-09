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
  console.log("🚀 Carregando filmes...");
  const res = await fetch("http://localhost:8000/movies", {
    credentials: "include"
  });

  const movies = await res.json();
  const container = document.getElementById("moviesList");

  if (!Array.isArray(movies)) {
    container.innerHTML = "<p>Erro ao carregar filmes.</p>";
    return;
  }

  container.innerHTML = movies.map(movie => `
    <div class="movie-card">
      <img src="${movie.image_url}" alt="${movie.title}" />
      <div class="info">
        <h3>${movie.title}</h3>
        <p>Lançamento: ${movie.release_year}</p>
        <button onclick="orderTicket(${movie.id})">Comprar Ingresso</button>
      </div>
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
function orderTicket(movieId) {
  document.getElementById("movieId").value = movieId;
  document.getElementById("modal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
}

function toggleProofInput() {
  const type = document.getElementById("type").value;
  const proof = document.getElementById("proofContainer");
  proof.classList.toggle("hidden", type !== "meia");
}

async function submitTicket(e) {
  e.preventDefault();
  const movieId = document.getElementById("movieId").value;
  const quantity = document.getElementById("quantity").value;
  const type = document.getElementById("type").value;
  const proof = document.getElementById("proof").value;

  const payload = {
    movie_id: movieId,
    quantity,
    type,
    proof // ⚠️ campo vulnerável a XSS refletido
  };

  await fetch("http://localhost:8000/order", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  alert("Pedido realizado!");
  closeModal();
}

