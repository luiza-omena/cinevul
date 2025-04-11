document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("registerForm");
    if (form) {
      form.addEventListener("submit", registerUser);
    }
  });
  
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
      setTimeout(() => window.location.href = "login.html", 1000);
    } else {
      msg.textContent = "Erro ao cadastrar. Verifique os dados.";
    }
  }  