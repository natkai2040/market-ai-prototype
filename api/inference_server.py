#!/usr/bin/env python3
"""
Inference API for the market-ai prototype. Uses a local LLM (Ollama) to generate
interpretations from marketplace data. No RAG — prompt + model inference only.
Fallback: return 503 so the frontend can use the rule-based engine.
"""
import json
import os
import re
import urllib.request
import urllib.error

# Default: Ollama on localhost; override with env OLLAMA_HOST
OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "llama3.2")
INFERENCE_TIMEOUT = int(os.environ.get("INFERENCE_TIMEOUT", "60"))


def _build_data_summary(data):
    """Turn market data into a compact text summary for the model."""
    if not data:
        return "No data."
    sales = [d for d in data if d.get("listing_type") == "sale"]
    unsold = [d for d in data if d.get("listing_type") == "unsold"]
    auctions = [d for d in data if d.get("listing_type") == "auction"]
    obo = [d for d in data if d.get("listing_type") == "obo"]
    prices = [d["price"] for d in data if "price" in d]
    if not prices:
        return "No price data."
    prices_sorted = sorted(prices)
    n = len(prices_sorted)
    median = (prices_sorted[(n - 1) // 2] + prices_sorted[n // 2]) / 2
    lines = [
        f"Total records: {len(data)}",
        f"Confirmed sales: {len(sales)}" + (f" (prices: {[s['price'] for s in sales]})" if sales else ""),
        f"Unsold listings: {len(unsold)}" + (f" (prices: {[u['price'] for u in unsold]})" if unsold else ""),
        f"Auctions: {len(auctions)}" + (f" (prices: {[a['price'] for a in auctions]})" if auctions else ""),
        f"Best-offer listings: {len(obo)}" + (f" (prices: {[o['price'] for o in obo]})" if obo else ""),
        f"Price range: ${min(prices)}–${max(prices)}, median ${round(median)}",
        f"Platforms: {', '.join(sorted(set(d.get('platform', '') for d in data)))}",
        f"Conditions: {', '.join(sorted(set(d.get('condition', '') for d in data)))}",
    ]
    return "\n".join(lines)


def _build_prompt(data_summary):
    return f"""You are an interpretative assistant for collectible marketplace data. Your role is to help users make sense of incomplete historical data. You must NOT recommend what to buy, what price is "correct," or what action to take. Only provide interpretation: surface what the data suggests, its limitations, and alternative ways to read it.

Given the following marketplace data summary:

---
{data_summary}
---

Respond with a single JSON object (no markdown, no code fence) with exactly these keys:
- "summary": one short paragraph (2-4 sentences) summarizing what the data suggests about price range and reliability. Mention specific numbers (e.g. median, sale count). Note limitations (e.g. few sales, sparse data).
- "evidence": array of 3-6 short strings, each one fact from the data (e.g. "Confirmed sales: 2 ($175, $180)", "Unsold listing: $160 (eBay)").
- "assumptions": array of 3-5 short strings stating assumptions behind the interpretation (e.g. "Auctions reflect collector demand", "Listings reflect seller expectations", "Condition affects price").
- "limitations": array of 2-5 short strings about data limitations (e.g. "Very few confirmed sales", "Small sample size", "Mixed conditions").
- "alternatives": array of 2-4 short strings, each an alternative explanation (e.g. "High auction price may reflect rarity rather than typical demand", "Unsold at $X may indicate overpricing or weak liquidity").

Output only the JSON object, no other text."""


def call_ollama(prompt, system=None):
    """Call Ollama /api/generate. Returns (response_text, error)."""
    body = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False,
    }
    if system:
        body["system"] = system
    req = urllib.request.Request(
        f"{OLLAMA_HOST.rstrip('/')}/api/generate",
        data=json.dumps(body).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=INFERENCE_TIMEOUT) as resp:
            out = json.loads(resp.read().decode("utf-8"))
            return (out.get("response") or "").strip(), None
    except urllib.error.HTTPError as e:
        return None, f"Ollama HTTP {e.code}: {e.reason}"
    except urllib.error.URLError as e:
        return None, f"Ollama unreachable: {e.reason}"
    except json.JSONDecodeError as e:
        return None, f"Invalid JSON from Ollama: {e}"
    except Exception as e:
        return None, str(e)


def extract_json(text):
    """Try to extract a JSON object from model output (handles markdown fences)."""
    text = (text or "").strip()
    # Remove optional markdown code block
    m = re.search(r"```(?:json)?\s*(\{[\s\S]*?\})\s*```", text)
    if m:
        text = m.group(1)
    else:
        # Find first { ... }
        start = text.find("{")
        if start != -1:
            depth = 0
            for i in range(start, len(text)):
                if text[i] == "{":
                    depth += 1
                elif text[i] == "}":
                    depth -= 1
                    if depth == 0:
                        text = text[start : i + 1]
                        break
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return None


def interpret_with_llm(data):
    """
    Run LLM inference on the given market data. Returns a dict with
    summary, evidence, assumptions, limitations, alternatives (same shape as rule-based engine),
    or None on failure.
    """
    data_summary = _build_data_summary(data)
    prompt = _build_prompt(data_summary)
    response, err = call_ollama(prompt)
    if err or not response:
        return None, err

    obj = extract_json(response)
    if not obj or not isinstance(obj, dict):
        return None, "Model did not return valid JSON"

    # Normalize to expected shape
    def ensure_list(x, default=None):
        if x is None:
            return default or []
        return x if isinstance(x, list) else [x]

    return {
        "summary": obj.get("summary") or "No summary generated.",
        "evidence": ensure_list(obj.get("evidence"), []),
        "assumptions": ensure_list(obj.get("assumptions"), []),
        "limitations": ensure_list(obj.get("limitations"), []),
        "alternatives": ensure_list(obj.get("alternatives"), ["Alternative view not generated."]),
        "median": None,
        "saleCount": sum(1 for d in data if d.get("listing_type") == "sale"),
        "totalCount": len(data),
    }, None


def main():
    """Run a minimal HTTP server that exposes POST /interpret."""
    from http.server import HTTPServer, BaseHTTPRequestHandler

    class InferenceHandler(BaseHTTPRequestHandler):
        def do_OPTIONS(self):
            self.send_response(204)
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
            self.send_header("Access-Control-Allow-Headers", "Content-Type")
            self.end_headers()

        def do_POST(self):
            if self.path != "/interpret":
                self.send_response(404)
                self.end_headers()
                return
            try:
                length = int(self.headers.get("Content-Length", 0))
                body = self.rfile.read(length) if length else b""
                payload = json.loads(body.decode("utf-8"))
                data = payload.get("data") or []
            except (ValueError, json.JSONDecodeError) as e:
                self._send_json(400, {"error": f"Invalid request: {e}"})
                return

            result, err = interpret_with_llm(data)
            if err:
                self._send_json(503, {"error": err, "fallback": True})
                return
            self._send_json(200, result)

        def _send_json(self, status, obj):
            self.send_response(status)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps(obj).encode("utf-8"))

        def log_message(self, format, *args):
            pass  # quiet

    port = int(os.environ.get("INFERENCE_PORT", "5000"))
    server = HTTPServer(("", port), InferenceHandler)
    print(f"Inference API at http://localhost:{port} (Ollama: {OLLAMA_HOST}, model: {OLLAMA_MODEL})")
    print("POST /interpret with JSON body: {\"data\": [...]}")
    server.serve_forever()


if __name__ == "__main__":
    main()
