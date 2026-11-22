---
name: vllm-tutorial
description: Create and improve accessible, version-aware, visual technical chapters about LLM inference and vLLM, using progressive explanation, original SVG diagrams, small executable experiments, and evidence-backed engineering guidance.
---

# vLLM Tutorial Authoring Skill

## Purpose and audience

Turn vLLM and LLM-serving concepts into a coherent engineering course for university students, researchers, and early-career inference engineers. The writing should be technically precise without assuming that the reader already knows the answer. Prefer concrete examples, diagrams, and small calculations over unexplained terminology.

This is an adaptation of the repository's Olah-style progressive explanation approach: **build intuition in steps, then connect each step to implementation**. Do not copy external prose, diagrams, branding, or code.

## When to use

- Rewrite one of the 28 existing chapter HTML files.
- Add a new technical chapter or a substantial visual explanation.
- Update the course map, metadata, shared article system, or source-evidence records.
- Review a chapter for technical correctness, version drift, pedagogy, accessibility, or mobile layout.

## Required workflow

### Gate 0 — Inspect before editing

Read:
1. `AGENTS.md`, this skill, and the relevant references.
2. The target HTML and its neighboring chapters.
3. Matching files in `docs/`, `courses.json`, and the current shared CSS/JS.
4. The authoritative upstream documentation and implementation for any version-sensitive behavior.

Do not assume a chapter is correct because it already exists. Treat old text, numbers, code, and diagrams as unverified until checked.

### Gate 1 — Define the learning contract

Write a short internal outline:

`reader question → common misconception → concrete scenario → mechanism → visual steps → equation / shape trace → code or toy experiment → trade-offs → failure modes → recap`

At the beginning of the visible article, answer:
- What is this topic?
- What problem does it solve?
- Where does it sit in the vLLM serving path?
- What will the reader be able to explain or do afterward?

Keep one primary question per chapter. Move tangential topics to a related-chapter link rather than turning every chapter into a glossary.

### Gate 2 — Establish technical truth and version scope

Use sources in this order:
1. Current official vLLM docs and configuration reference.
2. vLLM source code, tests, release notes, and design documents.
3. Original papers for historical algorithms and published experimental claims.
4. Maintainer discussions or issue threads for unresolved behavior.
5. Third-party tutorials only as supplementary intuition, never as sole evidence for defaults or benchmark claims.

For each important claim, record:
- Claim and classification: `official_behavior`, `paper_result`, `derived`, `toy_example`, or `recommendation`.
- Source URL and a section / symbol / commit / table locator.
- Version or retrieval date.
- Whether the claim is verified, derived, illustrative, or unresolved.

Never turn a paper result into a universal guarantee. Benchmark claims must state model, hardware, workload, metric, baseline, and source. If the necessary context is missing, remove the number.

### Gate 3 — Write the explanation before the figure

Use progressive disclosure:
1. Start from a concrete user request, tensor, memory allocation, or scheduling problem.
2. Show the simplest baseline and its limitation.
3. Introduce the new idea in one sentence.
4. Walk through the mechanism in 2–5 numbered states.
5. Map each diagram label to the corresponding data structure, tensor, or code operation.
6. Explain the trade-off and the cases where the idea does not help.

For math, define every symbol and unit. For tensor operations, include shapes and the relevant axis. For algorithms, distinguish per-step cost from total cost. For memory formulas, show the assumptions and calculate a small real example.

### Gate 4 — Build original SVG and semantic HTML

Every rewritten chapter should have:
- One clear `h1`, a concise dek, a plain-language introduction, and explicit learning outcomes.
- Semantic `main > article > section` structure and a useful table of contents.
- At least one topic-specific SVG figure, with `viewBox`, `title`, `desc`, accessible labels, and a human-readable caption.
- Figures that remain understandable without JavaScript.
- Responsive text, code, tables, and diagrams; no page-level horizontal overflow at 360px or 390px.
- Source references close to the claims they support.
- Previous / next chapter links and a link back to the course map.

Do not reuse the same generic diagram across unrelated chapters. A figure must answer a question that the surrounding text has already raised.

### Gate 5 — Add runnable examples and interactions selectively

- Prefer a tiny deterministic example that demonstrates one mechanism.
- Label pseudocode as pseudocode; do not present it as current vLLM source.
- For CLI examples, identify the vLLM version and hardware assumptions when relevant.
- Interactive controls must change meaningful explanatory output, be keyboard operable, expose state accessibly, and have a useful static default.
- Do not add animation or controls merely for decoration.

