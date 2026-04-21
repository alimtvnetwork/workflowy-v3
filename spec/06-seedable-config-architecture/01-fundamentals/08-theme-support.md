# Theme Support

> **Parent:** [00-overview.md](./00-overview.md)

The CW Config pattern supports a rich theme system with multiple customization options.

---

## Comprehensive theme system

```json
{
  "Categories": {
    "Appearance": {
      "DisplayName": "Appearance",
      "Description": "Visual customization options",
      "Settings": {
        "Theme": {
          "Type": "select",
          "Label": "Theme",
          "Description": "Base color scheme",
          "Default": "system",
          "Options": [
            "light",
            "dark",
            "system",
            "high-contrast",
            "high-contrast-dark",
            "colorful-light",
            "colorful-dark",
            "ocean-blue",
            "ocean-dark",
            "forest-green",
            "forest-dark",
            "sunset-orange",
            "sunset-dark",
            "midnight-purple",
            "rose-pink",
            "slate-gray",
            "nord-light",
            "nord-dark",
            "solarized-light",
            "solarized-dark",
            "dracula",
            "monokai",
            "github-light",
            "github-dark"
          ]
        },
        "AccentColor": {
          "Type": "select",
          "Label": "Accent Color",
          "Description": "Primary action color",
          "Default": "blue",
          "Options": [
            "blue",
            "indigo",
            "violet",
            "purple",
            "fuchsia",
            "pink",
            "rose",
            "red",
            "orange",
            "amber",
            "yellow",
            "lime",
            "green",
            "emerald",
            "teal",
            "cyan",
            "sky"
          ]
        },
        "FontSize": {
          "Type": "select",
          "Label": "Font Size",
          "Description": "Base text size",
          "Default": "medium",
          "Options": ["x-small", "small", "medium", "large", "x-large"]
        },
        "FontFamily": {
          "Type": "select",
          "Label": "Font Family",
          "Description": "Text font style",
          "Default": "system",
          "Options": [
            "system",
            "inter",
            "roboto",
            "open-sans",
            "lato",
            "poppins",
            "source-sans",
            "jetbrains-mono",
            "fira-code"
          ]
        },
        "BorderRadius": {
          "Type": "select",
          "Label": "Border Radius",
          "Description": "Corner rounding style",
          "Default": "medium",
          "Options": ["none", "small", "medium", "large", "full"]
        },
        "AnimationSpeed": {
          "Type": "select",
          "Label": "Animation Speed",
          "Description": "UI transition speed",
          "Default": "normal",
          "Options": ["none", "reduced", "normal", "fast"]
        },
        "CompactMode": {
          "Type": "boolean",
          "Label": "Compact Mode",
          "Description": "Reduce padding and spacing",
          "Default": false
        },
        "ShowIcons": {
          "Type": "boolean",
          "Label": "Show Icons",
          "Description": "Display icons in navigation",
          "Default": true
        }
      }
    }
  }
}
```

---

## Theme CSS variables

Each theme maps to CSS custom properties (HSL only — see project memory core rule):

```css
/* Example: ocean-blue theme */
[data-theme="ocean-blue"] {
  --background: 200 30% 98%;
  --foreground: 200 50% 10%;
  --primary: 200 80% 50%;
  --primary-foreground: 200 10% 98%;
  --secondary: 180 40% 90%;
  --muted: 200 20% 95%;
  --accent: 180 60% 45%;
  --destructive: 0 70% 50%;
  --border: 200 20% 85%;
  --ring: 200 80% 50%;
  --radius: 0.5rem;
}

/* Example: dracula theme */
[data-theme="dracula"] {
  --background: 231 15% 18%;
  --foreground: 60 30% 96%;
  --primary: 265 89% 78%;
  --primary-foreground: 231 15% 18%;
  --secondary: 225 27% 26%;
  --muted: 232 14% 31%;
  --accent: 135 94% 65%;
  --destructive: 0 100% 67%;
  --border: 232 14% 31%;
  --ring: 265 89% 78%;
}
```

---

## React theme provider

```typescript
// hooks/useTheme.ts
import { useSettings } from './useSettings';

export function useTheme() {
  const { settings, updateSetting } = useSettings();

  const theme = settings?.Appearance?.Theme ?? 'system';
  const accentColor = settings?.Appearance?.AccentColor ?? 'blue';

  const setTheme = (newTheme: string) => {
    updateSetting('Appearance', 'Theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const setAccentColor = (color: string) => {
    updateSetting('Appearance', 'AccentColor', color);
    document.documentElement.setAttribute('data-accent', color);
  };

  return { theme, accentColor, setTheme, setAccentColor };
}
```
