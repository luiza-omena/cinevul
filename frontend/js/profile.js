document.addEventListener("DOMContentLoaded", loadUserProfile);

async function loadUserProfile() {
  const res = await fetch(`${API_BASE}/profile`, { credentials: "include" });
  const data = await res.json();
  const userInfo = document.getElementById("userInfo");
  const userOrders = document.getElementById("userOrders");

  if (data.error) {
    userInfo.innerHTML = `<p>${data.error}</p>`;
    return;
  }

  const { user, orders } = data;

  userInfo.innerHTML = `
    <h3>${user.full_name}</h3>
    <p><strong>Usuário:</strong> ${user.username}</p>
    <p><strong>Nascimento:</strong> ${user.birth_date}</p>
  `;

  userOrders.innerHTML = orders.length === 0
    ? `<p style="text-align:center;color:#ccc;">Sem pedidos ainda.</p>`
    : orders.map(order => `
        <div class="order-card">
          <h3>#${order.order_id} - ${order.movie_title}</h3>
          <p>Quantidade: ${order.quantity}</p>
          <p>Tipo: ${order.type}</p>
          <p>Cadeiras: ${order.seats}</p>
          <p>Total: R$ ${order.total_price.toFixed(2)}</p>
        </div>
      `).join("");
}