"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const json = JSON.parse(fs.readFileSync(path.join(root, "courses.json"), "utf8"));
const generated = fs.readFileSync(path.join(root, "courses-data.js"), "utf8");
const script = html.match(/<script>\s*([\s\S]*?)<\/script>/i);
assert.ok(script);

class Element {
  constructor(tag) { this.tag = tag; this.children = []; this.className = ""; this.href = ""; this._text = ""; }
  set textContent(value) { this._text = String(value); this.children = []; }
  get textContent() { return this._text + this.children.map(x => x.textContent).join(""); }
  appendChild(child) { this.children.push(child); return child; }
  replaceChildren(...children) { this.children = children; this._text = ""; }
}

async function render(courses) {
  const container = new Element("div");
  const selectors = {
    ".header .emoji": new Element("span"),
    ".header .title-text": new Element("span"),
    ".header .sub": new Element("span"),
    ".footer": new Element("span"),
  };
  const document = {
    title: "",
    getElementById: () => container,
    querySelector: key => selectors[key],
    createElement: tag => new Element(tag),
    createTextNode: value => ({ textContent: String(value) }),
  };
  vm.runInNewContext(script[1], {
    window: { VLLM_COURSES: courses },
    document,
    fetch: () => { throw new Error("offline index must not call fetch"); },
  });
  await new Promise(resolve => setImmediate(resolve));
  return { container, document };
}

test("generated offline manifest matches canonical JSON", () => {
  const window = {};
  vm.runInNewContext(generated, { window });
  assert.deepEqual(JSON.parse(JSON.stringify(window.VLLM_COURSES)), json);
  assert.match(html, /<script src="courses-data\.js"><\/script>/);
});

test("all chapter links are local and resolve to files", () => {
  assert.equal(json.chapterCount, json.chapters.length);
  assert.equal(json.chapters.length, 28);
  const seen = new Set();
  for (const chapter of json.chapters) {
    assert.match(chapter.file, /^[0-9]{2}\.html$/);
    assert.equal(chapter.file, chapter.num + ".html");
    assert.ok(!seen.has(chapter.file));
    assert.ok(fs.statSync(path.join(root, chapter.file)).isFile());
    seen.add(chapter.file);
  }
});

test("offline catalog renders all 28 chapters and correct links", async () => {
  const { container, document } = await render(json);
  assert.equal(container.children.length, 28);
  assert.match(document.title, /课程目录/);
  const first = container.children[0].children.at(-1).children[0];
  const last = container.children.at(-1).children.at(-1).children[0];
  assert.equal(first.href, "01.html");
  assert.equal(last.href, "28.html");
});

test("invalid chapter URLs fail closed with a text-only error", async () => {
  const bad = { ...json, chapters: [{ num: "01", title: "Bad", file: "javascript:alert(1)" }] };
  const { container } = await render(bad);
  assert.equal(container.children[0].className, "state-msg error");
  assert.match(container.children[0].textContent, /章节文件名无效/);
});

test("missing catalog data shows an error", async () => {
  const { container } = await render(undefined);
  assert.equal(container.children[0].className, "state-msg error");
});
