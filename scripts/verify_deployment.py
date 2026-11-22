#!/usr/bin/env python3
"""Verify that the public GitHub Pages deployment serves the expected course files."""
from __future__ import annotations

import argparse
import time
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin
from pathlib import Path
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]

REQUIRED = (
    "index.html",
    "01.html",
    "08.html",
    "11.html",
    "14.html",
    "18.html",
    "19.html",
    "21.html",
    "23.html",
    "24.html",
    "25.html",
    "26.html",
    "27.html",
    "28.html",
    "courses.json",
    "courses-data.js",
    "theme.css",
    "assets/css/article.css",
    "assets/diagrams/18-security-trust-boundaries.svg",
    "assets/diagrams/19-tensor-parallel-partitions.svg",
    "assets/diagrams/21-speculative-acceptance.svg",
    "assets/diagrams/23-nano-vllm-control-flow.svg",
    "assets/diagrams/24-debugging-triage.svg",
    "assets/diagrams/25-benchmark-design.svg",
    "assets/diagrams/26-evidence-roadmap.svg",
    "assets/diagrams/27-rag-trust-boundaries.svg",
    "assets/diagrams/28-course-knowledge-map.svg",
    "assets/js/kv-cache-calculator.js",
    "assets/js/chunked-prefill-lab.js",
    "assets/js/sampling-lab.js",
    "assets/js/speculative-lab.js",
    "assets/js/benchmark-lab.js",
    "examples/rag_demo.py",
    "examples/rag_corpus.json",
)


def fetch(url: str, attempts: int, interval: int, expected: bytes | None = None) -> bytes:
    request = Request(url, headers={"User-Agent": "vllm-tutorial-pages-smoke/1.0", "Cache-Control": "no-cache"})
    last_error = None
    for attempt in range(1, attempts + 1):
        try:
            with urlopen(request, timeout=30) as response:
                if response.status != 200:
                    raise AssertionError(f"HTTP {response.status}: {url}")
                content = response.read()
                if expected is not None and content != expected:
                    raise AssertionError(f"Published bytes differ from repository artifact: {url}")
                return content
        except (HTTPError, URLError, TimeoutError, AssertionError) as exc:
            last_error = exc
            if attempt < attempts:
                print(f"Public asset check {attempt}/{attempts} failed for {url}: {exc}", flush=True)
                time.sleep(interval)
    raise AssertionError(f"Public asset did not become available after {attempts} attempts: {url}") from last_error


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", required=True)
    parser.add_argument("--attempts", type=int, default=8)
    parser.add_argument("--interval", type=int, default=10)
    args = parser.parse_args()
    if args.attempts < 1 or args.interval < 0:
        parser.error("--attempts must be positive and --interval non-negative")
    base = args.base_url.rstrip("/") + "/"

    for path in REQUIRED:
        url = urljoin(base, path)
        source_path = ROOT / path
        if not source_path.is_file():
            raise AssertionError(f"Missing source file for deployment comparison: {source_path}")
        content = fetch(url, args.attempts, args.interval, expected=source_path.read_bytes())
        if not content:
            raise AssertionError(f"Empty published asset: {url}")
        if path in {"index.html", "01.html", "08.html", "11.html", "14.html", "18.html"}:
            if b"<h1" not in content:
                raise AssertionError(f"Upgraded page is missing h1: {url}")
        elif path == "28.html":
            # Chapter 28 is an unchanged legacy page until the 19–28 modernization batch.
            # Enforce an existing semantic heading and exact source bytes, not a new H1 contract.
            if b"<h2" not in content:
                raise AssertionError(f"Legacy chapter has no heading: {url}")
        print(f"PUBLIC OK {path} ({len(content)} bytes)")

    print(f"PUBLIC DEPLOYMENT VERIFIED: {base}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
