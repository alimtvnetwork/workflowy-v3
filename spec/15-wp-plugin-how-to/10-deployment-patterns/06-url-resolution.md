# 10.6 URL Resolution with Redirect Handling

> **Updated:** 2026-04-19

---

## Why resolve URLs?

Update URLs may use URL shorteners or redirectors that return 301/302 responses. The plugin must resolve through redirect chains to find the final download URL.

---

## UpdateResolverUrlTrait

```php
namespace PluginName\Update\Traits;

if (!defined('ABSPATH')) {
    exit;
}

use PluginName\Enums\UpdateConfigType;

trait UpdateResolverUrlTrait
{
    /**
     * Resolve a URL through redirect chains to find the final destination.
     *
     * @param string $url          Starting URL
     * @param int    $maxRedirects Maximum redirects to follow
     * @return array{resolved: bool, url: string, redirects: int}
     */
    public function resolveUrl(string $url, int $maxRedirects = 5): array
    {
        $currentUrl = $url;
        $redirectCount = 0;
        $limit = min($maxRedirects, UpdateConfigType::MaxRedirects->value);

        for ($i = 0; $i < $limit; $i++) {
            $response = wp_remote_head($currentUrl, [
                'redirection' => 0,  // Don't auto-follow
                'timeout'     => 10,
            ]);

            $isError = is_wp_error($response);

            if ($isError) {
                break;
            }

            $statusCode = wp_remote_retrieve_response_code($response);
            $isRedirect = in_array($statusCode, [301, 302, 307, 308], true);

            if (!$isRedirect) {
                return [
                    'resolved'  => true,
                    'url'       => $currentUrl,
                    'redirects' => $redirectCount,
                ];
            }

            $location = wp_remote_retrieve_header($response, 'location');
            $hasLocation = !empty($location);

            if (!$hasLocation) {
                break;
            }

            $currentUrl = $location;
            $redirectCount++;
        }

        return [
            'resolved'  => false,
            'url'       => $currentUrl,
            'redirects' => $redirectCount,
        ];
    }

    /**
     * Check if the cached resolved URL is still fresh.
     */
    public function isUrlCacheFresh(string $resolvedAt, int $cacheDays): bool
    {
        $hasResolvedAt = !empty($resolvedAt);

        if (!$hasResolvedAt) {
            return false;
        }

        $resolvedTime = strtotime($resolvedAt);
        $expiresAt = $resolvedTime + ($cacheDays * DAY_IN_SECONDS);
        $now = time();

        return ($now < $expiresAt);
    }
}
```

---

*URL resolution — v3.2.0 — 2026-04-19*
