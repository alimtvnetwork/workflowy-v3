# Welcome Screen & Landing Page

> **Version:** 3.2.0  
> **Updated:** 2026-04-19

---

## Docs Viewer Welcome Screen

When no file is selected, the docs viewer renders a centered welcome screen (`WelcomeScreen` component):

```
┌──────────────────────────────────────────────┐
│                                              │
│              ┌──────────┐                    │
│              │  📖 Icon │  ← primary/5 bg    │
│              └──────────┘     rounded-2xl     │
│                                              │
│       Specification Documentation            │
│                                              │
│    Browse {N} spec files covering...         │
│                                              │
│    Press [?] for keyboard shortcuts          │
│                                              │
│         ┌──────────────────┐                 │
│         │  📄 Start Reading │ ← primary bg    │
│         └──────────────────┘                 │
│                                              │
└──────────────────────────────────────────────┘
```

**Key styling rules:**

| Element | Style |
|---------|-------|
| Icon container | `rounded-2xl bg-primary/5 p-6` |
| Icon | `BookOpen` from Lucide, `h-12 w-12 text-primary` |
| Title | `text-2xl font-bold font-heading` (Ubuntu) |
| Description | `text-muted-foreground max-w-md` |
| Keyboard hint | `text-xs text-muted-foreground`, `<kbd>` uses `bg-muted border-border font-mono` |
| CTA button | `bg-primary text-primary-foreground rounded-lg px-5 py-2.5`, `hover:opacity-90` |

**Source:** `src/components/docs/WelcomeScreen.tsx`

---

## Landing Page (`/`)

The root landing page (`LandingPage`) is a full marketing page with multiple sections:

### Section Layout

```
┌─────────────────────────────────────────────┐
│  Hero Section (gradient background)         │
│  • Version badge (rounded-full, secondary)  │
│  • H1 title (4xl–6xl responsive)            │
│  • Description (text-muted-foreground)      │
│  • 3 CTA buttons                            │
├─────────────────────────────────────────────┤
│  Code-Red Rules (6 cards in 3-column grid)  │
│  • destructive/20 border, destructive/5 bg  │
│  • group-hover: scale(1.03), shadow-lg      │
│  • Each card deep-links to /docs?file=...   │
├─────────────────────────────────────────────┤
│  Quick Reference (4 cards in 2-column grid) │
│  • hover: scale(1.02), primary/40 border    │
│  • Each card deep-links to /docs?file=...   │
├─────────────────────────────────────────────┤
│  Detailed Specs (6 cards in 3-column grid)  │
│  • icon in primary/10 rounded-lg container  │
│  • hover: border-primary/40                 │
├─────────────────────────────────────────────┤
│  Stats Bar (4 columns)                      │
│  • Values in text-primary text-3xl font-bold│
├─────────────────────────────────────────────┤
│  Footer (border-t, text-muted-foreground)   │
└─────────────────────────────────────────────┘
```

### Card Hover Animations

All landing page cards use `group-hover` animations:

```css
/* Code-Red cards */
.code-red-card {
  transition: all 300ms;
}
.code-red-card:hover {
  transform: scale(1.03);
  border-color: hsl(var(--destructive) / 0.5);
  background: hsl(var(--destructive) / 0.1);
  box-shadow: 0 10px 15px -3px hsl(var(--destructive) / 0.1);
}
.code-red-card:hover .icon {
  transform: scale(1.25);  /* Icon enlarges independently */
}

/* Quick Reference cards */
.ref-card:hover {
  transform: scale(1.02);
  border-color: hsl(var(--primary) / 0.4);
  box-shadow: 0 10px 15px -3px hsl(var(--primary) / 0.05);
}
.ref-card:hover .title {
  color: hsl(var(--primary));  /* Title shifts to primary */
}
```

### Hero Section Background

```css
/* Subtle dual-tone gradient overlay */
background: linear-gradient(
  to bottom right,
  hsl(var(--primary) / 0.05),   /* Purple tint top-left */
  transparent,                    /* Clear center */
  hsl(var(--accent) / 0.05)      /* Pink tint bottom-right */
);
```

**Source:** `src/pages/LandingPage.tsx`

---

## Deep-Linking System

The docs viewer supports direct file navigation via URL query parameters:

```
/docs?file=spec/02-coding-guidelines/01-cross-language/04-code-style/01-braces-and-nesting.md
```

### How It Works

1. **Landing page cards** navigate using `useNavigate()`:
   ```typescript
   navigate(`/docs?file=${encodeURIComponent(item.docPath)}`);
   ```

2. **`useDeepLinkFile` hook** runs on mount in `DocsViewer`:
   ```typescript
   const params = new URLSearchParams(window.location.search);
   const filePath = params.get("file");
   const matchedFile = allFiles.find(f => f.path === filePath);
   if (matchedFile) {
     setActiveFile(matchedFile);
     window.history.replaceState({}, "", "/docs"); // Clean URL
   }
   ```

3. **URL cleanup**: After resolving the file, the `?file=` param is removed via `replaceState` so the URL stays clean at `/docs`.

### Deep-Link Path Format

- Paths are relative to project root (e.g., `spec/02-coding-guidelines/...`)
- Must match `SpecNode.path` exactly (case-sensitive)
- URL-encoded via `encodeURIComponent()`
- If no match is found, the welcome screen is shown (graceful fallback)

**Source:** `src/pages/DocsViewerHelpers.ts` (`useDeepLinkFile`)

---

*Welcome & landing — v3.2.0 — 2026-04-19*
