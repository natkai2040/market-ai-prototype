import { CONDITION_COLORS, PLATFORM_COLORS } from "./legend.js";

function symbolType(type) {
  if (type === "sale") return d3.symbolCircle;
  if (type === "unsold") return d3.symbolCircle;
  if (type === "auction") return d3.symbolTriangle;
  if (type === "obo") return d3.symbolDiamond;
  return d3.symbolCircle;
}

export function drawChart(data) {
  const width = 800;
  const height = 420;

  const svg = d3
    .select("#chart")
    .html("")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const x = d3
    .scaleTime()
    .domain(d3.extent(data, (d) => new Date(d.date)))
    .range([70, width - 40]);

  const yMin = d3.min(data, (d) => d.price) - 20;
  const yMax = d3.max(data, (d) => d.price) + 20;

  const y = d3
    .scaleLinear()
    .domain([yMin, yMax])
    .range([height - 60, 40]);

  svg
    .append("g")
    .attr("transform", `translate(0,${height - 60})`)
    .call(d3.axisBottom(x));

  svg.append("g").attr("transform", "translate(70,0)").call(d3.axisLeft(y));

  const tooltip = d3.select("#tooltip");

  const conditionOrder = ["Mint", "NM", "VG+", "VG", "G"];
  const colorScale = d3
    .scaleOrdinal()
    .domain(conditionOrder)
    .range(conditionOrder.map((c) => CONDITION_COLORS[c] || "gray"));

  drawUncertainty(svg, data, y, width, height);

  drawMedianLine(svg, data, x, y, width);

  svg
    .selectAll("path.point")
    .data(data)
    .enter()
    .append("path")
    .attr("class", "point")
    .attr(
      "transform",
      (d) => `translate(${x(new Date(d.date))},${y(d.price)})`
    )
    .attr("d", (d) =>
      d3.symbol().type(symbolType(d.listing_type)).size(120)()
    )
    .attr("fill", (d) => colorScale(d.condition))
    .attr("stroke", (d) => PLATFORM_COLORS[d.platform] || "#333")
    .attr("stroke-width", 2)
    .on("mouseover", (event, d) => {
      tooltip
        .style("opacity", 1)
        .html(
          `<b>$${d.price}</b><br>Type: ${d.listing_type}<br>Condition: ${d.condition}<br>Platform: ${d.platform}<br>${d.description}`
        );
    })
    .on("mousemove", (event) => {
      tooltip
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY + 10 + "px");
    })
    .on("mouseout", () => {
      tooltip.style("opacity", 0);
    });
}

function drawUncertainty(svg, data, y, width, height) {
  const prices = data.map((d) => d.price);
  const min = d3.min(prices);
  const max = d3.max(prices);

  svg
    .append("rect")
    .attr("x", 70)
    .attr("width", width - 110)
    .attr("y", y(max))
    .attr("height", y(min) - y(max))
    .attr("fill", "gray")
    .attr("opacity", 0.1);

  svg
    .append("text")
    .attr("x", 75)
    .attr("y", y(max) - 5)
    .attr("class", "chart-uncertainty-label")
    .text("Possible market range");
}

function drawMedianLine(svg, data, x, y, width) {
  const prices = data.map((d) => d.price).sort((a, b) => a - b);
  const median =
    prices.length % 2 === 0
      ? (prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2
      : prices[Math.floor(prices.length / 2)];

  const medianY = y(median);

  svg
    .append("line")
    .attr("class", "chart-median-line")
    .attr("x1", 70)
    .attr("x2", width - 40)
    .attr("y1", medianY)
    .attr("y2", medianY)
    .attr("stroke", "#333")
    .attr("stroke-width", 1.5);

  svg
    .append("text")
    .attr("x", width - 38)
    .attr("y", medianY - 4)
    .attr("class", "chart-uncertainty-label")
    .attr("text-anchor", "start")
    .text(`Median $${Math.round(median)}`);
}
