# Collectible Market Signals

A research-style prototype for **AI-assisted marketplace interpretation**: it helps users make sense of incomplete historical data while preserving their ability to think independently. The system supports **interpretation, not recommendation** — it does not tell users what to buy, what price is "correct," or what action to take. Instead it surfaces assumptions, limitations, uncertainty, and alternative explanations. Suitable for CHI-style studies comparing opaque, inspectable, and contestable conditions.

## Design principle

Interpretations avoid authoritative single answers. For example, instead of "This item is worth $180," the system might say: *"Recent sales suggest a higher price range, but this conclusion is based on only two transactions and may reflect item rarity rather than stable demand. Unsold listings at lower prices may indicate weak liquidity, overpricing, or differences in item condition."*

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
- **Data source**: Fixed demo dataset or **random data generator** (configurable n, optional seed)
- **AI interpretation**: A **proper LLM** (Ollama) is used when the inference API is running — **Structured Chain of Thought (SCoT)** reasoning: the model returns a `plan`, `reasoning_steps`, `summary`, `evidence`, `assumptions`, `limitations`, and `alternatives`. Prompt + model inference only, no RAG. If the API is unavailable, the frontend falls back to a rule-based engine.
- **Raw transaction table**: toggle to show/hide
- **AI panel** (three conditions via `?condition=`):
  - **control**: opaque summary only
  - **inspectable**: full interpretation with evidence, assumptions, limitations, alternative view
  - **contestable**: user records interpretation first (cognitive forcing); then reveal/hide AI, request alternative, expand sections, link to raw data
- **Refreshed UI**: Typography (DM Sans), clear sections, section dividers (accent line + background) in the interpretation panel for Plan / Reasoning / Evidence / Assumptions / Limitations

## How to set up

1. **Clone or download** the repo and open a terminal in the project folder.
2. **Static app only (no LLM):**  
   Run `python3 server.py` and open http://localhost:8000. The app uses the built-in rule-based interpretation and works offline.
