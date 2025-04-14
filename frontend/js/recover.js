const recoverForm = document.getElementById("recoverForm");
const newPasswordForm = document.getElementById("newPasswordForm");
const msg = document.getElementById("recoverMsg");
const title = document.getElementById("pageTitle");
const confirmation = document.getElementById("confirmationMessage");
let verifiedUsername = "";

recoverForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    username: document.getElementById("username").value,
    favorite_color: document.getElementById("favorite_color").value,
    birth_year: document.getElementById("birth_year").value,
    first_school: document.getElementById("first_school").value
  };

  const res = await fetch(`${API_BASE}/recover/verify`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  const result = await res.json();

  if (result.success) {
    verifiedUsername = data.username;
    recoverForm.classList.add("hidden");
    msg.classList.add("hidden");
    newPasswordForm.classList.remove("hidden");
    msg.textContent = "";
  } else {
    if (result.error === "user_not_found") {
      msg.textContent = "Usuário não encontrado.";
    } else if (result.error === "invalid_answers") {
      msg.textContent = "Informações incorretas!";
    } else {
      msg.textContent = "Erro desconhecido.";
    }
    msg.className = "error-msg";
  }  
});

newPasswordForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const password = document.getElementById("new_password").value;

  const hasUpper = /[A-Z]/.test(password);
  const hasSpecial = /[\W_]/.test(password);
  const isLong = password.length >= 8;
  const forbidden = /(123|111|222|333|444|555|666|777|888|999)/.test(password);

  if (!hasUpper || !hasSpecial || !isLong || forbidden) {
    msg.textContent = "Senha fraca. Use ao menos 8 caracteres, 1 maiúscula e 1 símbolo. Evite sequências.";
    msg.className = "error-msg";
    return;
  }

  const res = await fetch(`${API_BASE}/recover/reset`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: verifiedUsername, password })
  });

  const result = await res.json();

  if (result.success) {
    msg.classList.add("hidden");
    title.classList.add("hidden");
    newPasswordForm.classList.add("hidden");
    msg.textContent = "";
    confirmation.classList.remove("hidden");
    setTimeout(() => window.location.href = "login.html", 300);
  } else {
    msg.textContent = "Erro ao redefinir a senha.";
    msg.className = "error-msg";
  }
});