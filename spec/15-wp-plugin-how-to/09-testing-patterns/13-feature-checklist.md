# 9.15 Test Checklist for New Features

> **Parent:** [Phase 9 overview](./00-overview.md)

---

When adding a new feature endpoint, also add:

- [ ] Enum test: new cases have valid backing values
- [ ] Validation test: each required field rejected when missing
- [ ] Validation test: each field rejected when wrong type
- [ ] Validation test: boundary values (max length, min/max range)
- [ ] Success test: valid input returns correct envelope
- [ ] Auth test: unauthenticated request rejected
- [ ] Auth test: insufficient capability rejected
- [ ] Edge case test: empty body, null values, oversized input
- [ ] Integration test: full round-trip via `rest_do_request()`
- [ ] Seeding test: new seed files have `insert_if_empty` / `upsert_by_key` coverage
