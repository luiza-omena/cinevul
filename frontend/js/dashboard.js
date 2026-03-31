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
            <h2>Unauthorized access</h2>
            <p>This page is restricted to administrators.</p>
            <a class="login-btn" href="login.html">Sign in</a>
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
    console.error("Dashboard error:", err);
    const menuWrapper = document.querySelector(".menu-wrapper");
    const container = document.querySelector(".container");

    toggleAuthVisibility(false);
    menuWrapper.classList.add("hidden");
    container.classList.add("hidden");

    const errorDiv = document.createElement("div");
    errorDiv.innerHTML = `
      <div class="center-message">
        <div class="unauth-container">
          <h2>Error loading data</h2>
          <p>Please try again later.</p>
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
          label: "Revenue (R$)",
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
        labels: ["Users", "Orders", "Total Revenue (R$)"],
        datasets: [{
          label: "Totals",
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
          <h2>Monthly Revenue</h2>
          <div class="chart-error">Chart unavailable (Chart.js not loaded) - try another browser</div>
        </div>
        <div class="chart-wrapper">
          <h2>Statistics</h2>
          <div class="chart-error">Chart unavailable (Chart.js not loaded) - try another browser</div>
        </div>
      `;
    }
  }
  