#!/usr/bin/env python3
"""Static structural and local-link checks for the 28 offline chapters."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse, unquote
import json
import re
import sys

ROOT = Path(__file__).resolve().parent.parent
COURSE = ROOT / "courses.json"


class Audit(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.title_depth = 0
        self.title_text = []
        self.h1_count = 0
        self.main_count = 0
        self.article_count = 0
        self.section_count = 0
        self.figure_count = 0
        self.images = []
        self.local_refs = []
        self.stylesheets = []
        self.scripts = []
        self.has_sources = False
        self.inline_style = False
        self.remote_runtime = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "title":
            self.title_depth += 1
        if tag == "h1":
            self.h1_count += 1
        if tag == "main":
            self.main_count += 1
        if tag == "article":
            self.article_count += 1
        if tag == "section":
            self.section_count += 1
            if attrs.get("id") == "sources" or "sources" in (attrs.get("class") or "").split():
                self.has_sources = True
        if tag == "figure":
            self.figure_count += 1
        if tag == "img":
            self.images.append((attrs.get("src", ""), attrs.get("alt")))
        if "style" in attrs:
            self.inline_style = True
        if tag == "style":
            self.inline_style = True
        if tag == "link" and "stylesheet" in (attrs.get("rel") or "").lower():
            href = attrs.get("href", "")
            self.stylesheets.append(href)
            self.local_refs.append(href)
            if urlparse(href).scheme in {"http", "https"}:
                self.remote_runtime.append(href)
        if tag == "script" and attrs.get("src"):
            src = attrs["src"]
            self.scripts.append(src)
            self.local_refs.append(src)
            if urlparse(src).scheme in {"http", "https"}:
                self.remote_runtime.append(src)
        if tag == "a" and attrs.get("href"):
            self.local_refs.append(attrs["href"])

    def handle_endtag(self, tag):
        if tag == "title" and self.title_depth:
            self.title_depth -= 1

    def handle_data(self, data):
        if self.title_depth:
            self.title_text.append(data)


def local_target(page, ref):
    if not ref or ref.startswith(("#", "javascript:", "mailto:", "tel:")):
        return None
    parsed = urlparse(ref)
    if parsed.scheme or parsed.netloc:
        return None
    raw = unquote(parsed.path)
    if not raw:
        return None
    target = (page.parent / raw).resolve()
    try:
        target.relative_to(ROOT.resolve())
    except ValueError:
        return target
    return target


def main():
    data = json.loads(COURSE.read_text(encoding="utf-8"))
    chapters = data.get("chapters", [])
    errors = []
    upgraded = []
    legacy = []

    if len(chapters) != 28 or data.get("chapterCount") != 28:
        errors.append("course manifest must contain exactly 28 chapters")

    for chapter in chapters:
        number = chapter["num"]
        page = ROOT / chapter["file"]
        if not page.is_file():
            errors.append(f"{number}: missing chapter file {chapter['file']}")
            continue
        audit = Audit()
        try:
            audit.feed(page.read_text(encoding="utf-8"))
        except (OSError, UnicodeDecodeError) as exc:
            errors.append(f"{number}: cannot read HTML: {exc}")
            continue

        if not audit.title_text:
            errors.append(f"{number}: missing document title")
        for ref in audit.local_refs:
            target = local_target(page, ref)
            if target is not None and not target.is_file():
                errors.append(f"{number}: broken local reference {ref}")
        for src, alt in audit.images:
            if not alt or not alt.strip():
                errors.append(f"{number}: image has no descriptive alt text")
            target = local_target(page, src)
            if target is not None and not target.is_file():
                errors.append(f"{number}: missing image {src}")

        is_v2 = "assets/css/article.css" in audit.stylesheets
        if is_v2:
            upgraded.append(number)
            if audit.h1_count != 1:
                errors.append(f"{number}: upgraded article must contain exactly one h1")
            if audit.main_count < 1 or audit.article_count < 1:
                errors.append(f"{number}: upgraded article needs main and article elements")
            if audit.section_count < 4:
                errors.append(f"{number}: upgraded article needs at least four semantic sections")
            if audit.figure_count < 1 or not audit.images:
                errors.append(f"{number}: upgraded article needs a topic-specific figure")
            if not audit.has_sources:
                errors.append(f"{number}: upgraded article needs a sources section")
            if audit.inline_style:
                errors.append(f"{number}: upgraded article must use shared CSS, not inline styles")
            if audit.remote_runtime:
                errors.append(f"{number}: upgraded article has remote runtime dependencies")
            evidence = ROOT / "evidence" / f"{number}.json"
            if not evidence.is_file():
                errors.append(f"{number}: missing evidence ledger {evidence.relative_to(ROOT)}")
        else:
            legacy.append(number)

    print(f"Chapters checked: {len(chapters)}")
    print(f"Upgraded chapters: {', '.join(upgraded) if upgraded else 'none'}")
    print(f"Legacy chapters pending migration: {len(legacy)}")
    if errors:
        print("Validation errors:")
        for error in errors:
            print(" - " + error)
        return 1
    print("Static article structure and local references: OK")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
