# Collectible Market Signals

A research-style prototype for visualizing collectible marketplace data with event-based charts, condition/listing encoding, uncertainty bands, and configurable AI explanation panels. Suitable for CHI-style studies (e.g. control vs inspectable vs contestable conditions).

## Features

- **Event-based D3 chart**: Time series of prices with:
  - **Shapes by listing type**: circle (sale/unsold), triangle (auction), diamond (obo)
  - **Fill by condition**: color scale for Mint / NM / VG+ / VG / G
  - **Outline by platform**: eBay vs Discogs (marketplace comparison)
  - **Median price line**: dashed horizontal line with label
  - **Uncertainty band**: “Possible market range” shaded area
- **Auto-generated legends** for listing type, condition, and platform
- **Hover tooltips** with price, type, condition, platform, description
- **Sparse data warning** when there are fewer than 3 sales
- **Raw transaction table**: toggle to show/hide a table of all records
- **AI panel** (three conditions via `?condition=`):
  - `control`: short AI summary
  - `inspectable`: evidence, assumptions, limitations
  - `contestable`: user text area + submit, then AI response

## Project structure

```
market-ai-prototype/
├── index.html
├── style.css
├── server.py
├── README.md
├── js/
│   ├── main.js      # init, sparsity check, raw table toggle
│   ├── chart.js     # D3 chart, uncertainty, median, tooltips
│   ├── legend.js    # dynamic legends (type, condition, platform)
│   └── ai_panel.js  # condition-based AI content
└── data/
    └── market_data.json
```

## Run locally

**Requires:** Python 3 (for the built-in HTTP server; avoids CORS when loading `data/market_data.json`).

```bash
cd market-ai-prototype
python server.py
```

Then open:

- **Default:**  
  http://localhost:8000

- **Experiment conditions:**
  - http://localhost:8000/?condition=control
  - http://localhost:8000/?condition=inspectable
  - http://localhost:8000/?condition=contestable

## Data format

`data/market_data.json` is an array of objects with:

- `id`, `date`, `price`, `listing_type`, `condition`, `platform`, `description`

Listing types used in the chart: `sale`, `unsold`, `auction`, `obo`. Condition and platform are used for encoding and legends.

## Publishing to GitHub

To publish this prototype as its own repository:

```bash
cd market-ai-prototype
git init
git add .
git commit -m "Initial commit: collectible market signals prototype"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/market-ai-prototype.git
git push -u origin main
```

Create the repository on GitHub first (empty, no README), then run the commands above. Everyone can clone and run with `python server.py` after cloning.

## License

Use and adapt as needed for research or teaching. No warranty.
