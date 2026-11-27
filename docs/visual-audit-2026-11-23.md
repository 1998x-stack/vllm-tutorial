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

## Chapter 11 — Chunked Prefill timeline

**Reader question:** When a long prompt shares each iteration's token budget with decode work, how much of the budget does each part use — and is the chunk size fixed?

**Before:** The timeline drew `Decode 3` at 190px and `Prefill chunk 13` at 590px, so bar length implied 3 is about a third of 13 (the real ratio is 3/13 ≈ 0.23), and nothing stated that length encodes token count. The figure had no mobile pan wrapper.

**After:** Bar widths are now proportional to token count (3 tokens → 146px, 13 tokens → 634px, 1 token → 49px); the 1-token final chunk is visibly the shortest; the caption and an in-figure note state 横条长度与 token 数成正比; and the figure gained element ids plus the keyboard-focusable `diagram-pan` wrapper.

**Scope:** Each row is a teaching iteration; the 3-decode / 40-prompt / 16-budget numbers are an illustrative arithmetic example, not a scheduler simulation. Bar length encodes token count only.

**Primary evidence:** In-page references: [Optimization — Chunked Prefill](https://docs.vllm.ai/en/latest/configuration/optimization/#chunked-prefill) and [V1 Scheduler.schedule()](https://github.com/vllm-project/vllm/blob/c2fb5c5aba0a904fdbecb8e01b7c41db5bfaeadf/vllm/v1/core/sched/scheduler.py).

**Files:** `11.html`, `assets/diagrams/11-chunked-prefill-timeline.svg`, `evidence/11.json`, `tests/svg-semantics.test.cjs`.

## Chapter 12 — V1 process topology and EngineCore step loop

**Reader question:** Which processes exist in V1, who talks to whom across which boundary, and what is the order of one EngineCore step?

**Before:** The topology figure drew only the forward path `Client → API Server → Engine Core → GPU Worker → GPU devices`; no return path was shown even though the chapter states the API Server turns Engine Core output into client-visible results. The single Engine Core was drawn next to a conditional DP Coordinator without stating that DP > 1 implies multiple ranks. Neither figure had the mobile pan wrapper or element ids.

**After:** The topology figure now draws dashed return edges `Engine Core → API Server` (输出 / 结果) and `GPU Worker → Engine Core`, and the mid-band edge is labelled `Executor / IPC（请求下行，结果上行）`; box and edge ids were added, and the note plus caption state that only one Engine Core is drawn and that DP > 1 creates multiple ranks coordinated by the DP Coordinator. The step-loop figure gained ids plus a monotonic `input → schedule → execute → collect → update → output-queue` ordering. Both figures gained the keyboard-focusable `diagram-pan` wrapper.

**Scope:** Responsibility and process-boundary illustration, not a fixed process-count formula; the step loop omits grammar masks, KV connector, speculative decoding and error-context branches.

**Primary evidence:** In-page references: [Architecture Overview — V1 Process Architecture](https://docs.vllm.ai/en/latest/design/arch_overview/) and pinned `vllm/v1/engine/core.py`, `multiproc_executor.py`, `gpu_worker.py` at commit `c2fb5c5aba0a904fdbecb8e01b7c41db5bfaeadf`.

**Files:** `12.html`, `assets/diagrams/12-v1-process-topology.svg`, `assets/diagrams/12-enginecore-step-loop.svg`, `evidence/12.json`, `tests/svg-semantics.test.cjs`.

## Chapter 13 — Request lifecycle: Waiting, Running, preemption and finish

**Reader question:** Is a preempted request finished, and where does a request go while waiting for a grammar, remote KV or a streamed input?

**Before:** `RUNNING` was drawn returning to `WAITING` with a single dashed path that carried no arrowhead into the `PREEMPTED` box, so `PREEMPTED` looked like a stray label rather than a state entered from Running. A second dashed path sent `WAITING_FOR_REMOTE_KVS` straight to `OUTPUT`, contradicting the prose that the scheduler resumes scheduling after the transfer. A redundant `WAITING → RUNNING` loop duplicated the direct admission edge, and the figure had no ids, no mobile pan wrapper.

**After:** The figure now draws a directed `RUNNING → PREEMPTED` edge (`KV 不足 · 抢占`) and a separate `PREEMPTED → WAITING` edge (`释放 KV · 回 Waiting`), labelled `可恢复 · 非终态`. The remote/grammar/streaming waits are grouped into one `条件性等待状态` box with directed edges `WAITING → 条件等待` and `条件等待 → WAITING`, so no waiting state routes to OUTPUT. `FINISH → Finished 状态` enumerates STOP/LENGTH/ABORT/ERROR. Box and edge ids were added and the figure gained the keyboard-focusable `diagram-pan` wrapper.

**Scope:** Conceptual state graph, not an exhaustive enum of every `RequestStatus`; a request need not visit every conditional wait. Abort and error still travel through the output path.

**Primary evidence:** In-page references: [Architecture Overview](https://docs.vllm.ai/en/latest/design/arch_overview/) and pinned `vllm/v1/request.py` (`RequestStatus`, `is_finished()`), `vllm/v1/core/sched/scheduler.py`, `vllm/v1/engine/output_processor.py` at commit `c2fb5c5aba0a904fdbecb8e01b7c41db5bfaeadf`.

**Files:** `13.html`, `assets/diagrams/13-request-lifecycle.svg`, `tests/svg-semantics.test.cjs`.

## Chapter 14 — Sampling pipeline order

**Reader question:** Does softmax happen before or after Temperature and the logits processors, and on what does each control operate?

**Before:** The pipeline drew `Model logits → Softmax → Logits processors → Temperature`, i.e. softmax first and the penalties/constraints after it. That contradicted the chapter prose (“Temperature 对 logits 做缩放，再执行 softmax”) and implied two softmax operations in sequence.

**After:** The figure is reordered `Model logits → Logits processors → Temperature (zᵢ/T) → Softmax (pᵢ = softmax(zᵢ/T)) → Candidate filters → Renormalize → Select token`, matching the prose and the vLLM sampler order. The Temperature box now scales logits (`zᵢ / T`) and the Softmax box carries the probability formula; in-figure notes state that penalties/constraints act on logits and that filters act on probabilities. Box and edge ids were added and the figure gained the keyboard-focusable `diagram-pan` wrapper.

**Scope:** Conceptual pipeline, not one kernel's exact call order; the chapter still labels the interactive lab as a teaching model, and Temperature = 0 as a Greedy special path rather than division by zero.

**Primary evidence:** In-page references: [SamplingParams](https://docs.vllm.ai/en/latest/api/vllm/sampling_params/) and pinned `vllm/sampling_params.py`, `vllm/v1/sample/ops/topk_topp_sampler.py` at commit `c2fb5c5aba0a904fdbecb8e01b7c41db5bfaeadf`; Fan et al. (2018), Holtzman et al. (2019), Nguyen et al. (2024).

**Files:** `14.html`, `assets/diagrams/14-sampling-pipeline.svg`, `tests/svg-semantics.test.cjs`.

## Chapter 15 — Production serving topology: request and response paths

**Reader question:** Where does the security boundary sit, and how does a streamed response get back to the client?

**Before:** Every edge pointed left→right (request direction only); there was no response/streaming return lane, even though 15.4 stresses SSE, proxy buffering and client disconnect. Edge colours reused the green marker even on the dashed audit edge.

**After:** The forward path `Clients → API Gateway → Router → vLLM Replica Pool` is unchanged, and a dashed orange return lane `vLLM Replica Pool → Clients` (labelled `流式响应 / 结果返回（经 Router 与 Gateway）`) is added with its own orange marker. Box and edge ids were added and the figure gained the keyboard-focusable `diagram-pan` wrapper.

**Scope:** Responsibility layers, not a fixed proxy implementation; it does not claim Prefix-aware routing is always optimal or that a single replica pool is the only topology.

**Primary evidence:** In-page references: [Prefix-aware routing](https://docs.vllm.ai/projects/production-stack/en/latest/use_cases/prefix-aware-routing.html), [Load-aware routing](https://docs.vllm.ai/projects/production-stack/en/latest/use_cases/loadaware-routing.html) and [Security](https://docs.vllm.ai/en/latest/usage/security/) as cited in chapter 15.

**Files:** `15.html`, `assets/diagrams/15-production-serving-topology.svg`, `tests/svg-semantics.test.cjs`.

## Chapter 16 — Kubernetes GPU scheduling edges

**Reader question:** Who advertises `nvidia.com/gpu`, and which way does traffic flow between a Service and a Ready Pod?

**Before:** The traffic edge was drawn `Ready Pod → Service / Router`, the reverse of its own label “send traffic to Ready Pods”. The `kubelet` box had no incoming edge, so the Device Plugin → kubelet registration link was missing. There was no edge showing kubelet advertising node GPU capacity back to the scheduler.

**After:** Traffic is corrected to `Service / Router → Ready Pod`. A solid `Device Plugin → kubelet` edge (`register devices`) is added, and a dashed `kubelet → API Server + Scheduler` edge labelled `advertise nvidia.com/gpu` shows the capacity advertisement loop. Box and edge ids were added and the figure gained the keyboard-focusable `diagram-pan` wrapper.

**Scope:** Device Plugin and extended-resource names are vendor- and cluster-scoped; MIG and time-slicing change advertised resource semantics and are covered in the chapter prose, not the figure.

**Primary evidence:** In-page references: [Scheduling GPUs](https://kubernetes.io/docs/tasks/manage-gpus/scheduling-gpus/), [Production Stack deployment](https://docs.vllm.ai/en/latest/deployment/integrations/production-stack/) and [Pod disruption budgets](https://kubernetes.io/docs/concepts/workloads/pods/disruptions/) as cited in chapter 16.

**Files:** `16.html`, `assets/diagrams/16-kubernetes-gpu-scheduling.svg`, `tests/svg-semantics.test.cjs`.

## Chapter 17 — Latency waterfall and metric boundaries

**Reader question:** Which segment does each latency metric actually measure, and where does the client clock stop matching the server clock?

**Before:** The timeline drew a `Queue` segment from a client `Request sent` mark to `Scheduled` with no boundary note, so a reader could equate the client-visible queued interval with the server-side `Queue Time` metric even though 17.2 warns against mixing measurement points. The figure had no ids or pan wrapper.

**After:** The spans keep their definitions (`TTFT = first output − request sent`; `E2E = final output − request sent`; `ITL` between adjacent output events; TPOT `≈ (E2E − TTFT)/(output tokens − 1)`), and an in-figure note now states that `Request sent / Final output` are client observation points and that the server-side `Queue Time` starts when the engine receives the request, so it is not identical to the drawn `Queue` segment. Segment, span and note ids were added and the figure gained the keyboard-focusable `diagram-pan` wrapper.

**Scope:** Client-observed definitions; ITL and TPOT diverge when one streaming event carries multiple tokens, and the histogram/bucket caveats remain in the prose.

**Primary evidence:** In-page references: [vLLM metrics design](https://docs.vllm.ai/en/latest/design/metrics/), [Prometheus histograms](https://prometheus.io/docs/practices/histograms/) as cited in chapter 17.

**Files:** `17.html`, `assets/diagrams/17-latency-waterfall.svg`, `tests/svg-semantics.test.cjs`.

## Chapter 18 — Security trust boundaries

**Reader question:** Which components may cross which trust boundary, and is a shared prefix cache a tenant-isolation boundary?

**Before:** The trust-zone diagram had no arrowheads at the boundary crossings and no element ids, so the direction of trust traversal (public → Gateway → private serving network → GPU worker network) was implied only by position. The `cache_salt` caveat in 18.4 had no counterpart in the figure.

**After:** Directional markers were added: `Public Clients → TLS Gateway` (orange) is the only untrusted ingress, `Gateway → vLLM API Server` (green) crosses into the private serving network, `API Server → GPU Worker Network` shows the trusted-node-only distributed boundary, and `Operations Network → API Server` (dashed orange) is a separate operations path. A second note states that `cache_salt` only mitigates a specific prefix-cache timing side channel and is not a tenant-isolation boundary. Box and edge ids were added and the figure gained the keyboard-focusable `diagram-pan` wrapper.

**Scope:** Boundary responsibilities, not a specific gateway product; authorization and tool/data access control remain application responsibilities covered by chapter 19.

**Primary evidence:** In-page references: [vLLM Security](https://docs.vllm.ai/en/latest/usage/security/) and [Kubernetes Network Policies](https://kubernetes.io/docs/concepts/services-networking/network-policies/) as cited in chapter 18.

## Chapter 19 — Tensor parallel partitions

**Reader question:** Do the two tensor-parallel ranks run in sequence, and what does each compute?

**Before:** The column-parallel lane drew `W → GPU 0 → GPU 1`, implying GPU 1 consumed GPU 0's output. Column parallelism actually has both ranks compute from the same input with their own weight shard; only row parallelism needs a cross-rank reduction.

**After:** The column lane now branches `W → GPU 0` and `W → GPU 1` (dashed branch into the second rank) and states `X 广播到各 rank，各自用分片 W 并行计算；下游需全量输出时 Y = [Y₀ | Y₁]（All-Gather）`. The `GPU 0 → GPU 1` edge is removed. The row lane keeps `X = [X₀ | X₁]`,`W = [W₀ ; W₁]` → local `Z₀`,`Z₁` → All-Reduce `Y = Z₀ + Z₁`. Box and edge ids were added and the figure gained the keyboard-focusable `diagram-pan` wrapper.

**Scope:** Two-rank teaching example; real kernels may use Reduce-Scatter / All-Gather fusion and Sequence Parallelism, and TP does not imply doubled throughput.

**Primary evidence:** In-page references: [Parallelism and Scaling](https://docs.vllm.ai/en/latest/serving/parallelism_scaling/), pinned `linear.py` / `parallel_state.py`, and [Megatron-LM](https://arxiv.org/abs/1909.08053) as cited in chapter 19.

**Files:** `19.html`, `assets/diagrams/19-tensor-parallel-partitions.svg`, `tests/svg-semantics.test.cjs`.

## Chapter 20 — Parallelism topology comparison

**Reader question:** What does each parallelism axis actually move, and in which direction?

**Before:** The four-panel comparison had no directed edges at all: the PP panel showed four layer-stage boxes with no activation transfer direction, and the EP panel showed dispatch/combine as captions only, so the defining data movement of PP and EP was invisible.

**After:** Three green `pp-flow` arrows now carry activation left→right across `L1–12 → L13–24 → L25–36 → L37–48`; eight orange arrows (`ep-dispatch-*` downward, `ep-combine-*` upward) show tokens dispatched to experts and results combined back. Panel ids, an orange marker and the keyboard-focusable `diagram-pan` wrapper were added.

**Scope:** Conceptual comparison; `GPU ≈ DP × TP × PP` is a planning estimate, `EP_SIZE = TP_SIZE × DP_SIZE` is version-scoped, and attention vs experts may use different layouts.

**Primary evidence:** In-page references: [GPipe](https://arxiv.org/abs/1811.06965), [Megatron-LM](https://arxiv.org/abs/1909.08053), [GShard](https://arxiv.org/abs/2006.16668), [Parallelism and Scaling](https://docs.vllm.ai/en/latest/serving/parallelism_scaling/), [Data Parallel Deployment](https://docs.vllm.ai/en/latest/serving/data_parallel_deployment/) and [Expert Parallel Deployment](https://docs.vllm.ai/en/latest/serving/expert_parallel_deployment/) as cited in chapter 20.

**Files:** `20.html`, `assets/diagrams/20-parallelism-topology.svg`, `tests/svg-semantics.test.cjs`.

## Chapter 21 — Speculative acceptance trace

**Reader question:** Which draft tokens may be committed, and what does the target model add afterwards?

**Before:** The trace showed the accept/reject/residual steps but did not state that the target additionally emits one token after the accepted prefix, so `E[L] = 1 + E[A]` in the prose had no counterpart in the figure. No ids or pan wrapper.

**After:** The `Accept contiguous prefix` panel gained the line `接受前缀后目标再产生 1 个 bonus token：E[L] = 1 + E[A]`. Box and edge ids were added for `draft`, `target`, `accept-prefix`, the four positions, `residual-box` and `reject-to-correct`, and the figure gained the keyboard-focusable `diagram-pan` wrapper.

**Scope:** A single draft round; the figure does not claim all draft/verify variants preserve the target distribution (the FLy caveat stays in the prose), and it is not a speedup promise.

**Primary evidence:** In-page references: [Speculative Decoding](https://docs.vllm.ai/en/latest/features/speculative_decoding/), [Acceptance Metrics](https://docs.vllm.ai/en/latest/features/speculative_decoding/acceptance_metrics/), pinned `vllm/config/speculative.py`, and [Speculative Sampling](https://arxiv.org/abs/2302.01318) as cited in chapter 21.

**Files:** `21.html`, `assets/diagrams/21-speculative-acceptance.svg`, `tests/svg-semantics.test.cjs`.

## Chapter 22 — Multimodal input path

**Reader question:** Does each modality enter through the same guarded entry, and where is it fused?

**Before:** Only the text path was drawn leaving the `Gateway`; the `Image / Video` and `Audio` boxes had no incoming edge, even though 22.5 requires media URL allowlisting and size/auth checks at the Gateway / preprocessor. No ids or pan wrapper.

**After:** `Gateway → Image / Video` and `Gateway → Audio` edges were added (in addition to `Gateway → Text tokens`), so all three modalities pass the media policy before their separate encode paths; the three encode paths still meet at the model-specific `projection / fusion` box and then the `LLM / Decoder`. Box and edge ids were added and the figure gained the keyboard-focusable `diagram-pan` wrapper.

**Scope:** Conceptual pipeline; fusion location is architecture-specific (LLaVA-style projector vs Flamingo-style cross-attention), and image count does not determine visual-token count.

**Primary evidence:** In-page references: [Multimodal Inputs](https://docs.vllm.ai/en/latest/features/multimodal_inputs/), pinned `vllm/config/multimodal.py`, [LLaVA](https://arxiv.org/abs/2304.08485) and [Flamingo](https://arxiv.org/abs/2204.14198) as cited in chapter 22.

**Files:** `22.html`, `assets/diagrams/22-multimodal-input-path.svg`, `tests/svg-semantics.test.cjs`.

## Chapter 23 — nano-vLLM control flow

**Reader question:** What is the actual call chain from a prompt to the next token in the pinned nano-vLLM source?

**Before:** The chain was drawn `LLMEngine → Scheduler → BlockManager → ModelRunner`, so `BlockManager` looked like a sequential stage that invoked the runner, and the actual `Scheduler.schedule() → ModelRunner.run()` call edge from §23.2 was absent. No ids or pan wrapper.

**After:** The figure now adds the solid call edge `Scheduler → ModelRunner` labelled `schedule() 返回本轮 batch`, keeping `Scheduler → BlockManager` and a dashed-labelled `block_table` data edge `BlockManager → ModelRunner` (a data dependency, not a call). Box and edge ids were added for the nano classes (`LLMEngine`, `Scheduler`, `BlockManager`, `ModelRunner`, `Attention / Triton`, `Scheduler.postprocess`, `Result / Sequence`) and the figure gained the keyboard-focusable `diagram-pan` wrapper.

**Scope:** Pinned nano-vLLM commit `bb823b3e06983d71485a8e1f23715ebd87d98ef8`; nano names are not production V1 module names. The Triton `store_kvcache_kernel` path is described in the prose, not reproduced here.

**Primary evidence:** In-page references to the pinned nano-vLLM source files `llm_engine.py`, `scheduler.py`, `block_manager.py`, `model_runner.py` and `layers/attention.py` as listed in chapter 23.

**Files:** `23.html`, `assets/diagrams/23-nano-vllm-control-flow.svg`, `tests/svg-semantics.test.cjs`.

## Chapter 24 — Troubleshooting triage

**Reader question:** Are the four symptom branches and the evidence/hypothesis loop one process or two unrelated pictures?

**Before:** The four symptom branches ended as dead ends, visually disconnected from the `提出假设 → 收集新证据 → 修复与回归验收` row, and the figure had no ids or pan wrapper; the HTML caption repeated its own alt sentence.

**After:** A directed connector `branches-to-loop` now runs from the branch bottoms into `提出一个可证伪假设`, making explicit that every branch enters the same evidence loop. Box and edge ids were added for the symptom, four layers and the loop steps, the duplicated caption text was removed, and the figure gained the keyboard-focusable `diagram-pan` wrapper.

**Scope:** Hypothesis-driven triage, not a specific OOM/NCCL fix; the chapter keeps startup vs runtime OOM, NCCL and CUDAGraph/Torch Compile as separate hypotheses, and warns that trace/debug modes are costly.

**Primary evidence:** In-page references: [vLLM Troubleshooting](https://docs.vllm.ai/en/latest/usage/troubleshooting/), [Conserving Memory](https://docs.vllm.ai/en/latest/configuration/conserving_memory/) and [Production Metrics](https://docs.vllm.ai/en/latest/usage/metrics/) as cited in chapter 24.

**Files:** `24.html`, `assets/diagrams/24-debugging-triage.svg`, `tests/svg-semantics.test.cjs`.

## Chapter 25 — Benchmark design

**Reader question:** Which are the independent controlled variables, and how do they map to the dependent metrics?

**Before:** A single central arrow left the measurement plane and ended in the empty gap between the `ITL / TPOT` and `Output tok/s` boxes, so the plane did not actually connect to its four metrics; the figure had no ids or pan wrapper and the HTML caption repeated its own alt sentence.

**After:** The single arrow is replaced by a small fan-out: `plane-to-bus` → a `metric-bus` → four directed arrows into `TTFT`, `ITL / TPOT`, `Output tok/s` and `失败率`. Box and edge ids were added for the four controlled variables, the measurement plane and the four metrics, the duplicated caption text was removed, and the figure gained the keyboard-focusable `diagram-pan` wrapper.

**Scope:** 变量 → 测量 → 指标 conceptual map, not a claim about a specific benchmark number.

**Primary evidence:** In-page references: [vLLM Benchmark CLI](https://docs.vllm.ai/en/latest/benchmarking/cli/) and [vLLM Production Metrics](https://docs.vllm.ai/en/latest/usage/metrics/) as cited in chapter 25.

**Files:** `25.html`, `assets/diagrams/25-benchmark-design.svg`, `tests/svg-semantics.test.cjs`.

## Chapter 26 — Evidence maturity ladder

**Reader question:** Is the evidence ladder a progression, and does it promise that a feature will mature in order?

**Before:** The five evidence steps (`论文 / RFC` → `固定源码` → `官方 Release` → `复现实验` → `生产观测`) were placed on a diagonal but had **no connecting edges**, so the increasing evidence strength was invisible and the figure read as five unrelated boxes.

**After:** Four directed `step-N-to-N+1` arrows now connect the steps, and an in-figure note states `箭头表示证据强度递增，不代表功能必须按顺序成熟，也不是路线图承诺` — matching the SVG `desc` and the chapter rule that maturity labels are mandatory. Box and edge ids were added and the figure gained the keyboard-focusable `diagram-pan` wrapper.

**Scope:** Evidence-strength ladder, not a feature roadmap: it does not claim any research direction is a released default or a guaranteed future release, and no benchmark numbers are shown.

**Primary evidence:** In-page references: [vLLM Releases](https://github.com/vllm-project/vllm/releases) and the pinned source tree as cited in chapter 26.

**Files:** `26.html`, `assets/diagrams/26-evidence-roadmap.svg`, `tests/svg-semantics.test.cjs`.

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
| 11 | Chunked prefill timeline | Revised; CI/visual QA pending |
| 12 | V1 process topology + step loop (2 SVGs) | Revised; CI/visual QA pending |
| 13 | Request lifecycle | Revised; CI/visual QA pending |
| 14 | Sampling pipeline | Revised; CI/visual QA pending |
| 15 | Production serving topology | Revised; CI/visual QA pending |
| 16 | Kubernetes GPU scheduling | Revised; CI/visual QA pending |
| 17 | Latency waterfall | Revised; CI/visual QA pending |
| 18 | Security/trust boundaries | Revised; CI/visual QA pending |
| 19 | Tensor parallel partitions | Revised; CI/visual QA pending |
| 20 | Parallelism topology | Revised; CI/visual QA pending |
| 21 | Speculative acceptance | Revised; CI/visual QA pending |
| 22 | Multimodal input flow | Revised; CI/visual QA pending |
| 23 | nano-vLLM control flow | Revised; CI/visual QA pending |
| 24 | Debugging/triage | Revised; CI/visual QA pending |
| 25 | Benchmark design | Revised; CI/visual QA pending |
| 26 | Evidence maturity roadmap | Revised; CI/visual QA pending |
| 27 | RAG trust boundaries | Pending one-by-one review |
| 28 | Course knowledge map | Pending one-by-one review |

## Verification status

- Repository version at review start: \`master\` = \`611d84c130ed18b2fda2f96fbe06e1d82cb5767c\`.
- SVG topology reviewed against chapter prose and official sources for 01–03.
- \`tests/svg-semantics.test.cjs\` adds deterministic regression assertions for the first three diagrams.
- Static, browser, screenshot, interaction and Pages checks: **not verified in this note**. Link actual CI run/PR results before claiming pass.
- Next detailed pass: **10 → 11 → 12**, then continue the ledger in numerical order. Preserve this audit instead of asserting all 28 figures are already correct.
