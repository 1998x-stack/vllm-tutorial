"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const json = JSON.parse(fs.readFileSync(path.join(root, "courses.json"), "utf8"));
const generated = fs.readFileSync(path.join(root, "courses-data.js"), "utf8");
const index = fs.readFileSync(path.join(root, "index.html"), "utf8");

test("generated offline manifest matches canonical JSON", () => {
  const window = {};
  vm.runInNewContext(generated, { window });
  assert.deepEqual(JSON.parse(JSON.stringify(window.VLLM_COURSES)), json);
});

test("course taxonomy covers all 28 chapters exactly once", () => {
  assert.equal(json.schemaVersion, 2);
  assert.equal(json.chapterCount, 28);
  assert.equal(json.chapters.length, 28);
  assert.equal(json.categories.length, 8);
  const categoryIds = new Set(json.categories.map((category) => category.id));
  assert.equal(categoryIds.size, json.categories.length);
  const numbers = new Set();
  for (const chapter of json.chapters) {
    assert.match(chapter.num, /^[0-9]{2}$/);
    assert.equal(chapter.file, chapter.num + ".html");
    assert.ok(!numbers.has(chapter.num));
    numbers.add(chapter.num);
    assert.ok(categoryIds.has(chapter.category));
    assert.ok(["入门", "进阶", "高级", "综合"].includes(chapter.level));
    assert.ok(Number.isInteger(chapter.durationMinutes) && chapter.durationMinutes > 0);
    assert.ok(chapter.summary.length > 10);
    assert.ok(chapter.learningObjectives.length >= 2);
    assert.ok(chapter.tags.length >= 1);
    for (const prerequisite of chapter.prerequisites) {
      assert.ok(json.chapters.some((candidate) => candidate.num === prerequisite));
      assert.notEqual(prerequisite, chapter.num);
    }
  }
});

test("all chapter links remain local and resolve to files", () => {
  for (const chapter of json.chapters) {
    const target = path.join(root, chapter.file);
    assert.ok(fs.statSync(target).isFile(), chapter.file + " must exist");
  }
  assert.match(index, /<script src="courses-data\.js"><\/script>/);
  assert.match(index, /id="search"/);
  assert.match(index, /id="filters"/);
  assert.match(index, /href = chapter\.file/);
  assert.doesNotMatch(index, /fetch\s*\(/, "offline index must not fetch remote data");
});

test("the first three upgraded chapters use semantic HTML and unique SVGs", () => {
  for (const number of ["01", "02", "03"]) {
    const html = fs.readFileSync(path.join(root, number + ".html"), "utf8");
    assert.match(html, /<h1\b/);
    assert.match(html, /<main\b/);
    assert.match(html, /<article\b/);
    assert.match(html, /<section\b/);
    assert.match(html, /assets\/css\/article\.css/);
    assert.match(html, /<figure\b/);
    assert.match(html, /<img[^>]+alt=/);
    assert.match(html, /id="sources"/);
    assert.doesNotMatch(html, /<style\b|\sstyle="/i);
    assert.ok(fs.existsSync(path.join(root, "evidence", number + ".json")));
  }
});

test("chapter diagrams and evidence records are independently inspectable", () => {
  const expected = [
    "01-inference-lifecycle.svg",
    "02-vllm-serving-architecture.svg",
    "03-block-table-mapping.svg",
  ];
  for (const filename of expected) {
    const svg = fs.readFileSync(path.join(root, "assets", "diagrams", filename), "utf8");
    assert.match(svg, /<title\b/);
    assert.match(svg, /<desc\b/);
    assert.match(svg, /viewBox=/);
  }
  for (const number of ["01", "02", "03"]) {
    const evidence = JSON.parse(fs.readFileSync(path.join(root, "evidence", number + ".json"), "utf8"));
    assert.equal(evidence.chapter, number);
    assert.ok(evidence.claims.length >= 2);
    for (const claim of evidence.claims) {
      assert.ok(claim.source_url.startsWith("https://"));
      assert.ok(claim.claim.length > 10);
    }
  }
});