### Gate 6 — Review technical traps

Check especially:
- Prefill vs decode: decode processes new token queries while attending to cached K/V; do not say that the entire history is recomputed at every step when KV caching is used.
- KV Cache sizing: account for K and V, layers, KV heads, head dimension, token count, dtype bytes, batch/concurrency, and tensor-parallel sharding assumptions. For hybrid models, inspect group-aware capacity rather than multiplying a single block count by one block size.
- Model identity: pin model, tokenizer, and code revisions separately when they come from different repositories. Treat `trust_remote_code` as a code-execution trust decision, not a compatibility shortcut.
- Quantization: distinguish method, numeric scheme, and execution kernel. Keep weight quantization separate from KV Cache dtype; verify the actual hardware/backend path rather than only the checkpoint label.
- Paged KV: distinguish logical block tables, physical blocks, write-slot mapping, and attention backend responsibilities.
- Prefix caching: explain exact token/block matching, parent-hash inputs, extra keys, reference counts, eviction, and version-specific behavior. Distinguish physical block size, hash block size, and cache-hit alignment. Fine-grained / partial hits are model-path-specific (for example, hybrid Mamba shared-prefix checkpoints), not a universal token-granularity guarantee. Do not describe APC as an unqualified pointer-copy trick.
- Continuous batching and scheduling: distinguish iteration-level batching, per-step token budgets, request-count limits, Running / Waiting admission order, FCFS / Priority, KV allocation and preemption. PREEMPTED is resumable, not a terminal finish state.
- Chunked prefill: describe the chunk length as dynamically bounded by the remaining token budget, not as a universal fixed chunk size. Explain the TTFT / ITL trade-off and preserve multimodal item boundaries where required.
- V1 process architecture: separate API Server, Engine Core, GPU Worker / Model Runner and conditional DP Coordinator. Process counts depend on DP / TP / PP, API server settings and executor mode; do not present a typical topology as universal.
- Request lifecycle: trace input preprocessing, EngineCore admission, scheduler state, worker execution, OutputProcessor detokenization / streaming and cleanup. Distinguish WAITING, RUNNING, PREEMPTED and terminal states; note that asynchronous KV transfer or in-flight execution can delay resource reuse.
- Parallelism: show the split dimension and communication collective; do not treat TP, PP, DP, CP, and EP as interchangeable.
- Performance: do not promise that one parameter value or GPU-utilization percentage is optimal for all workloads.

### Gate 7 — Validate and publish

Run:
```bash
python3 scripts/build_course_data.py --check
node --test tests/offline-catalog.test.cjs
python3 scripts/validate_articles.py
```

When browser tooling is available, inspect 1440px desktop and 390px / 360px mobile, console errors, link targets, image/SVG rendering, keyboard focus, reduced-motion behavior, and at least one interaction. Record what was actually tested.

For each rewritten chapter, update `evidence/NN.json` and keep the course metadata synchronized. Keep the chapter number and legacy root filename stable so local file navigation continues to work.

## Quality gate

A chapter is not complete if any critical technical claim is wrong, if it has no topic-specific explanatory figure, or if its main explanation depends on JavaScript. Review these dimensions before marking it done:

| Dimension | Weight |
|---|---:|
| Technical accuracy and version scope | 30 |
| Step-by-step explanation and pedagogy | 25 |
| SVG topology and explanatory value | 20 |
| Executable example / meaningful interaction | 10 |
| Semantic HTML, accessibility, mobile layout | 10 |
| Sources and evidence traceability | 5 |

The score is an editorial aid, not a substitute for factual verification or browser QA.


## Production engineering chapter gates (14–18)

### Sampling and decoding
- Start with a concrete next-token distribution and derive softmax and temperature.
- Define Top-k as a fixed candidate-count cap, Top-p as a cumulative-probability nucleus, and Min-p as a threshold relative to the highest token probability.
- Pin defaults and validation ranges to the inspected vLLM version. Temperature zero may enter a special greedy path and can disable truncation filters; never apply the ordinary division formula at T=0.
- Explain presence / frequency / repetition penalties, seed and stop conditions as distinct mechanisms.
- Use the current `structured_outputs` API. Call out removed legacy guided fields and backend-specific schema / regex limitations. Explain why valid JSON does not guarantee valid business content.
- A sampler visualizer must disclose its toy logits and simplified filter sequence; do not claim it reproduces vLLM's fused GPU kernel.

