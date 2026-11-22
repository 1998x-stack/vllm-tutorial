#!/usr/bin/env python3
"""Verify that the public GitHub Pages deployment serves the expected course files."""
from __future__ import annotations

import argparse
from urllib.parse import urljoin
from urllib.request import Request, urlopen


REQUIRED = (
    "index.html",
    "01.html",
    "08.html",
    "11.html",
    "14.html",
    "18.html",
    "28.html",
    "courses.json",
    "courses-data.js",
    "theme.css",
    "assets/css/article.css",
    "assets/diagrams/18-security-trust-boundaries.svg",
    "assets/js/kv-cache-calculator.js",
    "assets/js/chunked-prefill-lab.js",
    "assets/js/sampling-lab.js",
)


def fetch(url: str) -> bytes:
    request = Request(url, headers={"User-Agent": "vllm-tutorial-pages-smoke/1.0", "Cache-Control": "no-cache"})
    with urlopen(request, timeout=30) as response:
        if response.status != 200:
            raise AssertionError(f"HTTP {response.status}: {url}")
        return response.read()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", required=True)
    args = parser.parse_args()
    base = args.base_url.rstrip("/") + "/"

    for path in REQUIRED:
        url = urljoin(base, path)
        content = fetch(url)
        if not content:
            raise AssertionError(f"Empty published asset: {url}")
        if path.endswith(".html") and b"<h1" not in content:
            raise AssertionError(f"Published chapter has no h1: {url}")
        print(f"PUBLIC OK {path} ({len(content)} bytes)")

    print(f"PUBLIC DEPLOYMENT VERIFIED: {base}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
