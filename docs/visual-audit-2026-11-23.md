# vLLM Tutorial · Olah-style SVG semantic audit

Review date: **2026-11-23** · Repository: [1998x-stack/vllm-tutorial](https://github.com/1998x-stack/vllm-tutorial) · Reference: [olah-style-paper-posts](https://github.com/1998x-stack/Olah-style-posts/blob/main/skills/olah-style-paper-posts/SKILL.md)

## Scope and acceptance contract

This is **a sequential, source-based review**, not a blanket certification of all 28 chapters. The first batch covers chapters **01 → 02 → 03**, with an independently edited SVG, matching HTML caption, evidence ledger and semantic regression assertion for each.

For every later chapter apply this ordered gate:

1. Read the HTML, source ledger, original SVG and relevant current vLLM upstream code/doc version.
2. State the learner's question and a figure-level testable claim.
3. Make a typed directed-edge ledger: \`from → to / data or state / why / source\`.
4. Check semantic topology before color/layout: first-token location, per-step KV writes/reads, process boundaries, logical-to-physical offset, communication collective, etc.
5. Keep at least 13px nominal label size; visible captions, descriptive \`title\`/\`desc\`, independent \`viewBox\`, consistent roles for arrows and colors.
6. Update chapter narrative, figure alt/caption, evidence record and deterministic test together.
7. Run manifest, HTML/SVG static tests and Chromium at 1440, 768, 390, 360. Open standalone SVG screenshots and verify no overlap, missing arrows, clipped labels or horizontal overflow.
8. Merge only after PR CI and deployment check; unexecuted checks remain **not verified**.

## Chapter 01 — Prefill, first sampling and Decode

**Reader question:** Does every new token restart Prefill, and who produces the very first output token?

**Before:** The old orange dashed loop ended at the Prefill box, despite labelling itself “next Decode iteration”. It also visually positioned KV Cache between Prefill and sampling as if sampling directly consumed the KV storage.

**After:** The top lane now shows \`Prompt → Prefill logits → sample y₁\` and a separate \`Prefill → KV write\`. The lower lane shows \`yₜ → Decode forward → sample yₜ₊₁\`, \`KV → Decode\` reads, \`Decode → KV\` writes, and a stop-conditioned **Decode → Decode** loop. The HTML stepper now clarifies that y₁ is first sampled after processing the prompt, and the first subsequent Decode step consumes y₁ to predict y₂.

**Scope:** Conventional single-request autoregressive inference. Chunked prefill, speculative decoding and prefill/decode disaggregation may produce different physical step layouts. V1 scheduling uses a unified token budget rather than mandatory separate scheduling phases.

**Primary evidence:** [vLLM V1 Guide](https://docs.vllm.ai/en/latest/usage/v1_guide/); [vLLM prompt logprob code](https://docs.vllm.ai/en/stable/api/vllm/v1/worker/gpu/sample/prompt_logprob/) (the final prompt row predicts the first decode token).

**Files:** \`01.html\`, \`assets/diagrams/01-inference-lifecycle.svg\`, \`evidence/01.json\`.

## Chapter 02 — V1 request and result flow

**Reader question:** Where does the GPU result go, and who manages blocks versus where the KV tensor lives?

**Before:** The picture emphasized request dispatch, but response arrows were visually ambiguous and lacked a complete Client-facing return edge.

**After:** Separate directed paths: \`Client → API → Engine Core → GPU Worker(s)\` for work, \`GPU Worker(s) → Engine Core → API → Client\` for returned results/streaming; Scheduler and KV Cache Manager remain within the conceptual Engine Core. The figure explicitly distinguishes **block metadata/lifetime** from device-resident KV tensors.

**Scope:** Conceptual V1 responsibilities, not exact multiprocessing cardinality or all pipeline/data-parallel deployment topologies.

**Primary evidence:** [Official architecture overview](https://docs.vllm.ai/en/latest/design/arch_overview/).

**Files:** \`02.html\`, \`assets/diagrams/02-vllm-serving-architecture.svg\`, \`evidence/02.json\`.

## Chapter 03 — Block Table worked trace

**Reader question:** How is token position 9 located in the physical cache?

**Before:** The four table entries were correct but the figure did not expose a trace from \`t=9\` to the physical slot; one text panel called zero-based offset 1 “the first slot,” which is inconsistent with its own indexing convention.

**After:** The orange trace shows \`floor(9/4)=2\`, \`BlockTable[2]=11\`, and \`9 mod 4=1\`, then highlights **offset 1 / the second slot** within physical block 11. The toy IDs \`[7, 2, 11, 4]\` are explicitly not production addresses or a default vLLM block size.

**Primary evidence:** [PagedAttention paper](https://arxiv.org/abs/2309.06180); [vLLM Paged Attention documentation](https://docs.vllm.ai/en/latest/design/paged_attention/).

**Files:** \`03.html\`, \`assets/diagrams/03-block-table-mapping.svg\`, \`evidence/03.json\`.

## Chapter 04 — KV Cache write path vs read path

**Reader question:** Are “写到哪里” and “从哪里读” the same map, and where does the historical K/V physically come from during attention?

**Before:** The figure drew \`新 K/V → slot_mapping → 物理槽位\` as if K/V passed *through* slot_mapping, and the read lane ran \`Block Table → Attention Backend → 输出\` without a storage read edge, so the physical KV cache appeared only as a write destination.

**After:** Write and read are two opposite edges over **one** shared \`物理 KV Cache · 分页块\` box. Write edges: \`新 K/V → 物理 KV Cache\` (data) and \`slot_mapping → 物理 KV Cache\` (locator). Read edge: \`物理 KV Cache → Attention Backend\` (upward, labelled 读回历史 K/V), with \`Block Table → Attention Backend\` supplying the block order. slot_mapping is now a locator, not an intermediate hop for K/V.

**Scope:** One KV-cache group, no context parallelism; conceptual access responsibilities rather than one backend kernel. Prefix Cache remains a separate management layer.

**Primary evidence:** [vLLM Paged Attention design page](https://docs.vllm.ai/en/latest/design/paged_attention/) (historical-kernel warning); [Automatic Prefix Caching Design (V1)](https://docs.vllm.ai/en/stable/design/prefix_caching/).

**Files:** \`04.html\`, \`assets/diagrams/04-kv-write-read-path.svg\`, \`tests/svg-semantics.test.cjs\`.

## Chapter 05 — Static vs iteration-level batching

**Reader question:** If one batch member finishes early, can its slot be reused right away, and where does the replacement request come from?

**Before:** The static-batch timeline drew A and C as “已完成” bars but showed no idle state after their completion, so the wasted slot—the whole reason continuous batching exists—was invisible; in the continuous panel D appeared in Step 2 without being introduced as a waiting request.

**After:** Static rows now continue with dashed **槽位闲置** blocks from A/C completion to B completion, plus an annotation that the slots cannot be refilled until the whole batch ends. The continuous panel shows four iteration-aligned steps (\`A+B+C\` → \`B+C+D\` → \`B+D+E\` → …) with a footer stating that D comes from the waiting queue and admission still depends on token budget and KV-cache capacity.

**Scope:** Conceptual timeline; bar lengths and colors are illustrative, not measured throughput or latency. The figure does not claim a fixed batch/waiting order beyond iteration-level reorganization.

**Primary evidence:** Orca iteration-level scheduling (Yu et al., OSDI 2022); [vLLM V1 scheduler documentation](https://docs.vllm.ai/en/latest/design/scheduler/).

**Files:** \`05.html\`, \`assets/diagrams/05-iteration-batching.svg\`, \`tests/svg-semantics.test.cjs\`.

## Chapter 06 — First-run path: check, install, then verify

**Reader question:** Is offline inference a mandatory prerequisite for the online API, and where does the Docker route fit?

**Before:** Four boxes were chained with mandatory arrows \`环境检查 → 安装 → 离线推理 → 在线服务\`, implying you must run offline inference before the server, and the Docker route (section 6.5) was absent from the picture.

**After:** Steps 1–2 remain a real dependency (\`检查环境 → 安装 vLLM\`). The installed engine then branches to two **parallel** validation paths at the same row—\`离线批量推理（Python API）\` and \`在线服务验证（OpenAI API）\`—labelled “安装成功后，两条验证路径可分别进行”. A dashed \`官方 Docker 镜像\` box marks the alternative to manual steps 1–2, and the footer stresses layered troubleshooting.

**Scope:** Recommended onboarding order, not a dependency graph of the engine internals; Python range, wheels and model support are version- and hardware-scoped.

**Primary evidence:** [vLLM Quickstart](https://docs.vllm.ai/en/stable/getting_started/quickstart/); [GPU Installation Guide](https://docs.vllm.ai/en/latest/getting_started/installation/gpu/); [Using Docker](https://docs.vllm.ai/en/latest/deployment/docker/).

**Files:** \`06.html\`, \`assets/diagrams/06-first-run-path.svg\`, \`tests/svg-semantics.test.cjs\`.

## Chapter 07 — Model load layers: identity → config → weights → precision

**Reader question:** Does precision/kernel selection depend only on the loaded weights, or also on the model config?

**Before:** A six-box snake drew a single dependency chain, so the precision/kernel layer looked like it derived solely from weight loading; the figure also lacked the mobile pan wrapper used by chapters 01–06.

**After:** The snake order is preserved, but a dashed purple edge \`配置与架构解析 → 精度与执行 Kernel\` (labelled \`quantization_config\`) is added, matching the chapter’s statement that the quantization method is read from the model config rather than decided by weights alone. Unit ids were added for deterministic assertions.

**Scope:** The chain is load-time order plus a failure-isolation layer, not a full vLLM loader call graph; method/scheme/kernel names and support matrices are version- and hardware-scoped.

**Primary evidence:** [vLLM Engine Arguments](https://docs.vllm.ai/en/latest/configuration/engine_args/) (revision, tokenizer_revision, code_revision, dtype); chapter 7.4 quantization method/scheme distinction.

**Files:** \`07.html\`, \`assets/diagrams/07-model-config-map.svg\`, \`tests/svg-semantics.test.cjs\`.

## Chapter 08 — KV memory budget arithmetic

**Reader question:** How do you get from a per-token KV size to a total concurrency budget without skipping the token count?

**Before:** The bottom chain started at \`1 × 每请求缓存\`, so the visual jumped from the per-token formula straight to a per-request cache with a stray \`1 ×\`, and the \`× 该请求 token 数\` step only existed in the prose/desc. The figure also lacked the mobile pan wrapper.

**After:** The first chain node now reads \`每请求缓存 = 每 token 字节 × 该请求 token 数\`, followed by \`× 并发请求数\` and \`总理论 KV Cache\`; the memory-partition bar and formula gained unit ids. The per-token formula \`2 × L × H_KV × D_head × dtype_bytes\` is unchanged.

**Scope:** Standard full attention, one KV group; GQA uses KV heads, and TP/PP, MLA, sliding window and mixed groups need layout-specific correction. The top partition bar is conceptual and not to scale.

**Primary evidence:** Kwon et al., PagedAttention (SOSP 2023) for paged KV sizing; in-page references: [KV offloading](https://docs.vllm.ai/en/latest/features/kv_offloading_usage/) and [Quantized KV cache](https://docs.vllm.ai/en/latest/features/quantization/quantized_kvcache/); chapter 8.2 GQA worked example.

**Files:** \`08.html\`, \`assets/diagrams/08-kv-memory-budget.svg\`, \`tests/svg-semantics.test.cjs\`.

## Chapter 09 — Prefix-cache hash chain and lifetime

**Reader question:** Does releasing a cached block immediately evict it, or is eviction a separate, later event?

**Before:** The lifetime row was a plain chain \`Lookup → Touch/ref_cnt++ → Free/ref_cnt-- → LRU Eviction\`, so freeing a block appeared to evict it immediately—contradicting the chapter’s statement that a zero-reference block returns to the Free Queue with its hash retained and stays reusable.

**After:** The \`Free\` node now reads “归零后回 Free Queue，保留 hash”, the \`Free → LRU Eviction\` edge is **dashed**, and the eviction node reads “空间不足时：移除 hash 并回收”. A row note states 释放 ≠ 淘汰. Unit ids were added and the mobile pan wrapper supplied.

**Scope:** Exact token-prefix blocks with one KV group; the special hybrid-Mamba sub-block checkpoint is a constrained path and is labelled as such. Block size 4 is illustrative.

**Primary evidence:** In-page references: [Automatic Prefix Caching design](https://docs.vllm.ai/en/latest/design/prefix_caching/) and [APC feature guide](https://docs.vllm.ai/en/latest/features/automatic_prefix_caching/).

**Files:** \`09.html\`, \`assets/diagrams/09-prefix-cache-hash.svg\`, \`tests/svg-semantics.test.cjs\`.

## Chapter 10 — Scheduler decision loop and recompute preemption

**Reader question:** In one scheduler iteration, in what order are Running and Waiting requests handled, where does KV allocation sit, and when allocation fails, which request is preempted?

**Before:** Figure 1 drew `② 推进 Running → ③ 接纳 Waiting → ④ 申请 KV`, but the prose's ordered list put `申请 KV blocks` before `接纳 Waiting`, contradicting both the figure and the interactive stepper. The green `是` label sat on the orange dashed preemption-retry edge instead of on the `判定 → SchedulerOutput` success edge. Figure 2 named the victim only as `FCFS / Priority`, so a reader could read the failing request as the one that becomes PREEMPTED. Neither figure had the mobile pan wrapper used in 01–09.

**After:** The prose ordered list now reads `接纳 Waiting` → `申请 KV blocks`, matching figure 1 and the stepper (budget → Running → Waiting → KV → SchedulerOutput), and states that allocation happens inside each request's processing branch rather than in one global stage. Box and edge IDs were added; the `是` label moved onto the `decision-to-output` edge, and the retry edge is explicitly labelled `释放后重试`. Figure 2 now reads `另一条 Running 请求 · FCFS / Priority`, and the caption states the preemption target is another running request, not the requesting one. Both figures gained the keyboard-focusable `diagram-pan` wrapper.

**Scope:** Simplified main path. Multimodal Encoder, KV Connector and Speculative Decoding branches are omitted; both the Running pass and the Waiting admission path allocate KV per request, which figure 1 groups into one step.

**Primary evidence:** In-page references: [Architecture Overview — Scheduler](https://docs.vllm.ai/en/latest/design/arch_overview/) and [Optimization — Preemption](https://docs.vllm.ai/en/latest/configuration/optimization/#preemption); pinned source `vllm/v1/core/sched/scheduler.py` and `vllm/config/scheduler.py` at commit `c2fb5c5aba0a904fdbecb8e01b7c41db5bfaeadf`.

**Files:** `10.html`, `assets/diagrams/10-scheduler-decision-loop.svg`, `assets/diagrams/10-preemption-recompute.svg`, `evidence/10.json`, `tests/svg-semantics.test.cjs`.

## Coverage ledger — every chapter must be reviewed separately

| Chapter | SVG topic | Status |
|---|---|---|
| 01 | Prefill → Decode lifecycle | Revised; CI/visual QA pending |
| 02 | V1 serving architecture | Revised; CI/visual QA pending |
| 03 | Logical → physical block table | Revised; CI/visual QA pending |
| 04 | KV write/read path | Revised; CI/visual QA pending |
| 05 | Iteration-level batching | Revised; CI/visual QA pending |
| 06 | First-run engine path | Revised; CI/visual QA pending |
| 07 | Model/config/revision map | Revised; CI/visual QA pending |
| 08 | KV memory budget | Revised; CI/visual QA pending |
| 09 | Prefix hash chain | Revised; CI/visual QA pending |
| 10 | Scheduler + recompute preemption (2 SVGs) | Revised; CI/visual QA pending |
| 11 | Chunked prefill timeline | Pending one-by-one review |
| 12 | V1 process topology + step loop (2 SVGs) | Pending one-by-one review |
| 13 | Request lifecycle | Pending one-by-one review |
| 14 | Sampling pipeline | Pending one-by-one review |
| 15 | Production serving topology | Pending one-by-one review |
| 16 | Kubernetes GPU scheduling | Pending one-by-one review |
| 17 | Latency waterfall | Pending one-by-one review |
| 18 | Security/trust boundaries | Pending one-by-one review |
| 19 | Tensor parallel partitions | Pending one-by-one review |
| 20 | Parallelism topology | Pending one-by-one review |
| 21 | Speculative acceptance | Pending one-by-one review |
| 22 | Multimodal input flow | Pending one-by-one review |
| 23 | nano-vLLM control flow | Pending one-by-one review |
| 24 | Debugging/triage | Pending one-by-one review |
| 25 | Benchmark design | Pending one-by-one review |
| 26 | Evidence maturity roadmap | Pending one-by-one review |
| 27 | RAG trust boundaries | Pending one-by-one review |
| 28 | Course knowledge map | Pending one-by-one review |

## Verification status

- Repository version at review start: \`master\` = \`611d84c130ed18b2fda2f96fbe06e1d82cb5767c\`.
- SVG topology reviewed against chapter prose and official sources for 01–03.
- \`tests/svg-semantics.test.cjs\` adds deterministic regression assertions for the first three diagrams.
- Static, browser, screenshot, interaction and Pages checks: **not verified in this note**. Link actual CI run/PR results before claiming pass.
- Next detailed pass: **10 → 11 → 12**, then continue the ledger in numerical order. Preserve this audit instead of asserting all 28 figures are already correct.
