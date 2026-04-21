# 11.7 React.js Integration (Optional — Developer Confirmation Required)

> **Parent:** [00-overview.md](./00-overview.md)

> **⚠️ Important:** Using React + Tailwind for a WordPress plugin admin UI is a valid architectural choice but must be **explicitly confirmed by the developer** before implementation. It adds build tooling complexity (Node.js, Vite/Webpack, npm scripts) that not all teams are prepared to maintain.

## When to use React

| Use React when | Stick with PHP templates when |
|----------------|------------------------------|
| Admin UI has complex interactive state (drag-and-drop, real-time updates) | Pages are mostly forms and tables |
| Multiple components share state (dashboard with linked widgets) | Each section is independent |
| Developer team has React experience | Team is PHP-only |
| Plugin will have a standalone SPA-like admin experience | Standard WordPress admin look-and-feel is preferred |

## Directory structure (React mode)

```
plugin-slug/
├── frontend/                        ← React source (NOT shipped in ZIP)
│   ├── src/
│   │   ├── main.tsx                  ← Entry point
│   │   ├── App.tsx                   ← Root component
│   │   ├── components/
│   │   │   ├── settings/
│   │   │   │   ├── SettingsPage.tsx
│   │   │   │   ├── GeneralSection.tsx
│   │   │   │   └── UpdateSection.tsx
│   │   │   └── shared/
│   │   │       ├── PageHeader.tsx
│   │   │       ├── Card.tsx
│   │   │       └── Modal.tsx
│   │   ├── hooks/
│   │   │   └── useApi.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── styles/
│   │       └── index.css             ← Tailwind entry
│   ├── index.html                    ← Dev server entry
│   ├── vite.config.ts                ← Build configuration
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   ├── tsconfig.json
│   └── package.json
├── assets/
│   └── dist/                         ← Built output (shipped in ZIP)
│       ├── admin.js                  ← Bundled React app
│       ├── admin.css                 ← Bundled Tailwind CSS
│       ├── admin.js.map              ← Source map (DEV ONLY — see §11.8)
│       └── admin.css.map             ← Source map (DEV ONLY — see §11.8)
├── includes/
├── templates/
│   └── admin-react-root.php          ← Minimal mount-point template
└── .distignore                       ← Must exclude frontend/ source
```

## Mount-point template

When using React, the PHP template is minimal — just a mount point:

```php
<?php
/**
 * Admin React App Mount Point
 *
 * Renders the #plugin-root div where the React application mounts.
 * All UI is handled by React — this template only provides the container.
 *
 * @package PluginName
 * @since   1.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}
?>
<div class="wrap">
    <div id="plugin-name-root"></div>
</div>
```

## React component size rules

The same file size limits apply to React components:

| File type | Ideal | Maximum |
|-----------|-------|---------|
| Page component (e.g. `SettingsPage.tsx`) | 50–80 lines | 150 |
| UI component (e.g. `Card.tsx`, `Modal.tsx`) | 20–50 lines | 100 |
| Custom hook (e.g. `useApi.ts`) | 30–60 lines | 100 |
| Type definitions | 20–40 lines | 100 |

**Rule:** If a React component exceeds 100 lines, extract sub-components or custom hooks.
