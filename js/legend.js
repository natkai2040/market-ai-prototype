const CONDITION_COLORS = {
  Mint: "green",
  NM: "blue",
  "VG+": "orange",
  VG: "red",
  G: "gray",
};

const PLATFORM_COLORS = {
  eBay: "#e53238",
  Discogs: "#2d2d2d",
};

function getSymbol(type) {
  if (type === "sale") return "●";
  if (type === "unsold") return "○";
  if (type === "auction") return "▲";
  if (type === "obo") return "◆";
  return "●";
}

function getColor(cond) {
  return CONDITION_COLORS[cond] || "gray";
}

export function drawLegend(data) {
  const container = d3.select("#legend").html("");

  const listingTypes = [...new Set(data.map((d) => d.listing_type))];
  const conditions = [...new Set(data.map((d) => d.condition))];
  const platforms = [...new Set(data.map((d) => d.platform))];

  const shapeLegend = container.append("div").attr("class", "legend-block");
  shapeLegend.append("div").text("Listing type");
  listingTypes.forEach((type) => {
    const item = shapeLegend.append("div").attr("class", "legend-item");
    item.append("span").attr("class", "legend-symbol").text(getSymbol(type));
    item.append("span").text(type);
  });

  const colorLegend = container.append("div").attr("class", "legend-block");
  colorLegend.append("div").text("Condition");
  conditions.forEach((cond) => {
    const item = colorLegend.append("div").attr("class", "legend-item");
    item
      .append("span")
      .attr("class", "legend-symbol")
      .style("background", getColor(cond))
      .style("border-radius", "2px");
    item.append("span").text(cond);
  });

  const platformLegend = container.append("div").attr("class", "legend-block");
  platformLegend.append("div").text("Platform (outline)");
  platforms.forEach((platform) => {
    const item = platformLegend.append("div").attr("class", "legend-item");
    item
      .append("span")
      .attr("class", "legend-symbol")
      .style("background", "transparent")
      .style("border", `2px solid ${PLATFORM_COLORS[platform] || "#666"}`);
    item.append("span").text(platform);
  });
}

export { getColor, getSymbol, CONDITION_COLORS, PLATFORM_COLORS };
