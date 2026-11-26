#!/usr/bin/env python3
"""Responsive Chromium QA for the offline-first vLLM tutorial."""
from __future__ import annotations

import argparse
import json
from pathlib import Path
from urllib.parse import urljoin

from playwright.sync_api import sync_playwright


def parse_chapters(value: str) -> list[str]:
    value = value.strip()
    if "-" in value and "," not in value:
        start, end = value.split("-", 1)
        return [f"{number:02d}" for number in range(int(start), int(end) + 1)]
    return [part.strip().zfill(2) for part in value.split(",") if part.strip()]


def parse_viewports(value: str) -> list[int]:
    return [int(part.strip()) for part in value.split(",") if part.strip()]


def inspect_page(browser, base_url: str, chapter: str, width: int, height: int, screenshot_dir: Path | None):
    context = browser.new_context(viewport={"width": width, "height": height}, device_scale_factor=1)
    page = context.new_page()
    page_errors: list[str] = []
    console_errors: list[str] = []
    failed_local_responses: list[str] = []

    page.on("pageerror", lambda error: page_errors.append(str(error)))
    page.on(
        "console",
        lambda message: console_errors.append(message.text) if message.type == "error" else None,
    )
    page.on(
        "response",
        lambda response: failed_local_responses.append(
            f"{response.status} {response.url}"
        )
        if response.status >= 400 and response.url.startswith(base_url) and not response.url.endswith("/favicon.ico")
        else None,
    )

    url = urljoin(base_url, f"{chapter}.html")
    response = page.goto(url, wait_until="networkidle", timeout=45000)
    if response is None or response.status >= 400:
        raise AssertionError(f"{chapter} at {width}px did not load successfully: {url}")

    # Force lazy local figures to load before recording image integrity.
    page.evaluate(
        "() => document.querySelectorAll('img[loading=lazy]').forEach((image) => { image.loading = 'eager'; })"
    )
    page.wait_for_function(
        "() => Array.from(document.images).every((image) => image.complete)",
        timeout=15000,
    )

    metrics = page.evaluate(
        """() => {
          const root = document.documentElement;
          const body = document.body;
          const images = Array.from(document.images);
          const missingAnchors = Array.from(document.querySelectorAll('a[href^="#"]'))
            .map((anchor) => anchor.getAttribute('href'))
            .filter((href) => href && href !== "#" && !document.getElementById(decodeURIComponent(href.slice(1))));
          const brokenImages = images
            .filter((image) => image.getAttribute('src') && image.naturalWidth === 0)
            .map((image) => image.getAttribute('src'));
          const invisibleDiagrams = Array.from(document.querySelectorAll('.diagram svg, .diagram img'))
            .filter((figure) => {
              const rect = figure.getBoundingClientRect();
              return rect.width === 0 || rect.height === 0;
            }).length;
          return {
            title: document.title,
            h1Count: document.querySelectorAll('h1').length,
            mainCount: document.querySelectorAll('main').length,
            viewportWidth: root.clientWidth,
            documentWidth: Math.max(root.scrollWidth, body ? body.scrollWidth : 0),
            horizontalOverflow: Math.max(0, Math.max(root.scrollWidth, body ? body.scrollWidth : 0) - root.clientWidth),
            imageCount: images.length,
            brokenImages,
            missingAnchors,
            diagramCount: document.querySelectorAll('.diagram').length,
            invisibleDiagrams,
            inlineSvgCount: document.querySelectorAll('svg').length,
            overflowCandidates: Array.from(document.querySelectorAll('body *'))
              .map((element) => {
                const rect = element.getBoundingClientRect();
                const style = getComputedStyle(element);
                return {
                  tag: element.tagName.toLowerCase(),
                  className: typeof element.className === 'string' ? element.className.slice(0, 75) : '',
                  right: Math.round(rect.right * 10) / 10,
                  left: Math.round(rect.left * 10) / 10,
                  width: Math.round(rect.width * 10) / 10,
                  overflowX: style.overflowX,
                  text: (element.textContent || '').trim().slice(0, 45)
                };
              })
              .filter((element) => element.right > root.clientWidth + 1 && element.right < root.clientWidth + 35 && element.left < root.clientWidth)
              .slice(0, 25)
          };
        }"""
    )

    failures = []
    if metrics["h1Count"] != 1:
        failures.append(f"expected one h1, got {metrics['h1Count']}")
    if metrics["mainCount"] < 1:
        failures.append("missing main landmark")
    if metrics["horizontalOverflow"] > 1:
        failures.append(f"page-level horizontal overflow: {metrics['horizontalOverflow']}px")
    if metrics["brokenImages"]:
        failures.append(f"broken images: {metrics['brokenImages']}")
    if metrics["missingAnchors"]:
        failures.append(f"missing in-page anchors: {metrics['missingAnchors']}")
    if metrics["invisibleDiagrams"]:
        failures.append(f"invisible diagrams: {metrics['invisibleDiagrams']}")
    if page_errors:
        failures.append(f"uncaught page errors: {page_errors}")
    if console_errors:
        failures.append(f"console errors: {console_errors}")
    if failed_local_responses:
        failures.append(f"failed local responses: {failed_local_responses}")

    if screenshot_dir and (chapter in {"01", "02", "03", "08", "11", "14", "18", "19", "21", "23", "24", "25", "27", "28"} and width in {1440, 390}):
        screenshot_dir.mkdir(parents=True, exist_ok=True)
        page.screenshot(
            path=str(screenshot_dir / f"{chapter}-{width}.png"),
            full_page=True,
            animations="disabled",
        )

    context.close()
    return {"chapter": chapter, "width": width, "height": height, "metrics": metrics, "failures": failures}


