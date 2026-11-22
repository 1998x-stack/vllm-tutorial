# Repository instructions

This repository is a version-aware, visual learning course about the vLLM inference engine. The authoritative content workflow is [skills/vllm-tutorial/SKILL.md](skills/vllm-tutorial/SKILL.md).

## Non-negotiable principles

1. **Correctness before presentation.** Verify technical claims against current official vLLM documentation and source code, then use original papers for historical design claims. Record the exact version or retrieval date whenever behavior is version-sensitive.
2. **Explain the problem before naming the solution.** Every chapter opens with a plain-language explanation of the question being answered, why it matters, and what the reader should understand by the end.
3. **No fabricated evidence.** Do not invent benchmark numbers, performance multipliers, default values, compatibility statements, customer stories, or personal anecdotes. Every numeric result must identify its model, hardware, workload, metric, comparison baseline, and source.
4. **One article, one learning question.** Figures must explain the article's actual mechanism, not decorate the page. Use original SVG with a meaningful title, description, labels, and caption.
5. **Offline-first.** No CDN, remote fonts, analytics, or required network requests for article rendering. External links are references, not runtime dependencies.
6. **Preserve the course contract.** The 28 chapter numbers and local `file://` reading path remain stable. Update `courses.json`, regenerate `courses-data.js` with `python3 scripts/build_course_data.py`, and keep navigation links synchronized.
7. **Keep work auditable.** Add or update `evidence/NN.json` for substantive claims in rewritten chapters. Separate official behavior, paper results, derived calculations, toy examples, and recommendations.
8. **Respect model and cache boundaries.** Pin model / tokenizer / code revisions independently where needed; treat remote code as a trust decision. For Prefix Cache, distinguish physical block size, hash block size, and cache-hit alignment, and never generalize hybrid-model partial-hit behavior to every model.
9. **Explain scheduler behavior precisely.** Distinguish per-step token budgets from request-count limits; describe Running and Waiting admission order, FCFS / Priority semantics, KV allocation and preemption. A PREEMPTED request is resumable, not finished.
10. **Treat Chunked Prefill as dynamic scheduling.** It uses remaining per-step token budget; do not describe `max_num_batched_tokens` as a fixed chunk size. Explain TTFT / ITL trade-offs and multimodal item boundaries.
11. **Keep process topology version-scoped.** Separate API Server, Engine Core, GPU Worker and conditional DP Coordinator responsibilities. Process counts depend on DP / TP / PP, API-server settings and executor mode.
12. **Never claim QA that was not run.** Report static checks, browser checks, GPU benchmarks and deployment checks separately.

## Editing workflow

- Read this file, the course metadata, target chapter, adjacent chapters, relevant `docs/` notes and the matching skill references before editing.
- Work chapter by chapter. Avoid broad find-and-replace that could silently change technical meaning.
- Prefer shared CSS and small progressive-enhancement JavaScript over repeated inline styles.
- Keep semantic structure: one `h1`, a `main`, one `article`, meaningful `section` headings, accessible figures and keyboard-operable controls.
- For a diagram change, update the corresponding standalone SVG and check that the HTML caption and SVG labels tell the same story.
- For vLLM flags, defaults, APIs, scheduler behavior or backend support, cite the exact official docs page and state that these can change between releases.
- For every code sample, state whether it is executable, illustrative pseudocode or a version-specific configuration example.

## Validation

Run the checks available in the repository:

```bash
python3 scripts/build_course_data.py --check
node --test tests/offline-catalog.test.cjs
python3 scripts/validate_articles.py
```

When browser tooling is available, inspect desktop and narrow mobile widths, keyboard navigation, figures, code overflow, links, console errors and at least one meaningful interaction. Do not mark a skipped browser check as passed.


## Production engineering chapter rules

