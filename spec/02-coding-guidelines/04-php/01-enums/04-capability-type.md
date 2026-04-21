# CapabilityType — WordPress Capabilities

> **Parent:** [00-overview.md](00-overview.md)

```php
enum CapabilityType: string
{
    case ManageOptions   = 'manage_options';
    case ActivatePlugins = 'activate_plugins';
    case PublishPosts    = 'publish_posts';
    case UploadFiles     = 'upload_files';
    case EditPosts       = 'edit_posts';
    case DeletePlugins   = 'delete_plugins';
    case InstallPlugins  = 'install_plugins';
    case UpdatePlugins   = 'update_plugins';
    case SwitchThemes    = 'switch_themes';
    case ManageUsers     = 'manage_users';
    case ManageNetwork   = 'manage_network';

    public function isEqual(self $other): bool { return $this === $other; }
}
```

## Usage

```php
use RiseupAsia\\Enums\\CapabilityType;

// ❌ FORBIDDEN
if (current_user_can('manage_options')) { ... }

// ✅ REQUIRED
if (current_user_can(CapabilityType::ManageOptions->value)) { ... }
```
