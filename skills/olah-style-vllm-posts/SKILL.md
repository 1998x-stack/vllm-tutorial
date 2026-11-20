---
name: olah-style-vllm-posts
description: Evidence-grounded, illustrated and interactive vLLM engineering tutorials.
---
# Olah-style vLLM Posts

Adapt progressive visual storytelling and executable teaching from Olah-style explainers to the evolving vLLM inference system. Do not copy third-party prose, diagrams, branding or code.

## Seven-gate workflow

1. **Inspect:** read README, AGENTS, catalog, full target HTML and related notes. Record vLLM release / commit, hardware and date checked.
2. **Research:** prefer exact-release official docs and source, then primary papers. RFCs are proposals until merged and released. Pin source commits for code walkthroughs.
3. **Explain:** follow reader question → workload → mental model → mechanism → shapes / equations → implementation → experiment → limitations. Explain one new term at a time.
4. **Draw:** create original SVG from an explicit node/edge or state-transition list. Include viewBox, title, desc, unique IDs and meaningful caption.
5. **Build:** semantic HTML, one H1, ordered H2/H3, accessible controls, offline assets, reduced-motion and print support.
6. **Validate:** catalog sync, Python / Node tests, evidence validation, desktop/tablet/mobile Playwright, console, local assets and actual demo interaction.
7. **Publish:** branch, inspect per-article diff, open PR, check CI, merge and verify Pages deployment separately.

## vLLM correctness gates

- KV Cache: layers, KV heads, head dimension, dtype, K/V factor and block alignment.
- PagedAttention: distinguish logical blocks, physical block IDs, block table, slot mapping write path and attention read path. Block size is not a universal constant.
- Scheduler: iteration-level token budget, request states, FCFS / priority policy, preemption and chunked prefill are distinct concepts.
- V1 architecture: API Server, Engine Core, GPU Worker and conditional DP Coordinator; process counts depend on TP / PP / DP.
- TP / PP / DP / EP partition different things; avoid universal bandwidth claims.
- Speculative decoding depends on method, acceptance, draft cost, target verification, QPS and memory.
- Multimodal support is model / processor / release specific.
- Metrics: inspect current `/metrics` and docs; never copy stale names.
- Benchmark: record model revision, hardware, software, request distribution, QPS, concurrency, sampling, warmup and repetitions.

## Hard constraints

Never invent performance numbers, API defaults, model support, feature maturity or release dates. Never imply prefix caching is free, speculative decoding always helps, or an RFC is a released feature. Keep toy demos clearly labelled. Keep each article with an adjacent `evidence.json`.

Read references: `references/vllm-versioning.md`, `references/vllm-mechanisms.md`, `references/evidence-and-citation.md`, `references/narrative-architecture.md`, `references/svg-production.md`, `references/browser-qa.md`, `references/publishing.md`.
