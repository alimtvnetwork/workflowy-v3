# 4.5 Stack Trace File Format

> **Parent:** [Phase 4 overview](./00-overview.md)

---

Stack traces are written to a dedicated file with visual separators:

```
================================================================================
[07-Apr-26 2:30 PM v2.31.0] Error message here (SomeFile.php:42)
Exception: RuntimeException
Message: Cannot connect to remote endpoint
--------------------------------------------------------------------------------
#0 ActivateHandlerTrait.php(78): PluginName\Traits\Activate\ActivateHandlerTrait->executeActivation()
#1 ResponseTrait.php(35): PluginName\Traits\Core\ResponseTrait->safeExecute()
#2 WP_REST_Server.php(1181): WP_REST_Server->dispatch()
#3 rest-api.php(407): rest_do_request()
================================================================================
```

Each trace entry is a self-contained block with `=` separators for easy visual scanning. The file is separate from `info.log` and `error.log` to avoid cluttering operational logs.
