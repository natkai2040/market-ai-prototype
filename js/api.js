/**
 * Interpretation source: try LLM inference API (Ollama) first; fallback to rule-based.
 * No RAG — prompt + model inference only.
 */

import { interpret } from "./interpretationEngine.js";

const INFERENCE_API = window.INFERENCE_API_URL || "http://localhost:5000";

export async function fetchInterpretation(data) {
  const res = await fetch(`${INFERENCE_API}/interpret`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  const out = await res.json();
  return {
    summary: out.summary || "",
    evidence: Array.isArray(out.evidence) ? out.evidence : [],
    assumptions: Array.isArray(out.assumptions) ? out.assumptions : [],
    limitations: Array.isArray(out.limitations) ? out.limitations : [],
    alternatives: Array.isArray(out.alternatives) ? out.alternatives : [],
    plan: out.plan || "",
    reasoning_steps: Array.isArray(out.reasoning_steps) ? out.reasoning_steps : [],
    median: out.median,
    saleCount: out.saleCount,
    totalCount: out.totalCount,
  };
}

/** Get interpretation: LLM if API available, else rule-based. Same shape as interpret(). */
export async function getInterpretation(data) {
  try {
    return await fetchInterpretation(data);
  } catch {
    return interpret(data);
  }
}
