# 5.6–5.8 Notifications, Security & Complete Pattern

> **Parent:** [00-overview.md](./00-overview.md)

## 5.6 Notification Patterns

When the plugin needs to send notifications (email, admin notices), follow these patterns:

| Pattern | Implementation |
|---------|---------------|
| Email sending | Delegate to `wp_mail()` with structured HTML templates |
| Log email endpoint | A dedicated REST endpoint that emails log contents to a configured recipient |
| Admin notices | Only show on plugin's own admin pages, never globally |
| Error notifications | Log the error; optionally email if severity is critical |

---

## 5.7 Security Checklist

| Requirement | Implementation |
|-------------|---------------|
| Authentication | WordPress Application Passwords via Basic Auth |
| Capability checks | Every endpoint has a `permission_callback` |
| Input sanitisation | Use `sanitize_text_field()`, `absint()`, `wp_kses()` |
| Output escaping | Use `esc_html()`, `esc_attr()`, `esc_url()` in admin pages |
| Nonce verification | All admin AJAX actions verify nonces via enum-defined values |
| Rate limiting | Track request counts per IP in transients or custom table |
| ABSPATH guard | Every PHP file checks `defined('ABSPATH')` |

---

## 5.8 Summary — The Complete Pattern

```
Request → WordPress REST API
  → RouteRegistrationTrait (resolves endpoint)
  → AuthTrait (validates credentials + capabilities)
  → Handler Trait (public method)
    → safeExecute() (error boundary from ResponseTrait)
      → Private method (business logic)
        → FileLogger (structured logging)
        → EnvelopeBuilder (response construction)
        → Enums (all string/int constants)
        → Helpers (stateless utilities)
      ← WP_REST_Response (envelope format)
    ← Throwable caught → errorResponse() → WP_REST_Response
  ← JSON response to client
```

Every layer has a single responsibility. Every string is an enum value. Every error is caught, logged with a stack trace, and returned in a structured format. The pattern is identical for every endpoint.

## Related

- [00-overview.md](./00-overview.md) — Folder index
- [05-response-envelope.md](./05-response-envelope.md) — Envelope format used in every response
- [06-integration-checklist.md](./06-integration-checklist.md) — Adding new feature steps