13. **Sampling must be mathematical and version-scoped.** Define logits, softmax, temperature, Top-k, Top-p and Min-p explicitly. Temperature zero is a greedy special path in the pinned V1 implementation; do not describe it as division by zero. Label toy sampler visualizers as conceptual, not as a reproduction of a GPU kernel's exact operation order.
14. **Use current generation APIs.** Prefer `structured_outputs`; do not teach removed `guided_json`, `guided_regex` or other legacy fields as current APIs. Explain that syntactically constrained output does not establish semantic correctness. Distinguish raw and processed logprobs where relevant.
15. **Production artifacts must be reproducible.** Pin tested container image tags and preferably digests, model revisions and tokenizer revisions. Treat cache volumes, shared memory, credentials, non-root execution and model code as separate deployment decisions. Never prescribe universal GPU memory ratios, concurrency or latency targets without a workload and hardware baseline.
16. **Kubernetes GPU resources are explicit.** Verify device drivers and Device Plugin, request the actual extended resource, and explain MIG / time-slicing differences. Separate startup, readiness and liveness probes; separate Deployment rollout controls from PodDisruptionBudget. GPU surge capacity and model cold-start time are part of rollout design.
17. **Observability definitions must not be conflated.** Define client TTFT, ITL, request TPOT, Queue Time and E2E with measurement boundaries. Use current vLLM V1 metric names, explain Histogram quantiles and bucket cardinality, and avoid high-cardinality Prometheus labels. Detailed tracing can add overhead.
18. **Security is a boundary, not a flag.** Audit the exact deployed version's endpoint authentication coverage; place vLLM behind a Gateway with endpoint allowlisting and private networking. Treat distributed communication and KV transfer as trusted-network traffic. vLLM processes shared by tenants do not provide tenant isolation; `cache_salt` mitigates a specific prefix-cache timing side channel but is not an isolation boundary.
19. **Enforce application authorization outside the model.** Prompt text, structured outputs and content filters are not authorization. Apply identity checks to tools and data access, scope client-provided cache identifiers at a trusted gateway, constrain request resource budgets, and redact sensitive logs.


## Advanced inference and source-reading chapter rules

20. **Parallelism must be explained by partition axis.** Distinguish ColumnParallel and RowParallel weight matrices; label GEMM shapes and where All-Gather, All-Reduce or Reduce-Scatter changes data. Never claim that doubling TP doubles speed.
21. **PP, DP and EP are not interchangeable.** PP splits layers, DP distributes request batches (with MoE-specific coordinator behavior), EP distributes experts and token dispatch. Clarify model replica, rank, global admission controls, and `EP_SIZE = TP_SIZE × DP_SIZE` only when supported by the pinned upstream version.
22. **Speculative decoding has mathematical preconditions.** Describe proposal q, target p, standard acceptance min(1,p/q) and residual correction. Do not claim all draft/verify variants preserve the target distribution; some intentionally relax validation. Acceptance-rate toy labs must disclose independence and constant-probability assumptions, and cannot promise speedup.
23. **Multimodal capability is model-specific.** Separate tokenization, media decode, encoder, projector/fusion and language decoder. Count and size limits do not universally determine visual-token expansion. Verify model/task/frontend/backend support; restrict media URLs, redirects, local paths and cache sharing.
24. **The nano-vLLM chapter pins its own upstream commit.** Trace exact classes and functions (LLMEngine, Scheduler, BlockManager, ModelRunner, Triton store_kvcache) rather than copying production V1 method names. Nano is a teaching implementation, not a drop-in production engine.
25. **Do not invent benchmark claims.** All speedup and memory numbers require model, hardware, concurrency, prompt/output lengths, precision, vLLM commit and baseline. If only an equation or toy example is provided, label it as derived / illustrative.


## Final-course release and applied RAG rules (24–28)

26. **Troubleshooting is hypothesis-driven.** Capture environment / model / GPU / full failing operation and request characteristics before changing configuration. Separate startup OOM, load failure, runtime KV pressure, NCCL, Torch Compile and CUDAGraph. Warn about performance and log sensitivity when enabling trace/debug modes.
27. **Benchmark evidence is reproducible or explicitly illustrative.** Define measurement boundary, TTFT, ITL, TPOT, E2E, output token throughput, completion rate, failures, workload, cache cold/warm state and model/hardware. Use the current official CLI, not stale flags, and never claim a fabricated speedup.
28. **Roadmap maturity labels are mandatory.** Distinguish research paper, merged PR, documented release, reproducible experiment and production observation. Do not assert a speculative research direction is a stable default or future guaranteed release.
29. **RAG examples must actually run without GPU by default.** No simulated model answers. Keep retrieval code and teaching corpus visible, accessible and tested. Apply access controls before retrieval; make source snippets untrusted data. Any optional vLLM client must require an explicit destination and model, restrict SSRF and avoid hard-coded credentials.
30. **Citations are not automatically faithful.** Validate retrieved source IDs, distinguish retrieval Recall@k from generative faithfulness, and disclose that the toy lexical retriever is not an embedding or reranker system. No cross-tenant cache sharing by convenience.
31. **Course completion is not production validation.** All 28 chapters must pass static and mobile browser checks, JavaScript labs, evidence and source review. Source examples have independent tests. Pages requires its own public byte-for-byte smoke check. Real GPU test results are a separate release artifact if ever supplied.