3. **With LLM (Ollama):**  
   Install Ollama (see [Real model setup (Ollama)](#real-model-setup-ollama)), run `ollama pull llama3.2`, start Ollama (`brew services start ollama` on macOS), then in a **second** terminal run `python3 api/inference_server.py`. Keep `python3 server.py` running in the first. Open http://localhost:8000 — the app will use the LLM when the inference API is reachable.
4. **Stop Ollama when not testing:**  
   On macOS: `brew services stop ollama`. The app will fall back to the rule-based engine with no error.

## How to use

- **Data:** Use “Use demo data” for the fixed dataset, or “Generate random data” for synthetic listings. Toggle “Show raw transaction table” to inspect records.
- **Chart:** Points are shaped by listing type (circle/triangle/diamond), filled by condition, and outlined by platform. The dashed line is the median price; the shaded band is the possible market range.
- **Interpretation:** Depends on the URL condition:
  - **control** (`?condition=control`): Short summary only.
  - **inspectable** (`?condition=inspectable`): Full interpretation with Plan, Reasoning steps (when from LLM), Summary, Evidence, Assumptions, Limitations, Alternative view.
  - **contestable** (`?condition=contestable`): You must record your own interpretation in the text area and submit before the system’s interpretation is shown; then you can show/hide it, request another alternative, expand assumptions/limitations, and open the raw data table.

## Project structure

```
market-ai-prototype/
├── index.html
├── style.css
├── server.py
├── package.json
├── api/
│   └── inference_server.py   # LLM inference API (Ollama)
├── js/
│   ├── main.js
│   ├── chart.js
│   ├── legend.js
│   ├── ai_panel.js
│   ├── api.js               # fetch interpretation (API or fallback)
│   ├── interpretationEngine.js  # rule-based fallback
│   └── dataGenerator.js
├── data/
│   ├── market_data.json
│   └── scot_test_listings.json   # SCoT example payload (listings only)
└── tests/
    ├── interpretation_engine.test.js
    └── test_inference_api.py
```

## Run locally

**Requires:** Python 3 (for the static server; optional: Ollama for LLM interpretation).

1. **Static app (always works, uses rule-based interpretation):**
   ```bash
   cd market-ai-prototype
   python server.py
   ```
   Open http://localhost:8000

2. **With LLM interpretation (Ollama):**  
   See **[Real model setup (Ollama)](#real-model-setup-ollama)** below for install, model pull, and running the inference API. In short: install Ollama, run `ollama pull llama3.2`, then in a second terminal:
   ```bash
   cd market-ai-prototype
   python api/inference_server.py
   ```
   Keep the static server running on port 8000. The app will call `http://localhost:5000/interpret`; if that fails, it falls back to the rule-based engine.

Then open:

- **Default:**  
  http://localhost:8000

- **Experiment conditions:**
  - http://localhost:8000/?condition=control
  - http://localhost:8000/?condition=inspectable
  - http://localhost:8000/?condition=contestable

## Real model setup (Ollama)

To use the **LLM** for interpretations (instead of the rule-based fallback), you need Ollama and a model running locally. No API keys, no RAG, no tuning — just prompt + model inference.

### 1. Install Ollama

If `ollama` is not in your PATH, install it first:

- **macOS:** Download the installer from [ollama.com](https://ollama.com) or run:
  ```bash
  brew install ollama
  ```
- **Windows:** Download the installer from [ollama.com/download](https://ollama.com/download).
- **Linux:** See [ollama.com/download/linux](https://ollama.com/download/linux) or:
  ```bash
  curl -fsSL https://ollama.com/install.sh | sh
  ```

Then start the Ollama service (it may start automatically after install). On macOS with the app, the menu bar icon indicates it’s running. **To stop Ollama when you’re not testing:** run `brew services stop ollama` (macOS); the app will use the rule-based engine instead.

### 2. Pull a model

In a terminal, pull a model the inference API uses for **Structured Chain of Thought** (default is `llama3.2`):

```bash
ollama pull llama3.2
```

Other options that work well: `ollama pull llama3.1`, `ollama pull mistral`, `ollama pull phi3`. To use a different model, set `OLLAMA_MODEL` when starting the inference server (see below).

### 3. Start the inference API

From the project root, in a **second** terminal (leave the static server running in the first):

```bash
cd market-ai-prototype
python3 api/inference_server.py
```

You should see something like:

```
Inference API at http://localhost:5000 (Ollama: http://localhost:11434, model: llama3.2)
POST /interpret with JSON body: {"data": [...]}
```

### 4. Use the app

With both servers running:

- **Terminal 1:** `python3 server.py` → http://localhost:8000  
- **Terminal 2:** `python3 api/inference_server.py` → serves `/interpret` on port 5000  

Open http://localhost:8000 and load or generate data. The interpretation panel will show “Loading interpretation…” then the **model’s** output: when using the LLM you’ll see **Plan**, **Reasoning steps**, **Summary**, **Evidence**, **Assumptions**, **Limitations**, and **Alternative view(s)**. If the inference API is not reachable (e.g. Ollama not running), the app falls back to the rule-based engine with no error.

### Optional: environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `OLLAMA_HOST` | `http://localhost:11434` | Ollama API base URL |
| `OLLAMA_MODEL` | `llama3.2` | Model name to use for generation |
| `INFERENCE_PORT` | `5000` | Port for the inference API server |
| `INFERENCE_TIMEOUT` | `90` | Timeout in seconds for Ollama requests |

Example with a different model:

```bash
OLLAMA_MODEL=mistral python3 api/inference_server.py
```

## SCoT (Structured Chain of Thought) prompt

The inference API asks the model to reason step-by-step and return JSON with:

- **plan** — How the model will solve the problem  
- **reasoning_steps** — Ordered list of reasoning steps  
- **summary** — Market value summary (e.g. “Recent market signals suggest a typical value around $X”)  
- **evidence** — Facts supporting the summary (max 6)  
- **assumptions** — Assumptions made (max 5)  
- **limitations** — Data/sample limitations (max 5)  
- **alternatives** — Alternative explanations  

Listing fields sent to the model: **Listing type** (Unsold, Sale, Auction, obo), **Condition** (G, VG, VG+, NM, M), **Platform** (eBay, Discogs, Etsy, Amazon), **Date** (MM-DD-YYYY), **Price** (USD). Example payload shape: `data/scot_test_listings.json` (use the `listings` array; the app sends the same schema from `market_data.json` with dates converted to MM-DD-YYYY).

## Data format

`data/market_data.json` is an array of objects with:

- `id`, `date`, `price`, `listing_type`, `condition`, `platform`, `description`

Listing types used in the chart: `sale`, `unsold`, `auction`, `obo`. Condition and platform are used for encoding and legends. Add any platforms you need in the data; each gets a distinct outline color (known ones like eBay, Discogs, Etsy, Amazon have fixed colors; others use the palette).

## Tests

- **Rule-based engine (Node):** `node tests/interpretation_engine.test.js` — checks output shape and that summary/evidence are data-driven (e.g. prices and counts from the data appear in the interpretation).
- **Inference API (Python):** `python3 -m unittest discover -s tests -v` — tests data summary building, JSON extraction from model output, and that `interpret_with_llm` returns the expected structure (or a clear error when Ollama is not available).

Or run both: `npm test` (requires Node and Python 3).

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
