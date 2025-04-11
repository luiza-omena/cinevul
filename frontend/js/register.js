async function registerUser(e) {
  e.preventDefault();
  const msg = document.getElementById("registerMsg");
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const full_name = document.getElementById("full_name").value;
  const birth_date = document.getElementById("birth_date").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const favorite_color = document.getElementById("favorite_color").value;
  const birth_year = document.getElementById("birth_year").value;
  const first_school = document.getElementById("first_school").value;

  const birthDateValue = new Date(birth_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (birthDateValue >= today) {
    msg.textContent = "Data de nascimento inválida.";
    msg.className = "error-msg";
    return;
  }

  const senha = password;

  const hasUpperCase = /[A-Z]/.test(senha);
  const hasSpecialChar = /[\W_]/.test(senha);
  const isLongEnough = senha.length >= 8;
  const hasForbiddenSequence = /(123|111|222|333|444|555|666|777|888|999)/.test(senha);

  if (!hasUpperCase || !hasSpecialChar || !isLongEnough || hasForbiddenSequence) {
    msg.textContent = "Senha fraca. Use ao menos 8 caracteres, uma letra maiúscula e um símbolo. Evite sequências e números iguais.";
    msg.className = "error-msg";
    return;
  }

  const res = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username, password, full_name, birth_date,
      email, phone, favorite_color, birth_year, first_school
    })
  });

  const data = await res.json();

  if (data.success) {
    msg.textContent = "Cadastro realizado com sucesso!";
    msg.className = "success-msg";
    setTimeout(() => window.location.href = "login.html", 300);
  } else {
    msg.textContent = data.error || "Erro ao cadastrar. Verifique os dados.";
    msg.className = "error-msg";
  }  
}

document.getElementById("phone").addEventListener("input", function (e) {
  let value = e.target.value.replace(/\D/g, "");
  if (value.length > 11) value = value.slice(0, 11);

  const formatted = value.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3")
                         .replace(/^(\d{2})(\d{4})(\d{0,4})$/, "($1) $2-$3");
  e.target.value = formatted;
});