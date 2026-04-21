# 14.15 Summary Table

> **Parent:** [Phase 14 overview](./00-overview.md)

---

| Aspect | Convention | Reference |
|--------|-----------|-----------|
| Namespace | `{slug}/v{major}` via `PluginConfigType::apiFullNamespace()` | §14.1 |
| Route paths | Resource-based, kebab-case, defined in `EndpointType` | §14.2, §14.4 |
| HTTP methods | Via `HttpMethodType` enum; GET=read, POST=action/create, DELETE=remove | §14.3 |
| Route registration | Grouped, fault-tolerant `$safeRegister` closure | §14.5 |
| Pagination | `limit`/`offset` or `page` params; `PaginationConfigType` defaults | §14.6 |
| Filters | `FilterKeyType` enum; camelCase query params | §14.7 |
| Request body fields | `RequestFieldType` enum; snake_case | §14.8 |
| Response keys | `ResponseKeyType` enum; PascalCase | §14.9 |
| Controller org | One handler trait per endpoint; group by domain subfolder | §14.10 |
| Endpoint registry | `data/endpoints.json` file; synchronised with `EndpointType` | §14.11 |
| Standard endpoints | Status (required), List+paginate, Action+validate, Two-phase confirm | §14.12 |
| Dynamic segments | WordPress regex capture groups in `EndpointType` values | §14.13 |

---
