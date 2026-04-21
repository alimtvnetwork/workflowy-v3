# URL Paths vs JSON Keys & Cross-References

> **Parent:** [`00-overview.md`](./00-overview.md)

---

## URL Paths vs JSON Keys

| Context | Convention | Example |
|---------|-----------|---------|
| URL paths (slugs) | **kebab-case lowercase** | `/api/v1/blog-posts/my-first-post` |
| Query parameters | **PascalCase** | `?StatusName=Pending&IsActive=1` |
| JSON request keys | **PascalCase** | `{"PluginSlug": "my-plugin"}` |
| JSON response keys | **PascalCase** | `{"TransactionId": 42}` |

> See [slug conventions](../../02-coding-guidelines/01-cross-language/28-slug-conventions.md) for URL path rules.

---

## Cross-References

| Reference | Location |
|-----------|----------|
| **Response Envelope Spec** | [04-response-envelope-reference.md](../../03-error-manage/02-error-architecture/05-response-envelope/04-response-envelope-reference.md) |
| Envelope examples | [envelope-minimal.json](../../03-error-manage/02-error-architecture/05-response-envelope/envelope-minimal.json), [envelope-single.json](../../03-error-manage/02-error-architecture/05-response-envelope/envelope-single.json), [envelope-multiple.json](../../03-error-manage/02-error-architecture/05-response-envelope/envelope-multiple.json) |
| Database naming | [../01-naming-conventions.md](../01-naming-conventions.md) |
| Schema design | [../02-schema-design.md](../02-schema-design.md) |
| Key naming PascalCase | [../../02-coding-guidelines/01-cross-language/11-key-naming-pascalcase.md](../../02-coding-guidelines/01-cross-language/11-key-naming-pascalcase.md) |
| Slug conventions | [../../02-coding-guidelines/01-cross-language/28-slug-conventions.md](../../02-coding-guidelines/01-cross-language/28-slug-conventions.md) |

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
