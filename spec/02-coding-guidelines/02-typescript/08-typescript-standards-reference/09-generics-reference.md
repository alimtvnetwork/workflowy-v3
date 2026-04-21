# 9. Generics Reference — When to Use What

> **Parent:** [00-overview.md](./00-overview.md)

---

| Scenario | Pattern |
|----------|---------|
| API response parsing | `parseEnvelope<T>(env: RawEnvelope<T>): ApiResponse<T>` |
| Data fetching hooks | `useApiQuery<T>(key: string[]): QueryResult<T>` |
| Form state | `useForm<TFormValues extends FieldValues>()` |
| List rendering | `function DataTable<T extends { id: string }>(props: { data: T[] })` |
| Store slices | `createSlice<TState>(initialState: TState)` |
| Utility functions | `function groupBy<T, K extends keyof T>(items: T[], key: K): Map<T[K], T[]>` |
