# Error Boundary Pattern

> **Parent:** [00-overview.md](./00-overview.md)

```typescript
// ErrorBoundary.tsx
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    // Report to error tracking service
    // reportError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="p-4 border border-destructive rounded">
          <h2 className="text-lg font-semibold text-destructive">Something went wrong</h2>
          <pre className="mt-2 text-sm text-muted-foreground">
            {this.state.error?.message}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

export { ErrorBoundary };
```

## Related

- [03-common-issues.md](./03-common-issues.md) — Errors caught here often originate from API/state issues
- [06-console-logging.md](./06-console-logging.md) — Structured error logging
