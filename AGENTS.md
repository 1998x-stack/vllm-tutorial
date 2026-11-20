# Repository instructions

This repository is a version-aware, visual learning course about the vLLM inference engine. The authoritative content workflow is [skills/vllm-tutorial/SKILL.md](skills/vllm-tutorial/SKILL.md).

## Non-negotiable principles

1. **Correctness before presentation.** Verify technical claims against current official vLLM documentation and source code, then use the original paper for historical design claims. Record the exact version or retrieval date whenever behavior is version-sensitive.
2. **Explain the problem before naming the solution.** Every chapter opens with a plain-language explanation of the question being answered, why it matters, and what the reader should understand by the end.
3. **No fabricated evidence.** Do not invent benchmark numbers, performance multipliers, default values, compatibility statements, customer stories, or personal anecdotes. Every numeric result must identify its model, hardware, workload, metric, comparison baseline, and source.
4. **One article, one learning question.** Figures must explain the article's actual mechanism, not decorate the page. Use original SVG with a meaningful title, description, labels, and caption.
5. **Offline-first.** No CDN, remote fonts, analytics, or required network requests for article rendering. External links are references, not runtime dependencies.
6. **Preserve the course contract.** The 28 chapter numbers and the local `file://` reading path remain stable. Update `courses.json`, regenerate `courses-data.js` with `python3 scripts/build_course_data.py`, and keep navigation links synchronized.
7. **Keep work auditable.** Add or update `evidence/NN.json` for substantive claims in rewritten chapters. Separate official behavior, paper results, derived calculations, toy examples, and recommendations.
8. **Never claim QA that was not run.** Report static checks, browser checks, and deployment checks separately.

## Editing workflow

- Read this file, the course metadata, the target chapter, adjacent chapters, relevant `docs/` notes, and the matching skill references before editing.
- Work chapter by chapter. Avoid broad find-and-replace that could silently change technical meaning.
- Prefer shared CSS and small progressive-enhancement JavaScript over repeated inline styles.
- Keep semantic structure: one `h1`, a `main`, one `article`, meaningful `section` headings, accessible figures, and keyboard-operable controls.
- For a diagram change, update the corresponding standalone SVG and check that the HTML caption and SVG labels tell the same story.
- For vLLM flags, defaults, APIs, scheduler behavior, or backend support, cite the exact official docs page and state that these can change between releases.
- For every code sample, state whether it is executable, illustrative pseudocode, or a version-specific configuration example.

## Validation

Run the checks available in the repository:

```bash
python3 scripts/build_course_data.py --check
node --test tests/offline-catalog.test.cjs
python3 scripts/validate_articles.py
```

When browser tooling is available, inspect desktop and narrow mobile widths, keyboard navigation, figures, code overflow, links, and at least one meaningful interaction. Do not mark a skipped browser check as passed.
