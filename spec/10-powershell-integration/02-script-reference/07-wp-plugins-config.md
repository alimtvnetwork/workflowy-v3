# 7. wpPlugins Configuration

> **Parent:** [00-overview.md](./00-overview.md)

---

The `wpPlugins` object in `powershell.json` provides a plugin registry used by the `-q` (QUpload) and `-z` (ZIP) flags.

## Fields

| Field | Type | Description |
|-------|------|-------------|
| `pluginsDir` | string | Root directory containing plugin folders (e.g. `"wp-plugins"`) |
| `defaultUploader` | string | Plugin slug used by `-u` when no `-pp` is provided |
| `defaultQUploader` | string | Plugin slug used by `-q` when no `-pp` is provided |
| `plugins` | object | Map of plugin slug → plugin config |

## Plugin Entry Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Human-readable plugin name |
| `path` | string | Relative path to the plugin folder |
| `mainFile` | string | Main PHP file name |
| `autoUpload` | boolean | Whether this plugin is included in bulk upload operations |

## `-q` Flag Fallback Behavior

When `-q` is used **without** `-pp`:

1. Read `wpPlugins.defaultQUploader` from `powershell.json`
2. If missing, fall back to `wpPlugins.defaultUploader`
3. If neither exists, exit with error
4. Resolve the plugin's `path` from the `plugins` map
5. Validate the path exists on disk before proceeding

## Example

```json
{
  "wpPlugins": {
    "pluginsDir": "wp-plugins",
    "defaultUploader": "riseup-asia-uploader",
    "defaultQUploader": "qupload",
    "plugins": {
      "qupload": {
        "name": "Quick Upload",
        "path": "wp-plugins/qupload",
        "mainFile": "qupload.php",
        "autoUpload": false
      }
    }
  }
}
```
