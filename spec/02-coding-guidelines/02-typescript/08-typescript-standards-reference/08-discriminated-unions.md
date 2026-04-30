# 8. Discriminated Unions — Named Interfaces Required

> **Parent:** [00-overview.md](./00-overview.md)

---

(gate **G-NS-NO-DEPRECATED-ALIAS**) **All union-type action/event objects MUST use extracted named interfaces with enum discriminators.** Never use inline type literals or string-literal discriminators.

---

## Rule 8.1: Every variant MUST be a named interface (gate **G-NS-NO-DEPRECATED-ALIAS**)

```typescript
// ❌ FORBIDDEN — inline variants with string literals
type Action =
  | { type: "ADD_TOAST"; toast: ToasterToast }
  | { type: "DISMISS"; toastId?: string };

// ✅ REQUIRED — named interfaces with enum discriminator
enum ActionType {
  AddToast = "AddToast",
  DismissToast = "DismissToast",
}

interface AddToastAction {
  type: ActionType.AddToast;
  toast: ToasterToast;
}

interface DismissToastAction {
  type: ActionType.DismissToast;
  toastId?: string;
}

type ToastAction = AddToastAction | DismissToastAction;
```

---

## Rule 8.2: Use dot notation for enum access

```typescript
// ❌ FORBIDDEN
if (action.type === "ADD_TOAST") { ... }
if (action.type === ActionType["AddToast"]) { ... }

// ✅ REQUIRED
if (action.type === ActionType.AddToast) { ... }
```

---

## Rule 8.3: Enum values MUST be PascalCase (gate **G-NS-NO-DEPRECATED-ALIAS**)

```typescript
// ❌ FORBIDDEN — UPPER_SNAKE_CASE
enum ActionType {
  ADD_TOAST = "ADD_TOAST",
}

// ✅ REQUIRED — PascalCase
enum ActionType {
  AddToast = "AddToast",
}
```

---

## Full Example

```typescript
enum ActionType {
  AddToast = "AddToast",
  UpdateToast = "UpdateToast",
  DismissToast = "DismissToast",
  RemoveToast = "RemoveToast",
}

interface AddToastAction {
  type: ActionType.AddToast;
  toast: ToasterToast;
}

interface UpdateToastAction {
  type: ActionType.UpdateToast;
  toast: Partial<ToasterToast>;
}

interface DismissToastAction {
  type: ActionType.DismissToast;
  toastId?: string;
}

interface RemoveToastAction {
  type: ActionType.RemoveToast;
  toastId?: string;
}

type ToastAction =
  | AddToastAction
  | UpdateToastAction
  | DismissToastAction
  | RemoveToastAction;
```
