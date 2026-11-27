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


test("01–09 wide diagrams have a keyboard-focusable mobile pan wrapper", () => {
  const css = fs.readFileSync(path.join(root, "assets/css/article.css"), "utf8");
  assert.match(css, /@media \(max-width: 700px\)/);
  assert.match(css, /\.diagram-pan img \{ width: 960px;/);
  assert.match(css, /\.diagram-pan:focus-visible/);
  for (const n of ["01", "02", "03", "04", "05", "06", "07", "08", "09"]) {
    const html = page(n);
    assert.match(html, /<div class="diagram-pan" tabindex="0" role="region"/);
    assert.match(html, /<img src="assets\/diagrams\/0[1-9]-/);
    assert.match(html, /<\/div>\s*<figcaption>/);
  }
});

test("04: write and read are opposite edges over one physical KV cache", () => {
  const xml = svg("04-kv-write-read-path.svg");
  idsAreUnique(xml, "04");
  assert.match(xml, /id="physical-kv-cache"/);
  assert.match(xml, /id="write-kv-edge" d="M172 260 V392"/);
  assert.match(xml, /id="write-slot-edge" d="M425 260 V392"/);
  assert.match(xml, /id="read-hist-edge" d="M990 392 V268"/);
  assert.match(xml, /id="attention-backend"/);
  assert.match(xml, /读回历史 K\/V/);
  // slot_mapping is a locator, so it must not sit as an intermediate hop for K/V.
  assert.doesNotMatch(xml, /新 K \/ V[\s\S]{0,400}slot_mapping[\s\S]{0,200}物理 KV Cache/);
  assert.match(page("04"), /Attention Backend 据此从缓存读回历史 K\/V/);
  assert.match(page("04"), /依据 Block Table 从缓存读回历史 K\/V/);
});

test("05: static batch idles freed slots; continuous batch refills them", () => {
  const xml = svg("05-iteration-batching.svg");
  idsAreUnique(xml, "05");
  // Static panel must show the wasted slots instead of only completion lines.
  assert.match(xml, /id="static-idle-a"/);
  assert.match(xml, /id="static-idle-c"/);
  assert.match(xml, /槽位闲置/);
  // Continuous panel steps keep B running while A is replaced by D.
  assert.match(xml, /id="cont-step1"[^>]*\/><text[^>]*>Step 1 · A \+ B \+ C/);
  assert.match(xml, /id="cont-step2"[^>]*\/><text[^>]*>Step 2 · B \+ C \+ D/);
  assert.match(page("05"), /A 退出后等待队列中的 D 可在下一轮补入/);
  assert.match(page("05"), /槽位闲置到 B 结束才可能被复用/);
});

test("06: offline and online verification are parallel, not a mandatory chain", () => {
  const xml = svg("06-first-run-path.svg");
  idsAreUnique(xml, "06");
  for (const id of ["step-check", "step-install", "docker-alt", "step-offline", "step-server"]) {
    assert.match(xml, new RegExp('id="' + id + '"'));
  }
  // Both validation boxes share the same branch row (y = 330).
  assert.match(xml, /id="step-offline" x="160" y="330"/);
  assert.match(xml, /id="step-server" x="680" y="330"/);
  // Install step must not point straight at one validation box only.
  assert.match(xml, /安装成功后，两条验证路径可分别进行/);
  assert.match(page("06"), /是两条可分别进行的验证路径，不是强制的前后依赖/);
});

test("07: precision/kernel layer also depends on config, not only weights", () => {
  const xml = svg("07-model-config-map.svg");
  idsAreUnique(xml, "07");
  for (const id of ["step-source", "step-config", "step-input", "step-weights", "step-precision", "step-runtime"]) {
    assert.match(xml, new RegExp('id="' + id + '"'));
  }
  // Dashed dependency edge config(2) -> precision/kernel(5), distinct from the snake chain.
  assert.match(xml, /id="config-to-precision" d="M605 290 V338"/);
  assert.match(xml, /stroke-dasharray="7 5" marker-end="url\(#arr07p\)"/);
  assert.match(xml, /quantization_config/);
  assert.match(page("07"), /量化方法通常从模型配置的 <code>quantization_config<\/code> 读取/);
});

test("08: per-request cache multiplies per-token bytes by tokens", () => {
  const xml = svg("08-kv-memory-budget.svg");
  idsAreUnique(xml, "08");
  assert.match(xml, /2 × L × H_KV × D_head × dtype_bytes/);
  // First chain node must explain per-request = per-token bytes × tokens, not a bare "1 ×".
  assert.match(xml, /id="per-request"[\s\S]{0,400}每 token 字节 × 该请求 token 数/);
  assert.doesNotMatch(xml, /1 × 每请求缓存/);
  assert.match(xml, /id="multiply-concurrency"/);
  assert.match(xml, /id="total-kv"/);
  assert.match(page("08"), /乘上该请求的 token 数得到每请求缓存/);
});

test("09: free returns hash-retaining block to queue; eviction is conditional", () => {
  const xml = svg("09-prefix-cache-hash.svg");
  idsAreUnique(xml, "09");
  for (const id of ["hash-chain", "lifecycle-lookup", "lifecycle-touch", "lifecycle-free", "lifecycle-evict"]) {
    assert.match(xml, new RegExp('id="' + id + '"'));
  }
  // Freed block keeps its hash and is only later evicted; the Free->Evict edge is dashed.
  assert.match(xml, /id="lifecycle-free"[\s\S]{0,400}保留 hash/);
  assert.match(xml, /stroke-dasharray="6 5" marker-end="url\(#arr09\)"/);
  assert.match(xml, /空间不足时：移除 hash 并回收/);
  assert.match(xml, /释放 ≠ 淘汰/);
  assert.match(page("09"), /“释放”不等于“淘汰”/);
});

test("10: scheduler order is budget→running→waiting→KV; yes-label sits on success edge", () => {
  const xml = svg("10-scheduler-decision-loop.svg");
  idsAreUnique(xml, "10");
  for (const id of ["step-budget", "step-running", "step-waiting", "step-kv", "decision-kv", "step-preempt", "step-output", "decision-to-output", "decision-to-preempt", "preempt-retry"]) {
    assert.match(xml, new RegExp('id="' + id + '"'));
  }
  // Top row left→right: budget → running → waiting → KV.
  const order = ["step-budget", "step-running", "step-waiting", "step-kv"].map((id) => xml.indexOf('id="' + id + '"'));
  assert.deepEqual(order, [...order].sort((a, b) => a - b), "box order must be budget→running→waiting→KV");
  // "是" labels the success edge 判定→SchedulerOutput, not the orange retry edge.
  const retryStart = xml.indexOf('id="preempt-retry"');
  const retryLabel = xml.indexOf('>释放后重试<');
  assert.ok(retryLabel > retryStart && retryLabel - retryStart < 260, "retry edge must carry its own label");
  assert.doesNotMatch(xml.slice(retryStart, retryLabel), /是/);
  assert.ok(xml.indexOf('>是</text>') > xml.indexOf('id="decision-to-output"'), "是 must follow the success edge");
  assert.match(page("10"), /class="diagram-pan"/);
  assert.match(page("10"), /接纳 Waiting[\s\S]{0,400}申请 KV blocks/);
});

test("10: preemption victim is another running request, not the requesting one", () => {
  const xml = svg("10-preemption-recompute.svg");
  idsAreUnique(xml, "10p");
  for (const id of ["step-fail", "step-victim", "step-preempted", "step-waiting", "step-readmit", "step-hit", "step-recompute", "waiting-to-readmit", "readmit-to-hit", "readmit-to-recompute"]) {
    assert.match(xml, new RegExp('id="' + id + '"'));
  }
  assert.match(xml, /另一条 Running 请求 · FCFS \/ Priority/);
  assert.match(page("10"), /抢占对象是另一条正在运行的请求/);
});

test("11: prefill chunk bars scale with token count", () => {
  const xml = svg("11-chunked-prefill-timeline.svg");
  idsAreUnique(xml, "11");
  for (const id of ["step1-decode", "step1-prefill", "step2-prefill", "step3-prefill", "step4-decode", "step4-prefill"]) {
    assert.match(xml, new RegExp('id="' + id + '"'));
  }
  const w = (id) => Number(xml.match(new RegExp('id="' + id + '"[^>]*width="(\\d+)"'))[1]);
  const near = (a, b) => Math.abs(a - b) < 0.05;
  assert.ok(near(w("step1-prefill") / w("step1-decode"), 13 / 3), "step1 bars must scale with tokens");
  assert.ok(near(w("step4-prefill") / w("step4-decode"), 1 / 3), "step4 bars must scale with tokens");
  assert.ok(w("step4-prefill") < w("step1-prefill"), "1-token chunk must be shorter than 13-token chunk");
  assert.match(page("11"), /class="diagram-pan"/);
  assert.match(page("11"), /横条长度与 token 数成正比/);
});

test("12: process topology shows both request and result directions", () => {
  const xml = svg("12-v1-process-topology.svg");
  idsAreUnique(xml, "12");
  for (const id of ["client", "api-server", "engine-core", "scheduler", "kv-manager", "gpu-workers", "gpu-devices", "dp-coordinator", "api-to-engine", "engine-to-api", "engine-to-worker", "worker-to-engine", "dp-to-engine"]) {
    assert.match(xml, new RegExp('id="' + id + '"'));
  }
  // Return edges exist and are dashed so they cannot be confused with the forward path.
  assert.match(xml, /id="engine-to-api"[^>]*stroke-dasharray/);
  assert.match(xml, /id="worker-to-engine"[^>]*stroke-dasharray/);
  assert.match(page("12"), /请求沿正向流动，结果沿反方向返回/);
  assert.match(page("12"), /DP &gt; 1 时存在多个 rank/);
});

test("12: EngineCore step loop order schedule → execute → collect → update → output", () => {
  const xml = svg("12-enginecore-step-loop.svg");
  idsAreUnique(xml, "12s");
  for (const id of ["input-queue", "schedule", "execute", "collect", "update", "output-queue", "input-to-schedule", "schedule-to-execute", "execute-to-collect", "collect-to-update", "update-to-output", "loop-back"]) {
    assert.match(xml, new RegExp('id="' + id + '"'));
  }
  const order = ["input-to-schedule", "schedule-to-execute", "execute-to-collect", "collect-to-update", "update-to-output"].map((id) => xml.indexOf('id="' + id + '"'));
  assert.deepEqual(order, [...order].sort((a, b) => a - b), "step order must be monotonic");
  assert.match(xml, /id="update-to-output"[^>]*d="M1115 222 V300 H920"/);
  assert.match(page("12"), /class="diagram-pan"/);
});

test("13: preemption returns to Waiting and conditional waits resume, not finish", () => {
  const xml = svg("13-request-lifecycle.svg");
  idsAreUnique(xml, "13");
  for (const id of ["api-input", "state-waiting", "state-running", "output-processing", "state-finish", "state-preempted", "state-cond-waits", "running-to-preempted", "preempted-to-waiting", "waiting-to-cond", "cond-to-waiting"]) {
    assert.match(xml, new RegExp('id="' + id + '"'));
  }
  // PREEMPTED is entered from RUNNING and returns to WAITING (a resumable branch, not a terminal one).
  assert.match(xml, /id="running-to-preempted"[^>]*marker-end/);
  assert.match(xml, /id="preempted-to-waiting"[^>]*d="M560 340 H440 V212"/);
  // Conditional waits loop back to Waiting; nothing routes a waiting state straight to OUTPUT.
  assert.match(xml, /id="cond-to-waiting"[^>]*d="M400 300 V212"/);
  assert.doesNotMatch(xml, /H930 V207/);
  assert.match(xml, /可恢复 · 非终态/);
  assert.match(page("13"), /class="diagram-pan"/);
  assert.match(page("13"), /PREEMPTED 由 RUNNING 进入/);
});

test("14: temperature scales logits before softmax; filters run on probabilities", () => {
  const xml = svg("14-sampling-pipeline.svg");
  idsAreUnique(xml, "14");
  for (const id of ["model-logits", "logits-processors", "temperature", "softmax", "candidate-filters", "renormalize", "select-token"]) {
    assert.match(xml, new RegExp('id="' + id + '"'));
  }
  // Order must be logits → processors → temperature → softmax; softmax must not precede temperature.
  const order = ["model-logits", "logits-processors", "temperature", "softmax"].map((id) => xml.indexOf('id="' + id + '"'));
  assert.deepEqual(order, [...order].sort((a, b) => a - b), "temperature must scale logits before softmax");
  assert.match(xml, /id="softmax-to-filters"[^>]*d="M927 265 V341"/);
  assert.match(page("14"), /class="diagram-pan"/);
  assert.match(page("14"), /Temperature 缩放的是 logits，softmax 在其后产生概率/);
});

test("15: serving topology shows request down and streamed response back", () => {
  const xml = svg("15-production-serving-topology.svg");
  idsAreUnique(xml, "15");
  for (const id of ["clients", "api-gateway", "router", "replica-pool", "observability", "clients-to-gateway", "gateway-to-router", "router-to-replica", "replica-to-client"]) {
    assert.match(xml, new RegExp('id="' + id + '"'));
  }
  // Forward path left→right and a dashed return lane into Clients.
  assert.match(xml, /id="replica-to-client"[^>]*d="M845 305 H137 V240"/);
  assert.match(xml, /id="replica-to-client"[^>]*stroke-dasharray/);
  assert.match(page("15"), /class="diagram-pan"/);
  assert.match(page("15"), /流式响应沿橙色虚线反方向返回客户端/);
});

test("16: traffic flows Service → Pod and Device Plugin registers devices with kubelet", () => {
  const xml = svg("16-kubernetes-gpu-scheduling.svg");
  idsAreUnique(xml, "16");
  for (const id of ["deployment", "api-scheduler", "gpu-node", "gpu-driver", "device-plugin", "kubelet", "ready-pod", "service-router", "plugin-to-kubelet", "kubelet-to-scheduler", "service-to-pod"]) {
    assert.match(xml, new RegExp('id="' + id + '"'));
  }
  // Service must point at the Ready Pod, not the other way round.
  assert.match(xml, /id="service-to-pod"[^>]*d="M340 440 H600 V490 H726"[^>]*marker-end="url\(#a16\)"/);
  assert.match(xml, /id="plugin-to-kubelet"[^>]*marker-end/);
  assert.match(xml, /id="kubelet-to-scheduler"[^>]*stroke-dasharray/);
  assert.match(page("16"), /class="diagram-pan"/);
  assert.match(page("16"), /Service \/ Router → Ready Pod/);
});

test("17: latency spans are ordered and measurement boundary is stated", () => {
  const xml = svg("17-latency-waterfall.svg");
  idsAreUnique(xml, "17");
  for (const id of ["timeline-events", "seg-queue", "seg-prefill", "seg-decode", "span-ttft", "span-e2e", "span-itl", "tpot-note"]) {
    assert.match(xml, new RegExp('id="' + id + '"'));
  }
  // TTFT ends where Decode begins; E2E spans the whole line.
  assert.match(xml, /id="span-ttft"[^>]*d="M105 125 V105 H565 V125"/);
  assert.match(xml, /id="span-e2e"[^>]*d="M105 285 V310 H1090 V285"/);
  assert.match(xml, /服务端 Queue Time 从引擎收到请求起计/);
  assert.match(page("17"), /class="diagram-pan"/);
});

test("18: trust boundaries are directed and cache_salt is not isolation", () => {
  const xml = svg("18-security-trust-boundaries.svg");
  idsAreUnique(xml, "18");
  for (const id of ["public-clients", "tls-gateway", "vllm-api-server", "gpu-worker-network", "operations-network", "public-to-gateway", "gateway-to-api", "api-to-worker-network", "operations-to-api"]) {
    assert.match(xml, new RegExp('id="' + id + '"'));
  }
  assert.match(xml, /id="gateway-to-api"[^>]*marker-end="url\(#a18\)"/);
  assert.match(xml, /id="public-to-gateway"[^>]*marker-end="url\(#a18o\)"/);
  assert.match(xml, /cache_salt 只缓解特定前缀缓存计时侧信道，不是多租户隔离边界/);
  assert.match(page("18"), /class="diagram-pan"/);
  assert.match(page("18"), /不是多租户隔离边界/);
});

test("19: column-parallel ranks compute in parallel, not chained", () => {
  const xml = svg("19-tensor-parallel-partitions.svg");
  idsAreUnique(xml, "19");
  for (const id of ["col-input", "col-weight", "col-gpu0", "col-gpu1", "row-input", "row-ranks", "allreduce", "w-to-gpu0", "w-to-gpu1", "row-to-gpus", "gpus-to-allreduce"]) {
    assert.match(xml, new RegExp('id="' + id + '"'));
  }
  // Both ranks are fed from the shared input; there must be no GPU0 → GPU1 edge.
  assert.match(xml, /id="w-to-gpu1"[^>]*d="M645 186 V262 H1027 V250"/);
  assert.doesNotMatch(xml, /M862 186 L902 186/);
  assert.match(page("19"), /不是 GPU0 再传给 GPU1/);
  assert.match(page("19"), /class="diagram-pan"/);
});

test("20: PP activation flow and EP dispatch/combine are directed", () => {
  const xml = svg("20-parallelism-topology.svg");
  idsAreUnique(xml, "20");
  for (const id of ["panel-tp", "panel-pp", "panel-dp", "panel-ep", "pp-flow-1", "pp-flow-2", "pp-flow-3", "ep-dispatch-1", "ep-combine-1"]) {
    assert.match(xml, new RegExp('id="' + id + '"'));
  }
  const order = ["pp-flow-1", "pp-flow-2", "pp-flow-3"].map((id) => xml.indexOf('id="' + id + '"'));
  assert.deepEqual(order, [...order].sort((a, b) => a - b), "PP stages must flow left→right");
  assert.match(xml, /id="ep-dispatch-1"[^>]*marker-end/);
  assert.match(xml, /id="ep-combine-1"[^>]*marker-end/);
  assert.match(page("20"), /class="diagram-pan"/);
  assert.match(page("20"), /EP 的橙色箭头表示 token dispatch/);
});

test("21: speculative acceptance keeps only a contiguous prefix plus bonus token", () => {
  const xml = svg("21-speculative-acceptance.svg");
  idsAreUnique(xml, "21");
  for (const id of ["draft", "target", "accept-prefix", "pos-1", "pos-2", "pos-3", "pos-4", "residual-box", "reject-to-correct", "target-to-accept"]) {
    assert.match(xml, new RegExp('id="' + id + '"'));
  }
  assert.match(xml, /接受前缀后目标再产生 1 个 bonus token：E\[L\] = 1 \+ E\[A\]/);
  assert.match(xml, /从残差目标分布校正/);
  assert.match(page("21"), /class="diagram-pan"/);
  assert.match(page("21"), /玩具估计 E\[L\] = 1 \+ E\[A\]/);
});

test("22: gateway guards every modality before encoding and fusion", () => {
  const xml = svg("22-multimodal-input-path.svg");
  idsAreUnique(xml, "22");
  for (const id of ["gateway", "text-tokens", "vision-media", "audio-media", "fusion", "llm-decoder", "gateway-to-text", "gateway-to-vision", "gateway-to-audio", "vision-to-fusion", "audio-to-fusion", "fusion-to-llm"]) {
    assert.match(xml, new RegExp('id="' + id + '"'));
  }
  assert.match(xml, /id="gateway-to-vision"[^>]*marker-end/);
  assert.match(xml, /id="gateway-to-audio"[^>]*marker-end/);
  assert.match(page("22"), /class="diagram-pan"/);
  assert.match(page("22"), /三类输入都先经过 Gateway 的媒体策略/);
});
