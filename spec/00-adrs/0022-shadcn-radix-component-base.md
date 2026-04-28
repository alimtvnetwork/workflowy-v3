# ADR-0022: shadcn/ui (CLI-vendored) + Radix primitives as the sole component base

## Status

`Accepted` — 2026-04-28

## Context

The component base is referenced in at least nine spec files
(`spec/07-design-system/00-overview.md`,
`spec/32-ui-design/01-architecture/01-tech-stack.md`,
`spec/32-ui-design/01-architecture/04-file-organization.md`,
`spec/32-ui-design/03-design-system/97-acceptance-criteria.md`
AT-UIDS-16, the workflowy-ui sidebar/navbar/search docs, and the
error-modal integration guide) and is partially pinned in
`spec/02-coding-guidelines/01-cross-language/30-pinned-dependency-matrix.md`
(`class-variance-authority@^0.7.1`, `@radix-ui/react-slot@^1.2.4`).
Every UI-touching file *assumes* shadcn/ui + Radix, but no ADR
ratifies the choice. This leaves three concrete ambiguities an AI
implementer cannot resolve from spec alone:

1. **Library lock** — MUI, Mantine, Ant Design, HeadlessUI, and
   Chakra all ship comparable primitives; without an ADR pin,
   `spec/32-ui-design/01-architecture/01-tech-stack.md` line 13's
   "unlike Material UI or Ant Design" prose is advisory, not gating.
2. **Vendoring vs npm install** — shadcn/ui is a CLI that *copies
   source* into the consumer repo (`src/components/ui/<component>.tsx`,
   per `spec/02-coding-guidelines/08-file-folder-naming/04-typescript-javascript.md`
   line 91 and `spec/07-design-system/00-overview.md` line 14). It is
   NOT a runtime npm dependency. AI implementers reach for
   `npm install shadcn-ui` (which exists but is the CLI, not the
   components) and end up with broken imports.
3. **Customisation discipline** — AT-UIDS-16 says variants/`cva`
   only, "un-tracked shadcn edits fail review", but the gate name
   is unanchored.

## Decision

**D1 — shadcn/ui is the sole component base; Radix is its sole
underlying primitive layer.** Components MUST come from one of:

- The shadcn/ui CLI vendored sources under `src/components/ui/`
  (Button, Dialog, DropdownMenu, Popover, Tooltip, Sheet,
  ScrollArea, Separator, Badge, Avatar, Checkbox, Command, Toast,
  Toaster, Sidebar, Tabs, etc.).
- Radix UI primitives (`@radix-ui/react-*`) when shadcn does not
  yet wrap a needed primitive — added one primitive at a time,
  pinned in the deps matrix.
- Headless behaviour libraries explicitly named in this ADR's D2.

**D2 — Forbidden component libraries.** The following MUST NOT
appear in `package.json`, `node_modules`, or any import:

- `@mui/material`, `@mui/*` (Material UI / Joy UI / Base UI).
- `@mantine/*`.
- `antd`, `@ant-design/*`.
- `@headlessui/react`, `@headlessui/tailwindcss`.
- `@chakra-ui/*`.
- `react-bootstrap`, `bootstrap` (CSS or JS).
- `semantic-ui-react`.
- Any new "kitchen-sink" component framework introduced after
  this ADR without a superseding ADR.

Headless behaviour libraries that pair with — not replace —
shadcn/Radix are permitted on a case-by-case basis, currently
limited to: `@tanstack/react-virtual` (per ADR-0017),
`@tanstack/react-table` (table behaviour, not visual chrome),
`react-hook-form`, `cmdk` (already a shadcn dep), `sonner`
(already a shadcn dep), `vaul` (drawer primitive used by shadcn
Sheet on mobile). New entries require a dependency-matrix update.

**D3 — Vendored, not installed.** shadcn components are added via
`npx shadcn@latest add <component>` which copies source files into
`src/components/ui/`. There MUST NOT be a `shadcn-ui` runtime
dependency in `package.json`. The CLI itself is invoked via `npx`,
not installed as a project dep.

**D4 — Customisation discipline (ratifies AT-UIDS-16).**
- Variant additions and visual overrides MUST happen via `cva()`
  variants and the `className` prop — never by editing the
  shadcn-vendored source unless the change is tracked as a
  "shadcn-patch" in `src/components/ui/_patches/<component>.md`.
- All component visuals MUST consume semantic design tokens per
  ADR-0012 (no raw colours, no hex literals).
