let movies = [];
let movieToDelete = null;

document.addEventListener("DOMContentLoaded", async () => {
  await loadAdminMovies();
  document.getElementById("createMovieBtn").addEventListener("click", () => {
    openMovieModal();
  });
  document.getElementById("confirmDeleteBtn").addEventListener("click", () => {
    deleteMovieConfirmed();
  });
});

async function loadAdminMovies() {
  try {
    const res = await fetch(`${API_BASE}/admin/movies`, { credentials: "include" });
    const data = await res.json();
    const container = document.querySelector(".container");
    const menuWrapper = document.querySelector(".menu-wrapper");
    if (data.error) {
      container.classList.add("hidden");
      menuWrapper.classList.add("hidden");
      const errorDiv = document.createElement("div");
      errorDiv.innerHTML = `
        <div class="center-message">
          <div class="unauth-container">
            <h2>Unauthorized access</h2>
            <p>This page is restricted to administrators.</p>
            <a class="login-btn" href="login.html">Sign in</a>
          </div>
        </div>
      `;
      document.body.appendChild(errorDiv);
      return;
    }
    container.classList.remove("hidden");
    menuWrapper.classList.remove("hidden");
    movies = data;
    renderMovies();
  } catch (err) {
    const container = document.querySelector(".container");
    const menuWrapper = document.querySelector(".menu-wrapper");
    container.classList.add("hidden");
    menuWrapper.classList.add("hidden");
    const errorDiv = document.createElement("div");
    errorDiv.innerHTML = `
      <div class="center-message">
        <div class="unauth-container">
          <h2>Error loading movies</h2>
          <p>Please try again later.</p>
        </div>
      </div>
    `;
    document.body.appendChild(errorDiv);
  }
}

function renderMovies() {
  const container = document.getElementById("moviesList");
  container.innerHTML = movies.map(movie => `
    <div class="movie-card">
      <img src="${movie.image_url}" alt="${movie.title}">
      <div class="movie-info">
        <h3>${movie.title}</h3>
        <p>${movie.release_year || (movie.release_date ? movie.release_date : "")}</p>
      </div>
      <div class="movie-actions">
        <button class="edit-btn" onclick="openMovieModal(${movie.id})">
          <img src="assets/icons/Edit.svg" alt="Edit">
        </button>
        <button class="delete-btn" onclick="openConfirmModal(${movie.id})">
          <img src="assets/icons/Trash.svg" alt="Delete">
        </button>
      </div>
    </div>
  `).join("");
}

function openMovieModal(movieId) {
  const modal = document.getElementById("movieModal");
  const modalTitle = document.getElementById("movieModalTitle");
  const form = document.getElementById("movieForm");
  if (movieId) {
    const movie = movies.find(m => m.id === movieId);
    if (!movie) return;
    modalTitle.textContent = "Edit Movie";
    document.getElementById("movieId").value = movie.id;
    document.getElementById("title").value = movie.title;
    document.getElementById("description").value = movie.description;
    document.getElementById("release_date").value = movie.release_date || "";
    document.getElementById("image_url").value = movie.image_url;
    document.getElementById("price").value = movie.price;
  } else {
    modalTitle.textContent = "New Movie";
    form.reset();
    document.getElementById("movieId").value = "";
  }
  modal.classList.remove("hidden");
}

function closeMovieModal() {
  document.getElementById("movieModal").classList.add("hidden");
}

async function submitMovieForm(e) {
  e.preventDefault();
  const movieId = document.getElementById("movieId").value;
  const payload = {
    title: document.getElementById("title").value,
    description: document.getElementById("description").value,
    release_date: document.getElementById("release_date").value,
    image_url: document.getElementById("image_url").value,
    price: document.getElementById("price").value
  };
  let url = `${API_BASE}/admin/movies/create`;
  if (movieId) {
    payload.id = movieId;
    url = `${API_BASE}/admin/movies/edit`;
  }
  try {
    const res = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.success) {
      closeMovieModal();
      openSuccessModal("Movie saved successfully!");
      await loadAdminMovies();
    } else {
      const container = document.querySelector(".container");
      container.innerHTML = `
        <div class="center-message">
          <div class="unauth-container">
            <h2>Error saving movie</h2>
            <p>Could not save the movie. Please try again.</p>
          </div>
        </div>
      `;
    }
  } catch (err) {
    const container = document.querySelector(".container");
    container.innerHTML = `
      <div class="center-message">
        <div class="unauth-container">
          <h2>Error saving movie</h2>
          <p>Could not save the movie. Please try again.</p>
        </div>
      </div>
    `;
  }
}

function openConfirmModal(movieId) {
  movieToDelete = movieId;
  document.getElementById("confirmModal").classList.remove("hidden");
}

function closeConfirmModal() {
  movieToDelete = null;
  document.getElementById("confirmModal").classList.add("hidden");
}

async function deleteMovieConfirmed() {
  if (!movieToDelete) return;
  try {
    const res = await fetch(`${API_BASE}/admin/movies/delete`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: movieToDelete })
    });
    const data = await res.json();
    if (data.success) {
      closeConfirmModal();
      openSuccessModal("Movie deleted successfully!");
      await loadAdminMovies();
    } else {
      const container = document.querySelector(".container");
      container.innerHTML = `
        <div class="center-message">
          <div class="unauth-container">
            <h2>Error deleting movie</h2>
            <p>Could not delete the movie. Please try again.</p>
          </div>
        </div>
      `;
      closeConfirmModal();
    }
  } catch (err) {
    const container = document.querySelector(".container");
    container.innerHTML = `
      <div class="center-message">
        <div class="unauth-container">
          <h2>Error deleting movie</h2>
          <p>Could not delete the movie. Please try again.</p>
        </div>
      </div>
    `;
    closeConfirmModal();
  }
}

function openSuccessModal(message) {
  const successModal = document.getElementById("successModal");
  document.getElementById("successMessage").textContent = message || "Operation completed successfully.";
  successModal.classList.remove("hidden");
}

function closeSuccessModal() {
  document.getElementById("successModal").classList.add("hidden");
}
