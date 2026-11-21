# Content modernization roadmap

The 28 chapter numbers and root HTML URLs remain stable while the reading experience is upgraded in reviewable, source-verified batches.

## Completed in the current branch

- Course metadata: 8 categories, learning objectives, prerequisites, tags, difficulty and estimated reading time.
- Shared article design system, accessible stepper enhancement and offline-first interactive labs.
- Adapted tutorial-authoring Skill and repository instructions.
- **Chapters 01–13:** technical rewrite, original topic-specific SVGs, source sections, evidence ledgers and semantic HTML.
- Chapter 08: offline KV Cache capacity calculator.
- Chapter 11: offline Chunked Prefill budget explorer.
- Static article / local-link validation, course manifest generation and offline catalog tests.
- GitHub Actions validation workflow.

## Remaining chapter batches

| Batch | Chapters | Main review focus |
|---|---|---|
| 5 | 14–18 | Sampling, production deployment, Kubernetes, observability, security |
| 6 | 19–23 | TP / PP / DP / EP, speculative decoding, multimodal, nano-vLLM |
| 7 | 24–28 | Troubleshooting, benchmarking, roadmap, RAG project, synthesis |

## Completion gate

A chapter is marked upgraded only after:
1. Version-sensitive behavior is checked against official docs and pinned source.
2. The explanation starts from a concrete problem and includes a topic-specific original SVG.
3. HTML is semantic, accessible, responsive and offline-first.
4. Substantive claims have an evidence record in `evidence/NN.json`.
5. Course metadata and previous / next navigation are synchronized.
6. Manifest, article structure, local asset and offline catalog checks pass.

Browser QA, GPU benchmarks and Pages deployment are recorded separately and must not be inferred from static CI success.
