# Technical source policy

## Preferred sources

| Claim type | Preferred source |
|---|---|
| CLI flags, defaults, APIs, model support | Versioned official vLLM docs |
| Internal scheduler / cache behavior | Official design docs, source code, tests |
| Historical algorithm and original evaluation | Original paper |
| Release availability / deprecation | Official release notes and changelog |
| Operational behavior not documented | Maintainer issue / discussion, with uncertainty stated |

## Evidence record

Each chapter uses `evidence/NN.json` with this shape:

```json
{
  "chapter": "01",
  "reviewed_at": "YYYY-MM-DD",
  "scope": "vLLM release / concept scope",
  "claims": [
    {
      "id": "claim-id",
      "claim": "A short factual statement.",
      "kind": "official_behavior | paper_result | derived | toy_example | recommendation",
      "status": "verified | derived | illustrative | unverified",
      "source_url": "https://...",
      "locator": "Section, table, symbol, or commit",
      "notes": "Assumptions and boundaries."
    }
  ]
}
```

Do not use `verified` for a claim that has only been copied from an unsourced blog. Derived calculations should show the formula and assumptions in the article. Toy values must be labeled illustrative.

## Benchmark minimum

Every benchmark claim needs model, hardware, workload distribution, concurrency, metric, baseline, and source. Report latency percentiles and throughput together where possible. A single throughput number without the workload is not actionable.
