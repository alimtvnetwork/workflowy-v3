# React Execution Logger — Performance, Best Practices & Roadmap

> **Split from** [`01-react-execution-logger.md`](./01-react-execution-logger.md) on 2026-04-25 to keep both files under the 400-line guideline (closes F-08).
> **Parent:** [`00-overview.md`](./00-overview.md)

---

## 9. Performance

### 9.1 When Disabled

All log methods are immediate no-ops:

```typescript
logFunction: (name, args) => {
  if (!get().enabled) return '';
  // ... actual logging
}
```

### 9.2 When Enabled

- Rolling buffer limits memory (default 100 entries)
- No deep cloning of arguments
- Lazy formatting (only on getFormattedChain)
- ID generation uses fast nanoid

### 9.3 Benchmarks

| Operation | Time (enabled) | Time (disabled) |
|-----------|----------------|-----------------|
| logFunction | 0.02ms | 0.001ms |
| logComponent | 0.01ms | 0.001ms |
| getFormattedChain | 0.5ms | 0.001ms |

---

## 10. Best Practices

### 10.1 DO

```typescript
// Log at function boundaries
function processData(items) {
  const id = logFunction('processData', [items.length]);
  // ...
  endFunction(id, result);
}

// Log handlers with context
<Button onClick={() => {
  logHandler('onClick', 'SaveDraftButton');
  saveDraft();
}}>

// Log effects with meaningful deps
useEffect(() => {
  logEffect('syncWithServer', [lastModified]);
}, [lastModified]);
```

### 10.2 DON'T

```typescript
// Don't log in tight loops
items.forEach(item => {
  logFunction('processItem'); // Too many entries!
});

// Don't log sensitive data
logFunction('login', [username, password]); // Exposes password!

// Don't log in render body (use logComponent instead)
function MyComp() {
  logFunction('MyComp'); // Wrong!
  logComponent('MyComp'); // Correct!
}
```

---

## 11. Files

| File | Purpose |
|------|---------|
| `src/hooks/useExecutionLogger.ts` | Logger implementation |
| `src/stores/errorStore.ts` | Integration with error capture |
| `src/components/errors/GlobalErrorModal.tsx` | UI display |

---

## 12. Future Enhancements

1. **Async Tracking** - Track Promise chains and async/await
2. **Redux Integration** - Log action dispatches
3. **React Query Integration** - Track query lifecycle
4. **Source Maps** - Map to original source locations
5. **Flamegraph Visualization** - Visual call stack

---

*Specification created: 2026-02-06*
