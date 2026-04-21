# 5. Function Size and Nesting

> **Parent:** [00-overview.md](./00-overview.md)

---

## Function Size — Max 15 Lines

> **Canonical source:** [Cross-Language Code Style](../../01-cross-language/04-code-style/00-overview.md) — Rule 6

Every function/method body must be **15 lines or fewer**. Extract logic into small, well-named helper functions.

```typescript
// ❌ FORBIDDEN: 20+ line function
const handleSubmit = async (data: FormData) => {
    // validation, API call, state update, toast... all inline
};

// ✅ REQUIRED: Decomposed
const handleSubmit = async (data: FormData) => {
    const validated = validateFormData(data);
    const result = await submitToApi(validated);
    updateLocalState(result);
    showSuccessToast(result.message);
};
```

---

## Zero Nested `if` — Absolute Ban

> **Canonical source:** [Cross-Language Code Style](../../01-cross-language/04-code-style/00-overview.md) — Rule 2 & 7

Nested `if` blocks are **absolutely forbidden** — zero tolerance, no exceptions. Flatten with early returns or combined conditions.

```typescript
// ❌ FORBIDDEN: Nested if
if (response) {
    if (response.status >= 400) {
        handleError(response);
    }
}

// ✅ REQUIRED: Early return
if (!response) {
    return;
}

if (response.status >= 400) {
    handleError(response);
}
```
