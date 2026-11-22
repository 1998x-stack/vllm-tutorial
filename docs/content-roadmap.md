# Content modernization roadmap

The 28 chapter numbers and root HTML URLs remain stable while the reading experience is upgraded in reviewable, source-verified batches.

## Completed in the current branch

- Course metadata: 8 categories, learning objectives, prerequisites, tags, difficulty and estimated reading time.
- Shared article design system, accessible stepper enhancement and offline-first interactive labs.
- Adapted tutorial-authoring Skill and repository instructions.
- **Chapters 01–28:** technical rewrite, original topic-specific SVGs, source sections, evidence ledgers and semantic HTML.
- Chapter 08: offline KV Cache capacity calculator.
- Chapter 11: offline Chunked Prefill budget explorer.
- Chapter 14: offline Sampling / Decoding distribution explorer.
- Chapters 15–18: production deployment, Kubernetes GPU scheduling, observability and security / multi-tenancy.
- Chapters 19–20: tensor, pipeline, data and expert parallelism, GPU topology and MoE dispatch.
- Chapter 21: speculative rejection sampling and an offline expected-accepted-length experiment.
- Chapter 22: multimodal preprocessing, latency, cost and media URL security.
- Chapter 23: pinned nano-vLLM source walkthrough, compared with production vLLM V1.
- Chapter 24: evidence-first troubleshooting for memory, NCCL, model loading and CUDA Graph failures.
- Chapter 25: reproducible benchmark protocol and a zero-dependency arithmetic lab.
- Chapter 26: research maturity rubric tied to papers, fixed source, releases and real workloads.
- Chapter 27: executable, standard-library RAG retrieval with scoped sample ACL and loopback-only optional vLLM call.
- Chapter 28: complete knowledge map, three reading tracks, and reproducible capstone.
- Static article / local-link validation, course manifest generation, offline catalog tests, and a separate unittest suite for the executable RAG example.
- GitHub Actions validation workflow.

## Remaining chapter batches

All 28 chapters are now covered by the modernization batch. Future work is quality maintenance, version drift review, and model/hardware-backed evaluation rather than unverified expansion.

## Completion gate

A chapter is marked upgraded only after:
1. Version-sensitive behavior is checked against official docs and pinned source.
2. The explanation starts from a concrete problem and includes a topic-specific original SVG.
3. HTML is semantic, accessible, responsive and offline-first.
4. Substantive claims have an evidence record in `evidence/NN.json`.
5. Course metadata and previous / next navigation are synchronized.
6. Manifest, article structure, local asset and offline catalog checks pass.

Browser QA, GPU benchmarks and Pages deployment are recorded separately and must not be inferred from static CI success.