### Production deployment and Kubernetes
- Model the complete request path: TLS Gateway → auth / quota → Router → vLLM replica → observability.
- Pin image version / digest, model revision, tokenizer revision and relevant config. Never recommend `latest` as a reproducible production artifact.
- Separate model weights, KV Cache, runtime workspace, communication buffers and safety margin in capacity discussions. Do not publish universal GPU memory ratios or max concurrency values.
- Treat shared-memory configuration (`--ipc=host` or `--shm-size`), model cache persistence, non-root execution and secret injection as explicit decisions.
- For Kubernetes, verify Device Plugin and extended GPU resources. Explain GPU limits / requests rules, MIG and sharing plugin caveats, node topology, probes, rolling update surge capacity and PDB semantics.
- Describe vLLM Production Stack as an optional reference stack. Pin Chart / CRD versions and distinguish cache-aware routing from load-aware routing.

### Observability
- Define client-side TTFT, inter-output ITL, request-level TPOT, queue time and E2E by their exact measurement boundaries.
- Verify every metric name and type against the current official metrics reference and a live `/metrics` endpoint before making operational claims.
- Teach Prometheus Histogram quantiles using `_bucket`, `rate()` and `histogram_quantile()`. Explain bucket cardinality and avoid user / request IDs, prompts or arbitrary tenant IDs as labels.
- Separate metrics (aggregates), logs (events) and traces (request timelines). Warn that detailed tracing may add overhead.

### Security and multi-tenancy
- Read the current vLLM Security document before describing API key coverage; do not imply `--api-key` protects every endpoint.
- Recommend a Gateway endpoint allowlist, private serving network, restricted metrics and operational endpoints, and isolated distributed / KV transfer networks.
- State clearly that tenants sharing one vLLM server process share scheduler and caches; `cache_salt` mitigates a specific prefix-cache timing side channel but does not create tenant isolation.
- Scope cache salts and multimodal UUIDs at a trusted gateway. For strong tenant isolation, consider dedicated serving instances.
- Put tool authorization, RAG ACLs, generated-code sandboxing and action validation at application execution boundaries, not only in prompts.


## Advanced inference and source-reading gates (chapters 19–23)

### Parallelism
- Draw each partition dimension explicitly: TP splits matrices, PP splits layers/stages, DP distributes independent request batches, and EP places MoE expert weights.
- Use named and shape-checked local tensors to derive column / row linear projection identities. Identify the exact aggregation collective and its alternative implementations instead of drawing a universal fixed kernel sequence.
- Disclose latency, memory and bandwidth tradeoffs; never imply performance scales linearly with TP/PP/DP sizes. Record GPU topology and model architecture when benchmarking.
- For MoE, inspect the deployed version's DP Coordinator, EP group size, token dispatch and backend. Distinguish per-rank max_num_seqs from API-level admission controls.

### Speculative Decoding
- Teach the proposal-target distinction, accept-reject formula and residual correction before claiming speedups. Standard rejection sampling is distribution preserving (up to numerical limits), but nonstandard methods may deliberately trade that guarantee.
- Separate conditional acceptance rate, accepted draft prefix length, generated tokens per verification and actual ITL/TPOT. A simple `sum(a^i)` lab is allowed only with an explicit iid constant-acceptance assumption.
- Inspect current SpeculativeConfig for method names and parameter options. Re-run compatibility tests for PP, quantization, model family and sampler backend before recommending production usage.

### Multimodal
- Show media decode, input preprocessor, encoder and language-model fusion as separate, model-dependent mechanisms.
- Explicitly verify model-specific chat templates, image placeholders, video frame policy, audio sampling rate and modality limits. Distinguish media item counts, pixels, encoder tokens and effective text decoder tokens.
- Treat remote media fetch as SSRF risk; apply allowed-media-domains / redirect control, gateway quotas and per-tenant cache scopes. Do not use an unrestricted local media path.

### nano-vLLM
- Pin nano-vLLM commit independently from vLLM V1. Read real files rather than deriving API behavior from package names.
- Trace `LLMEngine.step → Scheduler.schedule → ModelRunner.run → Scheduler.postprocess`; separately inspect BlockManager allocation, prefix hashes, refcounts, and Triton KV writes.
- State which simplifications differ from production V1 and avoid claims of equivalent performance or feature coverage without comparable measurements.
