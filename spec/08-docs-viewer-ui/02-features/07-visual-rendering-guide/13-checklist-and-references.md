# Implementation Checklist & Cross-References

> **Version:** 3.2.0  
> **Updated:** 2026-04-19

---

## Implementation Checklist

- [ ] Use CSS custom properties for ALL colors — never hardcode
- [ ] Code blocks always render with dark background regardless of theme mode
- [ ] Tree structures use emoji prefixes (📁 folders, 📄 files)
- [ ] Tree guides are muted at 50% opacity
- [ ] Each language has a unique HSL badge color
- [ ] Headings use gradient text fill (purple→pink)
- [ ] All hover effects combine 2–3 properties for richness
- [ ] Font sizes in code blocks synchronize between line numbers and content
- [ ] TOC uses IntersectionObserver for scroll-spy
- [ ] TOC auto-scrolls active item into view with `block: "nearest"`
- [ ] Split divider clamps ratio to 20%–80%
- [ ] Monaco editor theme follows app light/dark mode
- [ ] Split preview re-renders live on every keystroke
- [ ] Progress bar uses primary→accent gradient
- [ ] Welcome screen shows file count and keyboard shortcut hint
- [ ] Landing page cards use `group-hover` scale + shadow animations
- [ ] Deep-link `?file=` param resolves and cleans URL after match
- [ ] Sidebar folders auto-expand to reveal active file
- [ ] Search filters by name and content, capped at 20 results
- [ ] File selection clears search query
- [ ] Sidebar collapse hides branding and search via `group-data-[collapsible=icon]:hidden`

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Theme & Animation Spec | `spec/08-docs-viewer-ui/02-features/06-ui-theme-animations.md` |
| Syntax Highlighting Spec | `spec/08-docs-viewer-ui/02-features/02-syntax-highlighting.md` |
| Typography Spec | `spec/08-docs-viewer-ui/02-features/01-typography.md` |
| Highlighter Source | `src/components/markdown/highlighter.ts` |
| Code Block Builder | `src/components/markdown/codeBlockBuilder.ts` |
| CSS Styles | `src/index.css` (lines 134–934) |
| Language Constants | `src/components/markdown/constants.ts` |
| Table of Contents | `src/components/TableOfContents.tsx` |
| Scroll Spy Hook | `src/hooks/useScrollSpy.ts` |
| Monaco Editor | `src/components/MonacoMarkdownEditor.tsx` |
| Split View Components | `src/pages/DocsViewerComponents.tsx` |
| Split/View Hooks | `src/pages/DocsViewerHelpers.ts` |
| Welcome Screen | `src/components/docs/WelcomeScreen.tsx` |
| Landing Page | `src/pages/LandingPage.tsx` |
| Deep-Link Hook | `src/pages/DocsViewerHelpers.ts` (`useDeepLinkFile`) |
| Sidebar | `src/components/docs/DocsSidebar.tsx` |
| Tree Navigation | `src/components/SpecTreeNav.tsx` |
| Search Hook | `src/hooks/useSpecData.ts` (`useSpecSearch`) |

---

*Checklist & references — v3.2.0 — 2026-04-19*
