# 20.12 Step 11 — Admin Settings Page

> **Parent:** [Phase 20 overview](./00-overview.md)  
> **Phase 8, §8.1** — Admin menu registration  
> **Phase 11, §11.1–§11.4** — Template ≤200 lines, orchestrator pattern  
> **Phase 15** — Settings architecture  
> **Phase 12** — Design system tokens

---

## 11a. Admin menu registration (in Plugin.php)

Add this method to Plugin.php (or a separate `AdminPageTrait`):

```php
public function registerAdminPages(): void
{
    add_menu_page(
        PluginConfigType::Name->value,
        PluginConfigType::ShortName->value,
        CapabilityType::ManageOptions->value,
        PluginConfigType::Slug->value,
        [$this, 'renderSettingsPage'],
        'dashicons-list-view',
        80,
    );
}

public function renderSettingsPage(): void
{
    $isAuthorized = current_user_can(CapabilityType::ManageOptions->value);

    if (!$isAuthorized) {
        wp_die('Unauthorized access');
    }

    $templatePath = plugin_dir_path(dirname(__DIR__, 2)) . 'templates/settings.php';
    $hasTemplate = file_exists($templatePath);

    if ($hasTemplate) {
        include $templatePath;
    }
}
```

## 11b. Settings template

**File: `templates/settings.php`**

```php
<?php
/**
 * Settings page template — Task Tracker.
 *
 * @var none — all data fetched inline (simple page)
 * @package TaskTracker
 */

if (!defined('ABSPATH')) {
    exit;
}

$isNotificationsEnabled = get_option('task_tracker_notifications', 'no');
?>
<div class="wrap">
    <h1><?php echo esc_html(get_admin_page_title()); ?></h1>

    <form method="post" action="options.php">
        <?php settings_fields('task_tracker_settings'); ?>

        <table class="form-table">
            <tr>
                <th scope="row">
                    <label for="task_tracker_notifications">Enable Notifications</label>
                </th>
                <td>
                    <select name="task_tracker_notifications" id="task_tracker_notifications">
                        <option value="yes" <?php selected($isNotificationsEnabled, 'yes'); ?>>
                            Yes
                        </option>
                        <option value="no" <?php selected($isNotificationsEnabled, 'no'); ?>>
                            No
                        </option>
                    </select>
                    <p class="description">
                        Send email notifications when a task is completed.
                    </p>
                </td>
            </tr>
        </table>

        <?php submit_button('Save Settings'); ?>
    </form>
</div>
```

**Template line count:** ~42 lines — well within the 200-line limit (Phase 11, §11.1).
