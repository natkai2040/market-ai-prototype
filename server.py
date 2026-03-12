#!/usr/bin/env python3
"""Simple HTTP server for the market-ai-prototype (no CORS issues with file://)."""
import http.server
import socketserver

PORT = 8000

Handler = http.server.SimpleHTTPRequestHandler

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Running at http://localhost:{PORT}")
    print("Try: http://localhost:8000/?condition=control")
    print("     http://localhost:8000/?condition=inspectable")
    print("     http://localhost:8000/?condition=contestable")
    httpd.serve_forever()
