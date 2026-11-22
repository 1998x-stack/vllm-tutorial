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

test("all twenty-eight chapters use semantic HTML and unique SVGs", () => {
  for (const number of ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28"]) {
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
    "19-tensor-parallel-partitions.svg",
    "20-parallelism-topology.svg",
    "21-speculative-acceptance.svg",
    "22-multimodal-input-path.svg",
    "23-nano-vllm-control-flow.svg",
    "24-debugging-triage.svg",
    "25-benchmark-design.svg",
    "26-evidence-roadmap.svg",
    "27-rag-trust-boundaries.svg",
    "28-course-knowledge-map.svg",
  ];
  for (const filename of expected) {
    const svg = fs.readFileSync(path.join(root, "assets", "diagrams", filename), "utf8");
    assert.match(svg, /<title\b/);
    assert.match(svg, /<desc\b/);
    assert.match(svg, /viewBox=/);
  }
  for (const number of ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28"]) {
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

test("chapter 21 offline acceptance lab follows the iid geometric-prefix model", () => {
 const html = fs.readFileSync(path.join(root, "21.html"), "utf8");
 const script = fs.readFileSync(path.join(root, "assets", "js", "speculative-lab.js"), "utf8");
 assert.match(html, /assets\/js\/speculative-lab\.js/);
 assert.match(html, /data-spec-lab/);
 assert.match(html, /data-spec-field="a"/);
 assert.match(html, /data-spec-field="k"/);
 const sandbox={window:{},document:{readyState:"complete",querySelectorAll:()=>[]}};
 vm.runInNewContext(script,sandbox);
 const run=sandbox.window.vllmSpecLab.calculate;
 const a0=run(0,4);
 assert.equal(a0.accepted,0);
 assert.equal(a0.advanced,1);
 const a1=run(1,4);
 assert.equal(a1.accepted,4);
 assert.equal(a1.advanced,5);
 const half=run(0.5,3);
 assert.equal(half.accepted,0.875);
 assert.equal(half.advanced,1.875);
 assert.equal(half.full,0.125);
 assert.equal(half.prefixProbabilities.length,3);
 assert.doesNotMatch(html, /https?:\/\/[^"]+\.js/);
});

test("chapters 19–23 cover TP/PP/DP/EP, speculative correction, multimodal security and pinned nano-vLLM",()=>{
 const read=n=>fs.readFileSync(path.join(root,n+".html"),"utf8");
 assert.match(read("19"),/ColumnParallelLinear/);
 assert.match(read("19"),/All-Reduce/);
 assert.match(read("20"),/enable-expert-parallel/);
 assert.match(read("20"),/max-num-queued-reqs/);
 assert.match(read("21"),/<mi>min<\/mi><mo>\(<\/mo><mn>1<\/mn><mo>,<\/mo><mfrac>/);
 assert.match(read("21"),/residual|残差/);
 assert.match(read("22"),/allowed-media-domains/);
 assert.match(read("22"),/limit_mm_per_prompt/);
 assert.match(read("23"),/nanovllm\/engine\/scheduler\.py/);
 assert.match(read("23"),/bb823b3e/);
 for (const n of ["19","20","21","22","23"]) {
  const ledger=JSON.parse(fs.readFileSync(path.join(root,"evidence",n+".json"),"utf8"));
  assert.ok(ledger.claims.length>=5);
  assert.ok(ledger.claims.every(c=>c.source_url.startsWith("https://")));
 }
});

test("chapter 25 offline benchmark formula handles failures and zero-request cases", () => {
  const html = fs.readFileSync(path.join(root, "25.html"), "utf8");
  const source = fs.readFileSync(path.join(root, "assets/js/benchmark-lab.js"), "utf8");
  assert.match(html, /assets\/js\/benchmark-lab\.js/);
  assert.match(html, /data-bench-lab/);
  const scope={window:{},document:{readyState:"complete",querySelectorAll:()=>[]}};
  vm.runInNewContext(source,scope);
  const f=scope.window.vllmBenchmarkLab.calculate;
  const demo=f({success:30,failure:10,seconds:20,tokens:2400});
  assert.equal(demo.valid,true);
  assert.equal(demo.rps,1.5);
  assert.equal(demo.tps,120);
  assert.equal(demo.failureRate,0.25);
  const empty=f({success:0,failure:0,seconds:20,tokens:0});
  assert.equal(empty.noRequests,true);
  assert.equal(f({success:-1,failure:0,seconds:20,tokens:0}).valid,false);
  assert.equal(f({success:1,failure:0,seconds:0,tokens:20}).valid,false);
  assert.doesNotMatch(html,/https?:\/\/[^"]+\.js/);
});

test("chapters 24–28 contain failure boundaries, benchmark protocol and executable RAG references", () => {
  const read=num=>fs.readFileSync(path.join(root,num+".html"),"utf8");
  assert.match(read("24"),/NCCL_DEBUG/);
  assert.match(read("24"),/enforce-eager/);
  assert.match(read("25"),/request-rate/);
  assert.match(read("25"),/max-concurrency/);
  assert.match(read("26"),/证据/);
  assert.match(read("27"),/examples\/rag_demo\.py/);
  assert.match(read("27"),/Recall@k/);
  assert.match(read("28"),/Capstone/);
  assert.ok(fs.existsSync(path.join(root,"examples","rag_demo.py")));
  assert.ok(fs.existsSync(path.join(root,"examples","rag_corpus.json")));
  for(const n of ["24","25","26","27","28"]){
    const ledger=JSON.parse(fs.readFileSync(path.join(root,"evidence",n+".json"),"utf8"));
    assert.equal(ledger.chapter,n);
    assert.ok(ledger.claims.length>=5);
    assert.ok(ledger.claims.every(item=>item.source_url.startsWith("https://")));
  }
});
