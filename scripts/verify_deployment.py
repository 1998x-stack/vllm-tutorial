#!/usr/bin/env python3
"""Verify that the public GitHub Pages deployment serves the expected course files."""
from __future__ import annotations

import argparse
import time
from urllib.error import HTTPError, URLError
from urllib.parse import urljoin
from urllib.request import Request, urlopen


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
    "28.html",
    "courses.json",
    "courses-data.js",
    "theme.css",
    "assets/css/article.css",
    "assets/diagrams/18-security-trust-boundaries.svg",
    "assets/diagrams/19-tensor-parallel-partitions.svg",
    "assets/diagrams/21-speculative-acceptance.svg",
    "assets/diagrams/23-nano-vllm-control-flow.svg",
    "assets/js/kv-cache-calculator.js",
    "assets/js/chunked-prefill-lab.js",
    "assets/js/sampling-lab.js",
    "assets/js/speculative-lab.js",
)


def fetch(url: str, attempts: int, interval: int) -> bytes:
    request = Request(url, headers={"User-Agent": "vllm-tutorial-pages-smoke/1.0", "Cache-Control": "no-cache"})
    last_error = None
    for attempt in range(1, attempts + 1):
        try:
            with urlopen(request, timeout=30) as response:
                if response.status != 200:
                    raise AssertionError(f"HTTP {response.status}: {url}")
                return response.read()
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
        content = fetch(url, args.attempts, args.interval)
        if not content:
            raise AssertionError(f"Empty published asset: {url}")
        if path.endswith(".html") and b"<h1" not in content:
            raise AssertionError(f"Published chapter has no h1: {url}")
        print(f"PUBLIC OK {path} ({len(content)} bytes)")

    print(f"PUBLIC DEPLOYMENT VERIFIED: {base}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
