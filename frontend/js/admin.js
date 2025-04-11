const API_BASE = "http://localhost:8000";

document.addEventListener("DOMContentLoaded", async () => {
    const res = await fetch("http://localhost:8000/admin/orders", {
      credentials: "include"
    });
    const orders = await res.json();

    const html = orders.map(o => `
      <div class="order-card">
        <h3>Order #${o.id}</h3>
        <p><strong>Movie:</strong> ${o.movie_title}</p>
        <p><strong>User:</strong> ${o.username}</p>
        <p><strong>Quantity:</strong> ${o.quantity}</p>
        <p><strong>Type:</strong> ${o.type}</p>
        <p><strong>Seats:</strong> ${o.seats}</p>
        <p><strong>Total Price:</strong> R$ ${o.total_price.toFixed(2)}</p>
        <p><strong>Proof:</strong> ${o.proof}</p>
      </div>
    `).join("");

    document.open();
    document.write(`
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Admin - Orders</title>
        <link rel="stylesheet" href="css/movies.css">
        <link rel="stylesheet" href="css/admin.css">
      </head>
      <body>
        <div class="container">
          <h1>Orders</h1>
          ${html}
        </div>
      </body>
      </html>
    `);
    document.close();
  });