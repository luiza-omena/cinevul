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