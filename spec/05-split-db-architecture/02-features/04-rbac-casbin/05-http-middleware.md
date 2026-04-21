# 5. HTTP Middleware

> **Parent:** [00-overview.md](./00-overview.md)

---

## Middleware Implementation

```go
package middleware

import (
    "net/http"
    "strings"

    "yourapp/rbac"
)

// RbacMiddleware creates HTTP middleware for authorization
func RbacMiddleware(manager *rbac.RbacManager) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            // Extract user from context (set by auth middleware)
            user := r.Context().Value("userId").(string)
            if user == "" {
                http.Error(w, "Unauthorized", http.StatusUnauthorized)
                return
            }
            
            // Get resource and action
            resource := r.URL.Path
            action := methodToAction(r.Method)
            
            // Check permission
            allowed, err := manager.Enforce(user, resource, action)
            if err != nil {
                http.Error(w, "Authorization error", http.StatusInternalServerError)
                return
            }
            
            if !allowed {
                http.Error(w, "Forbidden", http.StatusForbidden)
                return
            }
            
            next.ServeHTTP(w, r)
        })
    }
}

func methodToAction(method string) string {
    switch strings.ToUpper(method) {
    case "GET", "HEAD", "OPTIONS":
        return "read"
    case "POST", "PUT", "PATCH":
        return "write"
    case "DELETE":
        return "delete"
    default:
        return "read"
    }
}
```

---

## Middleware Integration

```go
func setupServer(manager *rbac.RbacManager) *http.Server {
    mux := http.NewServeMux()
    
    // Protected routes
    protected := http.NewServeMux()
    protected.HandleFunc("/api/documents", handleDocuments)
    protected.HandleFunc("/api/users", handleUsers)
    
    // Chain middleware
    handler := RbacMiddleware(manager)(protected)
    
    return &http.Server{
        Handler: handler,
        Addr:    ":8080",
    }
}
```

---

## HTTP Method Mapping

| HTTP Method | Casbin Action |
|-------------|---------------|
| `GET` | `read` |
| `HEAD` | `read` |
| `OPTIONS` | `read` |
| `POST` | `write` |
| `PUT` | `write` |
| `PATCH` | `write` |
| `DELETE` | `delete` |
