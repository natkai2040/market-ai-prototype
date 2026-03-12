import { drawChart } from "./chart.js";
import { drawLegend } from "./legend.js";
import { loadAI } from "./ai_panel.js";

const params = new URLSearchParams(window.location.search);
const condition = params.get("condition") || "control";

async function init() {
  const data = await d3.json("data/market_data.json");

  drawChart(data);
  drawLegend(data);
  loadAI(condition);
  checkSparsity(data);
  setupRawTable(data);
}

function checkSparsity(data) {
  const sales = data.filter((d) => d.listing_type === "sale");
  const warningEl = document.getElementById("warning");
  if (sales.length < 3) {
    warningEl.innerHTML =
      "⚠ Sparse transaction data — interpretation may be unreliable.";
  } else {
    warningEl.innerHTML = "";
  }
}

function setupRawTable(data) {
  const toggleBtn = document.getElementById("toggle-table");
  const tableContainer = document.getElementById("raw-table");

  if (!toggleBtn || !tableContainer) return;

  let visible = false;

  function renderTable() {
    tableContainer.innerHTML = "";
    const columns = ["id", "date", "price", "listing_type", "condition", "platform", "description"];
    const table = d3
      .select(tableContainer)
      .append("table")
      .attr("class", "raw-transaction-table");

    table.append("thead").append("tr").selectAll("th").data(columns).join("th").text((d) => d.replace(/_/g, " "));

    table
      .append("tbody")
      .selectAll("tr")
      .data(data)
      .join("tr")
      .selectAll("td")
      .data((d) => columns.map((c) => d[c]))
      .join("td")
      .text((d) => (d != null ? String(d) : ""));
  }

  toggleBtn.addEventListener("click", () => {
    visible = !visible;
    tableContainer.classList.toggle("hidden", !visible);
    toggleBtn.textContent = visible ? "Hide raw transaction table" : "Show raw transaction table";
    if (visible && !tableContainer.querySelector("table")) {
      renderTable();
    }
  });
}

init();
