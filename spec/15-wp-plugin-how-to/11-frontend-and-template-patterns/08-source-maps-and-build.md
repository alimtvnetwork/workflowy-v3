# 11.8 Source Maps — Dev vs. Production

> **Parent:** [00-overview.md](./00-overview.md)

Source maps **must** be included in development builds and **must NOT** be included in production/distribution builds.

## Why

| Environment | Source maps? | Reason |
|-------------|-------------|--------|
| **Development** | ✅ Yes | Enables debugging in browser DevTools with original source |
| **Production** | ❌ No | Prevents exposing source code, reduces file size, improves security |

## Vite configuration

```typescript
// frontend/vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
    const isDev = mode === 'development';

    return {
        plugins: [react()],
        build: {
            outDir: resolve(__dirname, '../assets/dist'),
            emptyOutDir: true,
            sourcemap: isDev,   // ← Source maps ONLY in dev
            rollupOptions: {
                input: resolve(__dirname, 'src/main.tsx'),
                output: {
                    entryFileNames: 'admin.js',
                    chunkFileNames: 'chunks/[name]-[hash].js',
                    assetFileNames: (assetInfo) => {
                        const isCss = assetInfo.name?.endsWith('.css');

                        return isCss ? 'admin.css' : 'assets/[name]-[hash][extname]';
                    },
                },
            },
        },
    };
});
```

## Build commands

```json
// frontend/package.json (scripts section)
{
  "scripts": {
    "dev": "vite",
    "build": "vite build --mode production",
    "build:dev": "vite build --mode development",
    "preview": "vite preview"
  }
}
```

## .distignore additions for React projects

```
# Add to .distignore when using React
frontend
node_modules
assets/dist/*.map
```

## Verification checklist

```
✅ `npm run build` produces assets/dist/admin.js + admin.css
✅ `npm run build` does NOT produce .map files
✅ `npm run build:dev` DOES produce .map files
✅ assets/dist/ is committed to version control (built artifacts ship with plugin)
✅ frontend/ source is NOT in the distribution ZIP
✅ .map files are NOT in the distribution ZIP
```
