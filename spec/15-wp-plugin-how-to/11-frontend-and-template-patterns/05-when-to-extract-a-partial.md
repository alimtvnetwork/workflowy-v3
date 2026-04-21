# 11.5 When to Extract a Partial

> **Parent:** [00-overview.md](./00-overview.md)

| Signal | Action |
|--------|--------|
| Template exceeds 100 lines | **Must** extract sections into partials |
| Same HTML block appears in 2+ templates | **Must** extract to `partials/shared/` |
| A `<div class="card">` or `<section>` block is self-contained | **Should** extract — it's a natural component boundary |
| A form has 5+ fields | **Should** extract the form to its own partial |
| A table with custom rendering logic | **Should** extract to `partials/{page}/table-{name}.php` |
| A modal or dialog | **Must** extract — modals are always reusable |
