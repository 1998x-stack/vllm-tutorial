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

## Coverage ledger — every chapter must be reviewed separately

| Chapter | SVG topic | Status |
|---|---|---|
| 01 | Prefill → Decode lifecycle | Revised; CI/visual QA pending |
| 02 | V1 serving architecture | Revised; CI/visual QA pending |
| 03 | Logical → physical block table | Revised; CI/visual QA pending |
| 04 | KV write/read path | Pending one-by-one review |
| 05 | Iteration-level batching | Pending one-by-one review |
| 06 | First-run engine path | Pending one-by-one review |
| 07 | Model/config/revision map | Pending one-by-one review |
| 08 | KV memory budget | Pending one-by-one review |
| 09 | Prefix hash chain | Pending one-by-one review |
| 10 | Scheduler + recompute preemption (2 SVGs) | Pending one-by-one review |
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
- Next detailed pass: **04 → 05 → 06**, then continue the ledger in numerical order. Preserve this audit instead of asserting all 28 figures are already correct.