def check_interactions(browser, base_url: str) -> list[dict]:
    results = []

    # Chapter 08: changing concurrency must change the theoretical KV payload.
    page = browser.new_page(viewport={"width": 1440, "height": 1000})
    errors: list[str] = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(urljoin(base_url, "08.html"), wait_until="networkidle")
    total = page.locator('[data-kv-output="total"]')
    initial = total.inner_text()
    concurrency = page.locator('[data-kv-field="concurrency"]')
    concurrency.fill("16")
    after_fill = total.inner_text()
    concurrency.focus()
    concurrency.press("ArrowUp")
    after_keyboard = total.inner_text()
    if initial == after_fill or "16 GiB" not in after_fill or after_keyboard == after_fill:
        raise AssertionError(
            f"KV calculator interaction failed: initial={initial}, fill={after_fill}, keyboard={after_keyboard}"
        )
    if errors:
        raise AssertionError(f"chapter 08 JavaScript errors: {errors}")
    results.append({"chapter": "08", "control": "concurrency", "initial": initial, "after_fill": after_fill, "after_keyboard": after_keyboard})
    page.close()

    # Chapter 11: a larger token budget should reduce the number of prefill rounds.
    page = browser.new_page(viewport={"width": 1440, "height": 1000})
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(urljoin(base_url, "11.html"), wait_until="networkidle")
    steps = page.locator('[data-chunk-output="steps"]')
    initial = steps.inner_text()
    budget = page.locator('[data-chunk-field="budget"]')
    budget.fill("23")
    after_fill = steps.inner_text()
    schedule = page.locator('[data-chunk-output="schedule"] li').first
    first_step = schedule.inner_text()
    budget.focus()
    budget.press("ArrowDown")
    after_keyboard = schedule.inner_text()
    if initial != "4" or after_fill != "2" or first_step == after_keyboard:
        raise AssertionError(
            f"Chunked Prefill interaction failed: initial={initial}, steps={after_fill}, first={first_step}, keyboard={after_keyboard}"
        )
    if errors:
        raise AssertionError(f"chapter 11 JavaScript errors: {errors}")
    results.append({"chapter": "11", "control": "budget", "initial_steps": initial, "after_fill_steps": after_fill, "first_step_after_keyboard": after_keyboard})
    page.close()

    # Chapter 14: keyboard-operating Top-k must alter the retained candidate set.
    page = browser.new_page(viewport={"width": 1440, "height": 1000})
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(urljoin(base_url, "14.html"), wait_until="networkidle")
    count = page.locator('[data-sampling-result="count"]')
    initial = count.inner_text()
    top_k = page.locator('[data-sampling-field="topK"]')
    top_k.focus()
    top_k.press("ArrowRight")
    top_k.press("ArrowRight")
    after_keyboard = count.inner_text()
    if top_k.input_value() != "2" or after_keyboard != "2 / 6" or after_keyboard == initial:
        raise AssertionError(
            f"Sampling lab keyboard interaction failed: initial={initial}, topK={top_k.input_value()}, after={after_keyboard}"
        )
    if errors:
        raise AssertionError(f"chapter 14 JavaScript errors: {errors}")
    results.append({"chapter": "14", "control": "topK", "initial_count": initial, "after_keyboard": after_keyboard})
    page.close()

    # Chapter 21: changing the toy acceptance assumption must update expected length.
    page = browser.new_page(viewport={"width": 1440, "height": 1000})
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(urljoin(base_url, "21.html"), wait_until="networkidle")
    accepted = page.locator('[data-spec-result="accepted"]')
    initial = accepted.inner_text()
    probability = page.locator('[data-spec-field="a"]')
    probability.focus()
    probability.press("ArrowRight")
    after_keyboard = accepted.inner_text()
    length = page.locator('[data-spec-field="k"]')
    length.focus()
    length.press("ArrowRight")
    after_length = accepted.inner_text()
    if initial == after_keyboard or after_length == after_keyboard:
        raise AssertionError(
            f"Speculative lab interaction failed: initial={initial}, probability={after_keyboard}, length={after_length}"
        )
    if errors:
        raise AssertionError(f"chapter 21 JavaScript errors: {errors}")
    results.append({"chapter": "21", "control": "a-and-k", "initial": initial, "after_probability": after_keyboard, "after_length": after_length})
    page.close()

    # Chapter 25: arithmetic updates by keyboard and is identical to the Node formula.
    page = browser.new_page(viewport={"width": 1440, "height": 1000})
    errors = []
    page.on("pageerror", lambda error: errors.append(str(error)))
    page.goto(urljoin(base_url, "25.html"), wait_until="networkidle")
    rps = page.locator('[data-bench-output="rps"]')
    tps = page.locator('[data-bench-output="tps"]')
    failure = page.locator('[data-bench-output="error"]')
    initial = rps.inner_text()
    if initial != "1.50 req/s" or tps.inner_text() != "120.0 tok/s" or failure.inner_text() != "25.0%":
        raise AssertionError("Benchmark lab does not match the declared arithmetic example")
    field = page.locator('[data-bench-field="success"]')
    field.focus()
    field.press("ArrowUp")
    after_key = rps.inner_text()
    if after_key == initial or not after_key.startswith("1.55"):
        raise AssertionError(f"Benchmark lab keyboard interaction failed: before={initial} after={after_key}")
    if errors:
        raise AssertionError(f"chapter 25 JavaScript errors: {errors}")
    results.append({"chapter": "25", "control": "successful-requests", "initial": initial, "after_keyboard": after_key})
    page.close()

    return results


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", default="http://127.0.0.1:8765/")
    parser.add_argument("--chapters", default="01-28")
    parser.add_argument("--viewports", default="1440,768,390,360")
    parser.add_argument("--report", default="reports/browser-qa.json")
    parser.add_argument("--skip-interactions", action="store_true")
    args = parser.parse_args()

    base_url = args.base_url.rstrip("/") + "/"
    chapters = parse_chapters(args.chapters)
    widths = parse_viewports(args.viewports)
    heights = {1440: 1000, 768: 1024, 390: 844, 360: 800}

    report = {
        "base_url": base_url,
        "chapters": chapters,
        "viewports": widths,
        "pages": [],
        "interactions": [],
    }
    failures = []

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch()
        screenshot_dir = Path(args.report).parent / "screenshots"
        for chapter in chapters:
            for width in widths:
                height = heights.get(width, 900)
                result = inspect_page(browser, base_url, chapter, width, height, screenshot_dir)
                report["pages"].append(result)
                if result["failures"]:
                    failures.append(result)

        if not args.skip_interactions and {"08", "11", "14", "21", "25"}.issubset(set(chapters)):
            report["interactions"] = check_interactions(browser, base_url)

        browser.close()

    report_path = Path(args.report)
    report_path.parent.mkdir(parents=True, exist_ok=True)
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    print(f"Browser QA checked {len(report['pages'])} page/viewport combinations.")
    print(f"Interaction checks: {len(report['interactions'])}.")
    print(f"Report: {report_path}")
    if failures:
        print(json.dumps(failures, ensure_ascii=False, indent=2))
        return 1
    print("BROWSER QA PASSED")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
