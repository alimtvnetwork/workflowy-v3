# 4.15 Complete Error Handling Flow — End to End

> **Parent:** [Phase 4 overview](./00-overview.md)

---

This shows exactly what happens when an exception occurs during an API request:

```
1. Client sends: POST /my-plugin-api/v1/activate { "plugin_slug": "some-plugin" }

2. WordPress routes to: ActivateHandlerTrait::handleActivate($request)

3. handleActivate() calls: $this->safeExecute(fn() => $this->executeActivation($request), 'activate')

4. executeActivation() throws: RuntimeException("Connection refused")

5. safeExecute() catches Throwable:
   a. Tier 1: error_log("[MyPlugin] safeExecute error in 'activate': Connection refused\n#0 ...")
   b. Tier 2: $this->fileLogger->logException($e, "safeExecute:activate")
      → Writes to info.log:    [07-Apr-26 2:31 PM v2.31.0] [Error] safeExecute:activate: Connection refused (ResponseTrait.php:35) {}
      → Writes to error.log:   [07-Apr-26 2:31 PM v2.31.0] [Error] safeExecute:activate: Connection refused (ResponseTrait.php:35) {}
      → Writes to stacktrace.log:
         ================================================================================
         [07-Apr-26 2:31 PM v2.31.0] safeExecute:activate: Connection refused (ResponseTrait.php:35)
         Exception: RuntimeException
         Message: Connection refused
         --------------------------------------------------------------------------------
         #0 ActivateHandlerTrait.php(78): ...->executeActivation()
         #1 ResponseTrait.php(35): ...->safeExecute()
         ================================================================================
   c. Calls buildErrorResponse($e, 'activate')
      → Checks PluginConfigType::isDebugMode()
      → If debug: includes Errors.Backend with trace frames + real message
      → If production: generic "An internal error occurred", no Errors key

6. Client receives: JSON envelope with Code 500
```
