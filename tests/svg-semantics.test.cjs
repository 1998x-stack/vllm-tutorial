"use strict";
// Semantic smoke tests for the first Olah-style SVG review batch.
// These assertions supplement, not replace, rendered visual inspection.
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const svg = (n) => fs.readFileSync(path.join(root, "assets/diagrams", n), "utf8");
const page = (n) => fs.readFileSync(path.join(root, n + ".html"), "utf8");

function idsAreUnique(xml, label) {
  const ids = Array.from(xml.matchAll(/\bid="([^"]+)"/g), (m) => m[1]);
  assert.equal(ids.length, new Set(ids).size, label + ": duplicate SVG IDs");
  assert.match(xml, /xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  assert.match(xml, /<title\s+id="/);
  assert.match(xml, /<desc\s+id="/);
  assert.match(xml, /viewBox="0 0 \d+ \d+"/);
  assert.match(xml, /role="img"/);
  assert.ok(ids.length >= 8, label + ": not enough machine-identifiable elements");
}

test("01: first token is sampled from prompt logits; no Decode → Prefill return edge", () => {
  const xml = svg("01-inference-lifecycle.svg");
  idsAreUnique(xml, "01");
  for (const edge of [
    "prompt-to-prefill",
    "prefill-to-first-token",
    "prefill-to-kv",
    "first-token-to-decode-input",
    "kv-to-decode",
    "decode-to-kv",
    "decode-step-to-sample",
    "decode-repeat-edge",
  ]) {
    assert.match(xml, new RegExp('id="' + edge + '"'));
  }
  assert.match(xml, /logits → 采样 y₁/);
  assert.match(xml, /下一轮仍进入 Decode|返回 Decode 输入/);
  assert.match(page("01"), /采样首个输出 y₁/);
  assert.match(page("01"), /以 Prefill 已采样的 y₁/);
  assert.doesNotMatch(xml, /H420 V276/, "old loop-to-prefill geometry must not return");
});

test("02: request path and response path are both explicitly drawn", () => {
  const xml = svg("02-vllm-serving-architecture.svg");
  idsAreUnique(xml, "02");
  const request = ["client-to-api", "api-to-engine", "engine-to-gpu"];
  const result = ["gpu-to-engine", "engine-to-api", "api-to-client"];
  for (const edge of [...request, ...result]) {
    assert.match(xml, new RegExp('id="' + edge + '"'));
  }
  assert.match(xml, /KV Cache Manager/);
  assert.match(xml, /GPU Worker\(s\)/);
  assert.match(xml, /设备显存中的 KV 数据/);
  assert.match(page("02"), /橙色虚线追踪 Worker 的执行结果/);
});

test("03: token 9 mapping matches block size and zero-based offset", () => {
  const xml = svg("03-block-table-mapping.svg");
  idsAreUnique(xml, "03");
  const blockSize = 4;
  const table = [7, 2, 11, 4];
  const token = 9;
  const logicalBlock = Math.floor(token / blockSize);
  const offset = token % blockSize;
  assert.equal(logicalBlock, 2);
  assert.equal(offset, 1);
  assert.equal(table[logicalBlock], 11);
  for (const id of ["token-9", "token-to-table", "table-entry-2", "table-to-physical-block", "physical-block-11", "offset-1"]) {
    assert.match(xml, new RegExp('id="' + id + '"'));
  }
  assert.match(xml, /BlockTable\[2\]=11/);
  assert.match(xml, /offset=9 mod 4=1/);
  assert.match(page("03"), /offset 1（从 0 开始计数，即第二个 token 槽位）/);
  assert.match(page("03"), /BlockTable\[2\] = 11/);
});


test("01–03 wide diagrams have a keyboard-focusable mobile pan wrapper", () => {
  const css = fs.readFileSync(path.join(root, "assets/css/article.css"), "utf8");
  assert.match(css, /@media \(max-width: 700px\)/);
  assert.match(css, /\.diagram-pan img \{ width: 960px;/);
  assert.match(css, /\.diagram-pan:focus-visible/);
  for (const n of ["01", "02", "03"]) {
    const html = page(n);
    assert.match(html, /<div class="diagram-pan" tabindex="0" role="region"/);
    assert.match(html, /<img src="assets\/diagrams\/0[1-3]-/);
    assert.match(html, /<\/div>\s*<figcaption>/);
  }
});
