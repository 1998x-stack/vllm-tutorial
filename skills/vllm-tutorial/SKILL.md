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
- KV Cache sizing: account for K and V, layers, KV heads, head dimension, token count, dtype bytes, batch/concurrency, and tensor-parallel sharding assumptions.
- Paged KV: distinguish logical block tables, physical blocks, write-slot mapping, and attention backend responsibilities.
- Prefix caching: explain exact token/block matching, hash inputs, block completeness, reference counts, eviction, and version-specific behavior. Do not describe it as an unqualified pointer-copy trick.
- Continuous batching and scheduling: distinguish iteration-level batching, token budgets, preemption, and chunked prefill.
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