- Composition is preferred over modification: build feature
  components in `src/components/<feature>/` that wrap the
  vendored primitives, rather than editing the vendored files.

**D5 — Radix transitives are not free.** Even though shadcn brings
Radix in, each Radix primitive used directly (without a shadcn
wrapper) MUST be added to the pinned-deps matrix. This prevents
silent expansion of the Radix surface area outside spec review.

**D6 — Migration prohibition.** Migrating individual components
to a different library "for one feature" is forbidden. All
components MUST share one base; mixing shadcn with MUI even for
a single dialog reintroduces the visual-style fork this ADR
exists to prevent.

## Consequences

**Positive**

- Closes the implicit-but-unratified component-library choice that
  spans nine spec files; the prose-level "unlike Material UI"
  language is now load-bearing.
- AI implementers stop reaching for `npm install shadcn-ui` (the
  CLI package, not the components) when they see "shadcn" in spec.
- AT-UIDS-16's customisation discipline now has a named ADR + gate
  to cite; un-tracked shadcn edits become CI errors, not review
  comments.
- Single visual stroke/spacing/radius vocabulary across the entire
  app — a perpetual UX-quality multiplier.

**Negative**

- A future need for a component shadcn does not yet provide
  (e.g. data grid, charting) requires either a Radix primitive +
  hand-built wrapper or a superseding ADR. No casual `npm install
  @mantine/charts` escape hatch.
- Tracking shadcn-source patches in `_patches/` adds a small
  bookkeeping burden.
- Pinning forbids the easy "use HeadlessUI for this one combobox"
  reflex many React devs have.

## Alternatives Considered

1. **No lock — pick whatever fits per feature** — rejected: the
   exact failure mode AT-UIDS-16 already complains about. Visual
   drift between MUI dialogs and shadcn buttons is immediately
   visible to users.
2. **Material UI / Joy UI as the base** — rejected: opinionated
   visual defaults conflict with `mem://design/workflowy-model`'s
   minimalist aesthetic; theming MUI to Workflowy-clean costs more
   than vendoring shadcn from scratch.
3. **HeadlessUI + custom CSS** — rejected: HeadlessUI's primitive
   set is narrower than Radix's, lacks the Sidebar/Sheet/Command
   primitives the spec depends on, and would force a hand-rolled
   accessibility layer.
4. **Install `shadcn-ui` as a runtime dep** — rejected: that
   package is the CLI, not the components. shadcn's *value* is
   the vendored source — owning the component code, not importing
   black-box JSX. Installing it as a dep produces broken imports
   and misses the design intent.
5. **Radix primitives only, no shadcn vendoring** — rejected:
   re-implements shadcn's variant + token wiring from scratch in
   every component, doubling vendored surface area without
   improving customisability.

## Gates Touched

- **New gates:**
  - `G-26-COMPONENT-BASE-SHADCN-RADIX` — enforces D1
    (CI scans imports for forbidden libraries listed in D2;
    presence is a build break).
  - `G-26-NO-SHADCN-RUNTIME-DEP` — enforces D3 (no
    `shadcn-ui` or `@shadcn/*` in `package.json` runtime deps).
  - `G-26-SHADCN-PATCHES-TRACKED` — enforces D4 (any diff
    against the original `npx shadcn add` output requires a
    matching `src/components/ui/_patches/<component>.md` entry;
    CI greps for the patch file when a `// @shadcn-patch`
    sentinel appears in the source).
  - `G-26-RADIX-MATRIX-PINNED` — enforces D5 (every direct
    `@radix-ui/react-*` import must have a row in
    `30-pinned-dependency-matrix.md`).
  - `G-26-NO-MIXED-COMPONENT-BASES` — enforces D6 (no second
    component library may be added even for a single feature
    without a superseding ADR).
- **Modified gates:** AT-UIDS-16 is now anchored by
  `G-26-SHADCN-PATCHES-TRACKED`; the AT line should add the
  gate citation as a follow-up cross-reference.
- **Endpoints locked:** `(none)`.
- **DDL identifiers locked:** `(none)`.

## Supersedes / Superseded-By

- **Supersedes:** `(none)` formally; **promotes** the prose-only
  shadcn/Radix choice in
  `spec/32-ui-design/01-architecture/01-tech-stack.md` line 13 +
  AT-UIDS-16 to a load-bearing ADR-pinned decision; **anchors**
  the partial pinned-deps rows for `class-variance-authority`,
  `@radix-ui/react-slot`, `clsx`, `tailwind-merge`.
- **Superseded-By:** `(none)`
