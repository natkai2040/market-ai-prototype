import { drawChart } from "./chart.js";
import { drawLegend } from "./legend.js";
import { loadAI } from "./ai_panel.js";
import { getInterpretation } from "./api.js";
import { generateMarketData } from "./dataGenerator.js";

const params = new URLSearchParams(window.location.search);
const condition = params.get("condition") || "control";

let currentData = [];

async function loadDemoData() {
  const data = await fetch("data/market_data.json").then((r) => r.json());
  return data;
}

async function render(data) {
  currentData = data;
  drawChart(data);
  drawLegend(data);
  checkSparsity(data);
  setupRawTable(data);

  const panel = document.getElementById("interpretation");
  if (panel) {
    panel.innerHTML = "<p class=\"interpretation-loading\">Loading interpretation…</p>";
  }
  const interpretation = await getInterpretation(data);
  loadAI(condition, interpretation);
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

let rawTableListenerAdded = false;

function setupRawTable(data) {
  const toggleBtn = document.getElementById("toggle-table");
  const tableContainer = document.getElementById("raw-table");

  if (!toggleBtn || !tableContainer) return;

  let visible = false;

  function renderTable() {
    tableContainer.innerHTML = "";
    const columns = [
      "id",
      "date",
      "price",
      "listing_type",
      "condition",
      "platform",
      "description",
    ];
    const table = d3
      .select(tableContainer)
      .append("table")
      .attr("class", "raw-transaction-table");

    table
      .append("thead")
      .append("tr")
      .selectAll("th")
      .data(columns)
      .join("th")
      .text((d) => d.replace(/_/g, " "));

    table
      .append("tbody")
      .selectAll("tr")
      .data(currentData)
      .join("tr")
      .selectAll("td")
      .data((d) => columns.map((c) => d[c]))
      .join("td")
      .text((d) => (d != null ? String(d) : ""));
  }

  if (!rawTableListenerAdded) {
    rawTableListenerAdded = true;
    toggleBtn.addEventListener("click", () => {
      visible = !visible;
      tableContainer.classList.toggle("hidden", !visible);
      toggleBtn.textContent = visible
        ? "Hide raw transaction table"
        : "Show raw transaction table";
      if (visible) renderTable();
    });
  }

  if (!tableContainer.classList.contains("hidden") && tableContainer.querySelector("table")) {
    renderTable();
  }
}

function setupDataControls() {
  const container = document.getElementById("data-controls");
  if (!container) return;

  container.innerHTML = `
    <div class="data-source-label">Data source</div>
    <div class="data-source-buttons">
      <button type="button" id="load-demo">Use demo data</button>
      <button type="button" id="gen-random">Generate random data</button>
    </div>
    <p class="data-source-hint">Demo data is fixed. Random data is regenerated each time (same schema).</p>
  `;

  document.getElementById("load-demo").addEventListener("click", async () => {
    const data = await loadDemoData();
    await render(data);
  });

  document.getElementById("gen-random").addEventListener("click", async () => {
    const data = generateMarketData({ n: 18, seed: Date.now() % 1e6 });
    await render(data);
  });
}

async function init() {
  const data = await loadDemoData();
  setupDataControls();
  render(data);
}

init();
