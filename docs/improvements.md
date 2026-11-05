# Improvement History

### 2026-11-05 06:20 UTC — ChatGPT Portfolio Iteration
- Run ID: 20261105T062039Z-vllm-offline-4b2c
- Repo / Base SHA: 1998x-stack/vllm-tutorial @ 2c2763c040f56e77d214ea424f5720b7b89f1125
- Historical context: First iteration; default-branch docs/improvements.md returned 404; no PRs existed. Six commits inspected, including the 2026-06-30 JSON-fetch introduction and subsequent grid layout fix. No previous agent fix duplicated in this repository.
- Product problem & expected user value: README promises direct file opening without a server, but index.html fetches sibling courses.json; file:// JSON fetch commonly fails. Offline readers cannot reach the 28 chapter cards.
- Engineering diagnosis & evidence: index.html inline renderer fetches courses.json; errors render via innerHTML and chapter href accepts raw manifest file. 28 chapter files and metadata exist.
- Options & decision: (1) Offline manifest (5+4+5+5-2-1=16), (2) search/filter chapters (4+1+4+4-3-1=9), (3) mobile navigation improvements (3+1+3+3-3-2=5). Selected first-use blocker; avoid unrelated UI redesign.
- Changes: index.html loads generated courses-data.js and renders from window.VLLM_COURSES; local NN.html links validated, errors and footer use safe text nodes. Python standard-library generator/check, Node built-in tests and README usage instructions added. All 28 chapter HTML files and courses.json unchanged.
- Validation: A — actual updated inline JavaScript executed in V8 with DOM simulation; verified 28 cards, first/last navigation, no fetch, malformed javascript URL rejected and missing data error. C — metadata and generated projection compared with canonical JSON, and all 28 chapter files checked against GitHub tree. D — committed Node test suite and Python --check not executed in full checkout; physical Chromium file:// E2E not executed. No CI pass claimed.
- Security & regression review: Restricts local navigation URLs, avoids dynamic innerHTML for errors and footer; no credentials, dependencies, workflow, production data or license touched. Dataset remains canonical in courses.json.
- Risk & rollback: Generated courses-data.js may become stale after editing courses.json; generator --check and tests detect this. Revert PR if file-origin browser regression is observed.
- Follow-up: Run Python --check and Node tests in a full checkout; manually verify file:// and HTTP rendering in Chromium. Then consider chapter search/filtering.
- Commit: pending
- PR: pending
