document.addEventListener("DOMContentLoaded", () => {
  loadMovies();

  document.getElementById("quantity").addEventListener("input", updatePrice);
  document.getElementById("type").addEventListener("change", () => {
    toggleProofInput();
    updatePrice();
  });
});

async function loadMovies() {
  const res = await fetch(`${API_BASE}/movies`, { credentials: "include" });
  const movies = await res.json();

  const container = document.getElementById("moviesList");

  if (movies.error) {
    toggleAuthVisibility(false);

    container.classList.add("center-message");
    container.innerHTML = `
      <div class="unauth-container">
        <h2>Você não está logado</h2>
        <p>Para ver os filmes disponíveis e comprar ingressos, faça login na plataforma.</p>
        <a class="login-btn" href="login.html">Login</a>
      </div>
    `;
    return;
  }

  toggleAuthVisibility(true);

  container.classList.remove("center-message");
  container.innerHTML = movies.map(movie => `
    <div class="movie-card" onclick="orderTicket(${movie.id}, ${movie.price}, '${movie.title}', '${movie.description}', '${movie.image_url}')">
      <img src="${movie.image_url}" alt="${movie.title}" />
      <div class="info">
        <h3>${movie.title}</h3>
        <p style="margin-top: -0.2rem;">${movie.release_year}</p>
        <button onclick="event.stopPropagation(); orderTicket(${movie.id}, ${movie.price}, '${movie.title}', '${movie.description}', '${movie.image_url}')">Comprar Ingresso</button>
      </div>
    </div>
  `).join("");
}

function orderTicket(movieId, price, title, description, imageUrl) {
  const modal = document.getElementById("modal");
  modal.dataset.price = price;

  document.getElementById("movieId").value = movieId;
  document.getElementById("modalMovieTitle").textContent = title;
  document.getElementById("modalDescription").textContent = description;
  document.getElementById("modalPoster").src = imageUrl;

  resetForm();

  updatePrice();
  modal.classList.remove("hidden");
}

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
  resetForm();
}

function resetForm() {
  document.getElementById("ticketForm").reset();
  document.getElementById("type").value = "inteira";
  document.getElementById("proofContainer").classList.add("hidden");
  document.getElementById("pricePreview").textContent = "";
  document.getElementById("confirmationMessage").classList.add("hidden");
  document.getElementById("ticketContent").classList.remove("hidden");
}

function toggleProofInput() {
  const type = document.getElementById("type").value;
  const proof = document.getElementById("proofContainer");
  proof.classList.toggle("hidden", type !== "meia");
}

function calculatePrice(type, qty) {
  const basePrice = parseFloat(document.getElementById("modal").dataset.price);
  const ticketPrice = type === "meia" ? basePrice / 2 : basePrice;
  return ticketPrice * qty;
}

function updatePrice() {
  const qty = parseInt(document.getElementById("quantity").value || 1);
  const type = document.getElementById("type").value;
  const total = calculatePrice(type, qty);
  document.getElementById("pricePreview").textContent = `Total: R$ ${total.toFixed(2)}`;
}

async function submitTicket(e) {
  e.preventDefault();

  const movie_id = document.getElementById("movieId").value;
  const quantity = parseInt(document.getElementById("quantity").value);
  const type = document.getElementById("type").value;
  const proof = document.getElementById("proof").value;
  const seats = document.getElementById("seats").value;
  const total_price = calculatePrice(type, quantity);
  const movieTitle = document.getElementById("modalMovieTitle").textContent;

  const payload = {
    movie_id,
    quantity,
    type,
    proof,
    seats,
    total_price
  };

  const res = await fetch(`${API_BASE}/order`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (res.ok) {
    document.getElementById("ticketContent").classList.add("hidden");
    const msg = document.getElementById("confirmationMessage");
    document.getElementById("confirmationText").textContent = `Você garantiu ingresso(s) para "${movieTitle}"!`;
    msg.classList.remove("hidden");
  } else {
    alert("Erro ao realizar a compra.");
  }
}