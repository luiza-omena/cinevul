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
  
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
  
    const data = await res.json();
    const msg = document.getElementById("loginMsg");
  
    if (data.success) {
      msg.textContent = "Login realizado com sucesso!";
      msg.className = "success-msg";
      setTimeout(() => window.location.href = "movies.html", 200);
    } else {
      msg.textContent = "Usuário ou senha incorretos.";
      msg.className = "error-msg";
    }
  }  