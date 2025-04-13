document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch(`${API_BASE}/admin/stats`, { credentials: "include" });
    const data = await res.json();
    const menuWrapper = document.querySelector(".menu-wrapper");
    const container = document.querySelector(".container");

    if (data.error) {
      toggleAuthVisibility(false);
      menuWrapper.classList.add("hidden");
      container.classList.add("hidden");

      const errorDiv = document.createElement("div");
      errorDiv.innerHTML = `
        <div class="center-message">
          <div class="unauth-container">
            <h2>Acesso não autorizado</h2>
            <p>Esta página é restrita a administradores.</p>
            <a class="login-btn" href="login.html">Fazer login</a>
          </div>
        </div>
      `;
      document.body.appendChild(errorDiv);
      return;
    }

    toggleAuthVisibility(true);

    if (typeof Chart !== "undefined") {
      renderRevenueChart(data.monthlyRevenue);
      renderStatsChart(data.totals);
    } else {
      renderChartFallback();
    }

  } catch (err) {
    console.error("Erro no dashboard:", err);
    const menuWrapper = document.querySelector(".menu-wrapper");
    const container = document.querySelector(".container");

    toggleAuthVisibility(false);
    menuWrapper.classList.add("hidden");
    container.classList.add("hidden");

    const errorDiv = document.createElement("div");
    errorDiv.innerHTML = `
      <div class="center-message">
        <div class="unauth-container">
          <h2>Erro ao carregar dados</h2>
          <p>Tente novamente mais tarde.</p>
        </div>
      </div>
    `;
    document.body.appendChild(errorDiv);
  }
});
  
  function renderRevenueChart(monthlyRevenue) {
    const ctx = document.getElementById("revenueChart").getContext("2d");
    new Chart(ctx, {
      type: "line",
      data: {
        labels: monthlyRevenue.map(item => item.month),
        datasets: [{
          label: "Faturamento (R$)",
          data: monthlyRevenue.map(item => item.total),
          borderColor: "#e50914",
          backgroundColor: "rgba(229,9,20,0.2)",
          fill: true,
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: { display: false }
        }
      }
    });
  }
  
  function renderStatsChart(totals) {
    const ctx = document.getElementById("statsChart").getContext("2d");
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Usuários", "Pedidos", "Faturamento Total (R$)"],
        datasets: [{
          label: "Totais",
          data: [totals.users, totals.orders, totals.revenue],
          backgroundColor: ["#e50914", "#bf0810", "#8c0606"]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: { display: false }
        },
        scales: { y: { beginAtZero: true } }
      }
    });
  }
  
  function renderChartFallback() {
    const chartsContainer = document.querySelector(".charts-container");
  
    if (chartsContainer) {
      chartsContainer.innerHTML = `
        <div class="chart-wrapper">
          <h2>Faturamento Mensal</h2>
          <div class="chart-error">Gráfico não disponível (Chart.js não carregado) - tente outro navegador</div>
        </div>
        <div class="chart-wrapper">
          <h2>Estatísticas</h2>
          <div class="chart-error">Gráfico não disponível (Chart.js não carregado) - tente outro navegador</div>
        </div>
      `;
    }
  }
  