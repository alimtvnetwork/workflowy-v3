# UI Integration

> **Parent:** [00-overview.md](./00-overview.md)

---

## Version Badge

```typescript
// components/VersionBadge.tsx
import { Badge } from '@/components/ui/badge';
import { useConfig } from '@/hooks/useConfig';

export function VersionBadge() {
  const { meta } = useConfig();

  const isNew = meta.SeedVersion !== meta.CurrentVersion;

  return (
    <Badge variant={isNew ? "default" : "secondary"}>
      v{meta.CurrentVersion}
      {isNew && " (updated)"}
    </Badge>
  );
}
```

---

## New Settings Highlight

```typescript
// Highlight settings added in current version
function SettingItem({ setting, currentVersion }: Props) {
  const isNew = setting.AddedInVersion === currentVersion;

  return (
    <div className={cn(
      "p-4 rounded-lg",
      isNew && "ring-2 ring-primary bg-primary/5"
    )}>
      {isNew && <Badge className="mb-2">New in v{currentVersion}</Badge>}
      {/* ... setting content */}
    </div>
  );
}
```

---

## Token usage

Both examples use **semantic Tailwind tokens** (`primary`, `bg-primary/5`) — never hard-coded HSL/hex. See [Tailwind SSOT](../../32-ui-design/03-design-system/03-tailwind-version-ssot.md).
