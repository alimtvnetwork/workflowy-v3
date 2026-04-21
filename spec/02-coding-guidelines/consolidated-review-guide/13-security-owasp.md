# 13. Security (OWASP)

> **Parent:** [00-overview.md](./00-overview.md)

Quick checklist based on OWASP Top 10:

- [ ] **Injection:** All inputs parameterized / sanitized
- [ ] **Broken Auth:** Tokens validated server-side, no secrets in client code
- [ ] **Sensitive Data:** No PII in logs, encryption at rest and in transit
- [ ] **XXE:** XML parsing disabled or restricted
- [ ] **Broken Access Control:** RLS / authorization checked on every endpoint
- [ ] **Misconfiguration:** No default credentials, debug mode off in production
- [ ] **XSS:** All user content sanitized before rendering
- [ ] **Deserialization:** No untrusted deserialization without validation
- [ ] **Vulnerable Dependencies:** Pinned versions, regular audit
- [ ] **Logging:** Security events logged, no sensitive data in logs
