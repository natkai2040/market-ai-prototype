/**
 * Generates synthetic marketplace data for the collectible signals prototype.
 * Same schema as market_data.json: id, date, price, listing_type, condition, platform, description.
 */

const LISTING_TYPES = ["sale", "unsold", "auction", "obo"];
const CONDITIONS = ["Mint", "NM", "VG+", "VG", "G"];
const PLATFORMS = ["eBay", "Discogs", "Etsy", "Amazon", "Facebook Marketplace"];
const DESCRIPTIONS = [
  "Collector copy with sleeve wear",
  "Near mint pressing",
  "Auction bidding war",
  "Best offer accepted",
  "Clean copy with insert",
  "Vintage seller, sealed copy",
  "Third-party marketplace listing",
  "Rare variant",
  "OG pressing",
  "Hand-graded by seller",
  "Light ring wear",
  "Strong demand listing",
  "Price drop",
  "Multiple offers",
];

function seededRandom(seed) {
  return function () {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

function pick(arr, rng) {
  return arr[Math.floor(rng() * arr.length)];
}

function randomInRange(min, max, rng) {
  return min + rng() * (max - min);
}

/**
 * @param {Object} options
 * @param {number} [options.n=15] - Number of records
 * @param {string} [options.dateStart='2025-01-01']
 * @param {string} [options.dateEnd='2025-03-31']
 * @param {number} [options.priceMin=120]
 * @param {number} [options.priceMax=250]
 * @param {number} [options.seed] - Optional seed for reproducible data
 */
export function generateMarketData(options = {}) {
  const {
    n = 15,
    dateStart = "2025-01-01",
    dateEnd = "2025-03-31",
    priceMin = 120,
    priceMax = 250,
    seed,
  } = options;

  const rng = seed != null ? seededRandom(seed) : Math.random;
  const start = new Date(dateStart).getTime();
  const end = new Date(dateEnd).getTime();
  const out = [];

  for (let i = 0; i < n; i++) {
    const date = new Date(start + rng() * (end - start));
    const price = Math.round(randomInRange(priceMin, priceMax, rng));
    const listing_type = pick(LISTING_TYPES, rng);
    const condition = pick(CONDITIONS, rng);
    const platform = pick(PLATFORMS, rng);
    out.push({
      id: i + 1,
      date: date.toISOString().slice(0, 10),
      price,
      listing_type,
      condition,
      platform,
      description: pick(DESCRIPTIONS, rng),
    });
  }

  out.sort((a, b) => new Date(a.date) - new Date(b.date));
  out.forEach((d, i) => (d.id = i + 1));
  return out;
}
