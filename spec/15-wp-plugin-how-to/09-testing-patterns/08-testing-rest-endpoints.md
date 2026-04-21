# 9.8 Testing REST Endpoints (Integration)

> **Parent:** [Phase 9 overview](./00-overview.md)

---

Integration tests require the WordPress test suite (`wp-phpunit`). They test the full request-response cycle.

## composer.json dev dependencies

```json
{
    "require-dev": {
        "phpunit/phpunit": "^10.0",
        "yoast/wp-test-utils": "^1.0"
    }
}
```

## Integration test bootstrap

```php
<?php
/**
 * Integration test bootstrap — loads WordPress test suite.
 */

$testsDir = getenv('WP_TESTS_DIR') ?: '/tmp/wordpress-tests-lib';

require_once $testsDir . '/includes/functions.php';

// Load the plugin
tests_add_filter('muplugins_loaded', function (): void {
    require dirname(__DIR__, 2) . '/plugin-name.php';
});

require $testsDir . '/includes/bootstrap.php';
```

## StatusEndpointTest.php

```php
<?php

namespace PluginName\Tests\Integration\Endpoints;

use WP_REST_Request;
use WP_REST_Response;
use WP_UnitTestCase;

final class StatusEndpointTest extends WP_UnitTestCase
{
    private int $adminUserId;

    public function setUp(): void
    {
        parent::setUp();

        // Create an admin user for authenticated requests
        $this->adminUserId = $this->factory->user->create([
            'role' => 'administrator',
        ]);
    }

    public function testStatusEndpointReturnsSuccessEnvelope(): void
    {
        wp_set_current_user($this->adminUserId);

        $request = new WP_REST_Request('GET', '/plugin-name-api/v1/status');
        $response = rest_do_request($request);

        $this->assertSame(200, $response->get_status());

        $data = $response->get_data();
        $this->assertTrue($data['Status']['IsSuccess']);
        $this->assertArrayHasKey('Results', $data);
    }

    public function testStatusEndpointRejectsUnauthenticated(): void
    {
        wp_set_current_user(0); // No user

        $request = new WP_REST_Request('GET', '/plugin-name-api/v1/status');
        $response = rest_do_request($request);

        $status = $response->get_status();
        $isUnauthorized = ($status === 401 || $status === 403);

        $this->assertTrue($isUnauthorized);
    }

    public function testStatusEndpointRejectsNonAdmin(): void
    {
        $subscriberId = $this->factory->user->create(['role' => 'subscriber']);
        wp_set_current_user($subscriberId);

        $request = new WP_REST_Request('GET', '/plugin-name-api/v1/status');
        $response = rest_do_request($request);

        $this->assertSame(403, $response->get_status());
    }
}
```
