# 3. Parameters & Returns

> **Parent:** [00-overview.md](./00-overview.md)

- **Max 3 parameters** per function. More → use an options struct/object.
- **Single return value.** Use a Result/wrapper type, never multiple loose returns.

```go
// ❌ Too many params + multi-return
func CreateUser(name string, email string, age int, role string, org string) (User, error) { ... }

// ✅ Options struct + Result
func CreateUser(opts CreateUserInput) apperror.Result[User] { ... }
```

```typescript
// ❌ Multiple params
function sendEmail(to: string, subject: string, body: string, cc: string, bcc: string): void { ... }

// ✅ Options object
function sendEmail(opts: SendEmailInput): Result<void> { ... }
```
