# Pipeline Stages

> **Parent:** [09-ci-pipeline-quality-gate overview](./00-overview.md)

---

## 2. Pipeline Stages

Every CI pipeline MUST execute these stages **in order**. A failure in any stage stops the pipeline.

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Format  │───▶│   Lint   │───▶│  Type    │───▶│  Test    │───▶│  Sonar   │
│  Check   │    │  Check   │    │  Check   │    │  + Cover │    │  Scan    │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
```

| Stage | Purpose | Failure = |
|-------|---------|----------|
| **1. Format Check** | Verify code formatting matches standard | PR blocked |
| **2. Lint Check** | Run primary linter with zero warnings | PR blocked |
| **3. Type Check** | Run type checker in strict mode | PR blocked |
| **4. Test + Coverage** | Run tests, generate coverage report | PR blocked |
| **5. SonarQube Scan** | Quality gate analysis on new code | PR blocked |

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`01-quality-gate-thresholds.md`](./01-quality-gate-thresholds.md) — Thresholds
- [`03-language-commands.md`](./03-language-commands.md) — Language commands

---

*Pipeline stages v3.2.0 — 2026-04-20*
