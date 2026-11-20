# Chapter evidence records

Each rewritten chapter has one JSON ledger named `NN.json`. The schema and allowed claim classifications are defined in [the technical source policy](../skills/vllm-tutorial/references/technical-source-policy.md).

- `official_behavior`: behavior verified in official vLLM docs or source.
- `paper_result`: a result reported by a primary paper, with its evaluation scope.
- `derived`: arithmetic or a conclusion derived from explicitly stated assumptions.
- `toy_example`: invented values used only to explain a mechanism.
- `recommendation`: an operational suggestion, with context and limits.

A ledger is not a replacement for citations in the article. It is an audit trail for the editorial process.
