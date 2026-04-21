# Performance Debugging

> **Parent:** [00-overview.md](./00-overview.md)

## React Profiler

```typescript
import { Profiler, ProfilerOnRenderCallback } from 'react';

const onRender: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime
) => {
  console.log(`[Profiler] ${id}:`, {
    phase,          // 'mount' | 'update'
    actualDuration, // Time spent rendering
    baseDuration,   // Estimated time without memoization
    startTime,
    commitTime,
  });
};

function App() {
  return (
    <Profiler id="App" onRender={onRender}>
      <MainContent />
    </Profiler>
  );
}
```

## why-did-you-render

```typescript
// wdyr.ts (import before React)
import React from 'react';

if (import.meta.env.DEV) {
  const whyDidYouRender = await import('@welldone-software/why-did-you-render');
  whyDidYouRender.default(React, {
    trackAllPureComponents: true,
    logOnDifferentValues: true,
  });
}
```

## Related

- [04-react-query.md](./04-react-query.md) — Avoiding unnecessary refetches
- [07-browser-devtools.md](./07-browser-devtools.md) — `console.time` for ad-hoc measurement
