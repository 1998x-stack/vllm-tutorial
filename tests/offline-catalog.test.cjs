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

test("the first eighteen upgraded chapters use semantic HTML and unique SVGs", () => {
  for (const number of ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18"]) {
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
    "04-kv-write-read-path.svg",
    "05-iteration-batching.svg",
    "06-first-run-path.svg",
    "07-model-config-map.svg",
    "08-kv-memory-budget.svg",
    "09-prefix-cache-hash.svg",
    "10-scheduler-decision-loop.svg",
    "10-preemption-recompute.svg",
    "11-chunked-prefill-timeline.svg",
    "12-v1-process-topology.svg",
    "12-enginecore-step-loop.svg",
    "13-request-lifecycle.svg",
    "14-sampling-pipeline.svg",
    "15-production-serving-topology.svg",
    "16-kubernetes-gpu-scheduling.svg",
    "17-latency-waterfall.svg",
    "18-security-trust-boundaries.svg",
  ];
  for (const filename of expected) {
    const svg = fs.readFileSync(path.join(root, "assets", "diagrams", filename), "utf8");
    assert.match(svg, /<title\b/);
    assert.match(svg, /<desc\b/);
    assert.match(svg, /viewBox=/);
  }
  for (const number of ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18"]) {
    const evidence = JSON.parse(fs.readFileSync(path.join(root, "evidence", number + ".json"), "utf8"));
    assert.equal(evidence.chapter, number);
    assert.ok(evidence.claims.length >= 2);
    for (const claim of evidence.claims) {
      assert.ok(claim.source_url.startsWith("https://"));
      assert.ok(claim.claim.length > 10);
    }
  }
});

test("chapter 08 calculator is offline, accessible, and wired to its formula", () => {
  const html = fs.readFileSync(path.join(root, "08.html"), "utf8");
  const script = fs.readFileSync(path.join(root, "assets", "js", "kv-cache-calculator.js"), "utf8");
  assert.match(html, /assets\/js\/kv-cache-calculator\.js/);
  assert.match(html, /data-kv-calculator/);
  for (const field of ["layers", "kvHeads", "headDim", "bytes", "tokens", "concurrency"]) {
    assert.match(html, new RegExp('data-kv-field="' + field + '"'));
  }
  assert.match(script, /2 \* values\.layers/);
  assert.match(script, /addEventListener\("input"/);
});

test("chapter 11 chunked-prefill lab is offline and follows the budget model", () => {
  const html = fs.readFileSync(path.join(root, "11.html"), "utf8");
  const script = fs.readFileSync(path.join(root, "assets", "js", "chunked-prefill-lab.js"), "utf8");
  assert.match(html, /assets\/js\/chunked-prefill-lab\.js/);
  assert.match(html, /data-chunk-lab/);
  for (const field of ["budget", "decode", "prompt"]) {
    assert.match(html, new RegExp('data-chunk-field="' + field + '"'));
  }
  assert.match(script, /const perStepPrefill = budget - scheduledDecode/);
  assert.match(script, /Math\.ceil\(promptTokens \/ perStepPrefill\)/);
  assert.match(script, /addEventListener\("input"/);
  assert.doesNotMatch(html, /https?:\/\/[^"]+\.js/);
});

test("chapters 10–13 expose their intended runtime concepts and progressive interactions", () => {
  const scheduler = fs.readFileSync(path.join(root, "10.html"), "utf8");
  const architecture = fs.readFileSync(path.join(root, "12.html"), "utf8");
  const lifecycle = fs.readFileSync(path.join(root, "13.html"), "utf8");
  assert.match(scheduler, /max_num_scheduled_tokens/);
  assert.match(scheduler, /_preempt_request/);
  assert.match(scheduler, /data-stepper/);
  assert.match(architecture, /EngineCore\.step/);
  assert.match(architecture, /DP Coordinator/);
  assert.match(lifecycle, /WAITING_FOR_REMOTE_KVS/);
  assert.match(lifecycle, /PREEMPTED/);
  assert.match(lifecycle, /data-stepper/);
});

test("chapter 14 sampling lab is offline, normalized, and greedy-aware", () => {
  const html = fs.readFileSync(path.join(root, "14.html"), "utf8");
  const script = fs.readFileSync(path.join(root, "assets", "js", "sampling-lab.js"), "utf8");
  assert.match(html, /assets\/js\/sampling-lab\.js/);
  assert.match(html, /data-sampling-lab/);
  for (const field of ["temperature", "topK", "topP", "minP"]) {
    assert.match(html, new RegExp('data-sampling-field="' + field + '"'));
  }
  const sandbox = {
    window: {},
    document: { readyState: "complete", querySelectorAll: () => [] },
  };
  vm.runInNewContext(script, sandbox);
  const calculate = sandbox.window.vllmSamplingLab.calculate;
  const greedy = calculate({ temperature: 0, topK: 6, topP: 0.1, minP: 0.5 });
  assert.equal(greedy.greedy, true);
  assert.equal(greedy.retainedCount, 1);
  assert.equal(greedy.winner, "猫");
  const filtered = calculate({ temperature: 0.8, topK: 2, topP: 0.9, minP: 0 });
  assert.equal(filtered.retainedCount, 2);
  const sum = filtered.rows.reduce((total, row) => total + row.probability, 0);
  assert.ok(Math.abs(sum - 1) < 1e-9);
  assert.doesNotMatch(html, /https?:\/\/[^"]+\.js/);
});

test("chapters 14–18 cover production, Kubernetes, observability and security boundaries", () => {
  const sampling = fs.readFileSync(path.join(root, "14.html"), "utf8");
  const production = fs.readFileSync(path.join(root, "15.html"), "utf8");
  const kubernetes = fs.readFileSync(path.join(root, "16.html"), "utf8");
  const observability = fs.readFileSync(path.join(root, "17.html"), "utf8");
  const security = fs.readFileSync(path.join(root, "18.html"), "utf8");
  assert.match(sampling, /structured_outputs/);
  assert.match(sampling, /min_p/);
  assert.match(production, /image-digest/);
  assert.match(production, /Readiness/);
  assert.match(kubernetes, /nvidia\.com\/gpu/);
  assert.match(kubernetes, /PodDisruptionBudget/);
  assert.match(observability, /vllm:time_to_first_token_seconds/);
  assert.match(observability, /histogram_quantile/);
  assert.match(security, /API Key/);
  assert.match(security, /cache_salt/);
  assert.match(security, /multi-tenancy/i);
});
