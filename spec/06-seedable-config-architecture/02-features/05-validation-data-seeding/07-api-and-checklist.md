# 7. Runtime API + Per-Feature Checklist

> **Parent:** [Validation Data Seeding overview](./00-overview.md)

## API for Runtime Updates

```
PUT /api/v1/config/validation/:category/:key
  Body: { "Value": [...], "Reason": "Added new transition words" }
  Effect: Updates ValidationData, invalidates cache, logs change

GET /api/v1/config/validation/:category
  Returns: All validation data for category

GET /api/v1/config/validation/:category/:key
  Returns: Specific validation data entry
```

---

## Checklist for New Validation Data

- [ ] Define in `config.seed.json` under the matching top-level category key (`validation`, `defaults`, `limits`, `enums`, or `feature_flags` — pick by the data's primary purpose; create a new top-level key only via ADR)
- [ ] Bump config version (minor for new setting)
- [ ] Add changelog entry
- [ ] Create Go accessor using `ValidationDataService`
- [ ] Never hardcode the array in source code
- [ ] Add API endpoint for runtime updates if needed
- [ ] Add tests for default values
