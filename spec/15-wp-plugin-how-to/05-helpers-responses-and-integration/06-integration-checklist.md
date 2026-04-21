# 5.4 Integration Checklist — Adding a New Feature

> **Parent:** [00-overview.md](./00-overview.md)

When adding a new feature endpoint to the plugin, follow this exact sequence.

## Step 1: Define enums

| What to add | Where |
|-------------|-------|
| Endpoint path | New case in `EndpointType` |
| New response keys | New cases in `ResponseKeyType` |
| New capabilities (if any) | New case in `CapabilityType` |

## Step 2: Create the handler trait

1. Create a new file: `Traits/{FeatureDomain}/{FeatureName}Trait.php`
2. Follow the trait anatomy from Phase 3, §3.3
3. The public handler method wraps logic in `$this->safeExecute()`
4. Use `EnvelopeBuilder` for all responses
5. Use `$this->fileLogger` for all logging
6. Use enum values for all string literals

## Step 3: Register the route

1. Add a new registration method in `RouteRegistrationTrait` (or add to an existing group)
2. Wire it using the `$safeRegister` closure pattern
3. Use `EndpointType::NewEndpoint->route()` for the path
4. Use `HttpMethodType` for the method
5. Point to the correct permission callback

## Step 4: Compose in Plugin.php

1. Add `use PluginName\Traits\{FeatureDomain}\{FeatureName}Trait;` import
2. Add `use {FeatureName}Trait;` inside the class body
3. If a new route group was created, add it to the `$groups` array in `registerRoutes()`

## Step 5: Bump version

Update `PluginConfigType::Version` case value.

## Related

- [05-response-envelope.md](./05-response-envelope.md) — Envelope format used in step 2
- [08-security-and-summary.md](./08-security-and-summary.md) — Full request lifecycle
