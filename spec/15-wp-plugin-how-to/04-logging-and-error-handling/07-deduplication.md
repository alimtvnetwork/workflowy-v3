# 4.7 Deduplication

> **Parent:** [Phase 4 overview](./00-overview.md)

---

The logger has two dedup layers to prevent repetitive log entries:

## In-memory dedup (per-request)

- Hashes `level + message + file + line`
- If the same hash appears again in the same PHP request, the entry is silently skipped
- Prevents loops from flooding logs

## Persistent dedup (cross-request)

- Stores hashes in a JSON file (`dedup-registry.json`) in the logs directory
- Used only for `debug()` and `info()` level entries
- Maximum 500 entries; oldest entries are pruned when limit is reached
- Prevents boot/init messages from repeating on every request
