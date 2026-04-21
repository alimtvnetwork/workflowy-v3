# Browser DevTools Tips

> **Parent:** [00-overview.md](./00-overview.md)

## Network Tab Filtering

```
// Filter by URL pattern
/api/v1/

// Filter by status
status-code:500

// Filter by method
method:POST
```

## Console Commands

```javascript
// Clear console
clear()

// Monitor function calls
monitor(functionName)

// Time operations
console.time('operation');
// ... do work
console.timeEnd('operation');

// Group related logs
console.group('API Call');
console.log('URL:', url);
console.log('Response:', data);
console.groupEnd();

// Table display
console.table([{ id: 1, name: 'Test' }]);
```

## Related

- [06-console-logging.md](./06-console-logging.md) — Logger output that pairs with these filters
