# Collectible Market Signals

A research-style prototype for visualizing collectible marketplace data with event-based charts, condition/listing encoding, uncertainty bands, and configurable AI explanation panels. Suitable for CHI-style studies (e.g. control vs inspectable vs contestable conditions).

## Features

- **Event-based D3 chart**: Time series of prices with:
  - **Shapes by listing type**: circle (sale/unsold), triangle (auction), diamond (obo)
  - **Fill by condition**: color scale for Mint / NM / VG+ / VG / G
  - **Outline by platform**: marketplace comparison (eBay, Discogs, Etsy, Amazon, etc.; any platform gets a distinct color from the palette)
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

Listing types used in the chart: `sale`, `unsold`, `auction`, `obo`. Condition and platform are used for encoding and legends. Add any platforms you need in the data; each gets a distinct outline color (known ones like eBay, Discogs, Etsy, Amazon have fixed colors; others use the palette).

## Publishing to GitHub

### Option A: Create the repo on GitHub first, then push

1. **Create the repo in your browser**  
   - Open **[github.com/new](https://github.com/new)**  
   - Repository name: `market-ai-prototype` (or any name you like)  
   - Leave **“Add a README”** and **“.gitignore”** **unchecked** (empty repo)  
   - Click **Create repository**

2. **Confirm the repo exists**  
   - Visit `https://github.com/TomWang22/market-ai-prototype` (use your real username).  
   - If you get 404, the repo wasn’t created or the name/owner is different.

3. **Push from your machine** (from inside `market-ai-prototype`):

```bash
git remote set-url origin https://github.com/TomWang22/market-ai-prototype.git
git push -u origin main
```

If your GitHub username or repo name is different, use that URL. Replace `TomWang22` with your actual username.

### Option B: Create repo and push in one step (GitHub CLI)

If you have [GitHub CLI](https://cli.github.com/) installed and logged in (`gh auth login`):

```bash
cd market-ai-prototype
gh repo create market-ai-prototype --public --source=. --remote=origin --push
```

That creates the repo on GitHub and pushes `main` for you.

### If you still get “Repository not found”

- **Wrong username:** Your GitHub profile URL is `https://github.com/USERNAME` — use that `USERNAME` in the remote URL.  
- **Wrong repo name:** Use the exact name shown on the repo page.  
- **Not logged in:** Run `gh auth login` or ensure Git has credentials (e.g. credential helper or SSH key).  
- **Private repo + HTTPS:** Try `gh auth login` or switch to SSH:  
  `git remote set-url origin git@github.com:TomWang22/market-ai-prototype.git` then `git push -u origin main`.

## License

Use and adapt as needed for research or teaching. No warranty.
