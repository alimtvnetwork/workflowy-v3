# 2. Cache & External JSON

> **Parent:** [00-overview.md](./00-overview.md)

---

## 5. Cache / `sync.Map`

### ❌ Prohibited — Bare Cast in Business Logic

```go
if cached, ok := s.cache.Load(key); ok {
    return cached.([]string), nil  // §7.2 violation
}
```

### ✅ Required — Annotated Typed Accessor

```go
func (s *Service) GetCachedStrings(key string) ([]string, bool) {
    // EXEMPTED: typed accessor internal — cache stores known []string values (§7.2)
    if cached, ok := s.cache.Load(key); ok {
        return cached.([]string), true
    }

    return nil, false
}
```

### ✅ Preferred — Generic Typed Cache Wrapper

```go
type TypedCache[T any] struct {
    inner sync.Map
}

func (c *TypedCache[T]) Load(key string) (T, bool) {
    // EXEMPTED: generic cache internal — single centralized cast point (§7.2)
    if v, ok := c.inner.Load(key); ok {
        return v.(T), true
    }

    var zero T

    return zero, false
}

func (c *TypedCache[T]) Store(key string, value T) {
    c.inner.Store(key, value)
}
```

---

## 6. External JSON / WebSocket

### ❌ Prohibited — Bare Casts Without Annotation

```go
var msg map[string]any
conn.ReadJSON(&msg)
text := msg["text"].(string)  // panic-prone + §7.2 violation
```

### ✅ Required — Comma-Ok with Exemption Annotation

```go
// EXEMPTED: external WebSocket API — protocol returns dynamic JSON (§7.2)
var msg map[string]any

if err := conn.ReadJSON(&msg); err != nil {
    return
}

msgType, _ := msg["type"].(string)
switch msgType {
case "transcript":
    text, _ := msg["text"].(string)
    // ...
}
```

### ✅ Preferred — Deserialize into Concrete Struct

```go
type TranscriptMessage struct {
    Type       string `json:"type"`
    Text       string `json:"text"`
    IsFinal    bool   `json:"is_final"`
}

var msg TranscriptMessage

if err := conn.ReadJSON(&msg); err != nil {
    return
}
// No casts needed — all fields are typed
```
