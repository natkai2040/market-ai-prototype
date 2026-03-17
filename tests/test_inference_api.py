"""
Tests for the inference API: data summary building, JSON extraction, and (optionally) LLM call.
No RAG — prompt + model only.
"""
import json
import os
import sys
import unittest

# Add api dir so we can import inference_server
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "api"))

from inference_server import (
    _build_listing_data,
    extract_json,
    interpret_with_llm,
)


class TestBuildListingData(unittest.TestCase):
    def test_normal(self):
        data = [
            {"id": 1, "date": "2025-01-10", "price": 160, "listing_type": "unsold", "condition": "VG", "platform": "eBay"},
            {"id": 2, "date": "2025-02-05", "price": 175, "listing_type": "sale", "condition": "NM", "platform": "Discogs"},
        ]
        listing_data = _build_listing_data(data)
        self.assertIn("160", listing_data)
        self.assertIn("175", listing_data)
        self.assertIn("sale", listing_data)
        self.assertIn("eBay", listing_data)
        self.assertIn("Discogs", listing_data)
        self.assertIn("01-10-2025", listing_data)  # MM-DD-YYYY

    def test_empty(self):
        self.assertEqual(_build_listing_data([]), "[]")


class TestExtractJson(unittest.TestCase):
    def test_raw(self):
        text = '{"summary": "Hello", "evidence": ["a"]}'
        out = extract_json(text)
        self.assertIsNotNone(out)
        self.assertEqual(out["summary"], "Hello")
        self.assertEqual(out["evidence"], ["a"])

    def test_markdown_fence(self):
        text = '```json\n{"summary": "X", "evidence": []}\n```'
        out = extract_json(text)
        self.assertIsNotNone(out)
        self.assertEqual(out["summary"], "X")

    def test_invalid(self):
        self.assertIsNone(extract_json("not json at all"))
        self.assertIsNone(extract_json(""))


class TestInterpretWithLlm(unittest.TestCase):
    def test_returns_tuple(self):
        data = [
            {"id": 1, "date": "2025-01-01", "price": 100, "listing_type": "sale", "condition": "NM", "platform": "eBay"},
        ]
        result, err = interpret_with_llm(data)
        if err is not None:
            self.assertIsNone(result)
            self.assertTrue("Ollama" in err or "unreachable" in err or "HTTP" in err or "timeout" in err or "JSON" in err)
        else:
            self.assertIsNotNone(result)
            self.assertIn("summary", result)
            self.assertIn("evidence", result)
            self.assertIn("assumptions", result)
            self.assertIn("limitations", result)
            self.assertIn("alternatives", result)
            self.assertIn("plan", result)
            self.assertIn("reasoning_steps", result)
            self.assertIsInstance(result["evidence"], list)
            self.assertIsInstance(result["alternatives"], list)
            self.assertIsInstance(result["reasoning_steps"], list)
            text = (result.get("summary") or "") + " " + " ".join(result.get("evidence") or [])
            self.assertTrue("100" in text or "sale" in text.lower() or "1" in text)


if __name__ == "__main__":
    unittest.main()
