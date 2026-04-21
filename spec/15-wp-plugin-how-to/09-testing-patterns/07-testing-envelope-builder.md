# 9.7 Testing the EnvelopeBuilder

> **Parent:** [Phase 9 overview](./00-overview.md)

---

```php
<?php

namespace PluginName\Tests\Unit\Helpers;

use PHPUnit\Framework\TestCase;
use PluginName\Helpers\EnvelopeBuilder;

final class EnvelopeBuilderTest extends TestCase
{
    // ── Success Responses ──

    public function testSuccessEnvelopeHasCorrectStructure(): void
    {
        $response = EnvelopeBuilder::success('OK', 200)
            ->setRequestedAt('/test/v1/endpoint')
            ->setSingleResult(['id' => '123'])
            ->toResponse();

        $data = $response->get_data();

        $this->assertSame(200, $response->get_status());
        $this->assertTrue($data['Status']['IsSuccess']);
        $this->assertFalse($data['Status']['IsFailed']);
        $this->assertSame('OK', $data['Status']['Message']);
        $this->assertSame('/test/v1/endpoint', $data['Attributes']['RequestedAt']);
        $this->assertCount(1, $data['Results']);
        $this->assertSame('123', $data['Results'][0]['id']);
        $this->assertArrayNotHasKey('Errors', $data);
    }

    public function testSuccessWithListResult(): void
    {
        $items = [['id' => '1'], ['id' => '2'], ['id' => '3']];

        $response = EnvelopeBuilder::success()
            ->setListResult($items)
            ->toResponse();

        $data = $response->get_data();

        $this->assertSame(3, $data['Attributes']['TotalRecords']);
        $this->assertCount(3, $data['Results']);
    }

    public function testSuccessWithEmptyResults(): void
    {
        $response = EnvelopeBuilder::success()->toResponse();
        $data = $response->get_data();

        $this->assertSame(0, $data['Attributes']['TotalRecords']);
        $this->assertSame([], $data['Results']);
    }

    // ── Error Responses ──

    public function testErrorEnvelopeWithoutDebugOmitsStackTrace(): void
    {
        // PLUGIN_NAME_DEBUG is false (or undefined) in test environment
        $exception = new \RuntimeException('Something broke');

        $response = EnvelopeBuilder::error('Something broke', 500, $exception)
            ->setRequestedAt('/test/v1/endpoint')
            ->toResponse();

        $data = $response->get_data();

        $this->assertSame(500, $response->get_status());
        $this->assertFalse($data['Status']['IsSuccess']);
        $this->assertTrue($data['Status']['IsFailed']);

        // In production mode: generic message, no Errors key
        $this->assertSame('An internal error occurred', $data['Status']['Message']);
        $this->assertArrayNotHasKey('Errors', $data);
    }

    public function testErrorEnvelopeFor400IncludesRealMessage(): void
    {
        $response = EnvelopeBuilder::error('Missing field: name', 400)
            ->toResponse();

        $data = $response->get_data();

        // 400 errors always show real message regardless of debug mode
        $this->assertSame('Missing field: name', $data['Status']['Message']);
    }

    // ── Timestamp ──

    public function testTimestampIsUtcIso8601(): void
    {
        $response = EnvelopeBuilder::success()->toResponse();
        $data = $response->get_data();

        $timestamp = $data['Status']['Timestamp'];
        $parsed = \DateTimeImmutable::createFromFormat(\DateTimeInterface::ATOM, $timestamp);
        $isValidTimestamp = ($parsed !== false);

        $this->assertTrue($isValidTimestamp, "Timestamp '{$timestamp}' is not valid ISO 8601");
    }

    // ── PascalCase Keys ──

    public function testAllTopLevelKeysArePascalCase(): void
    {
        $response = EnvelopeBuilder::success()
            ->setSingleResult(['test' => true])
            ->toResponse();

        $data = $response->get_data();
        $keys = array_keys($data);

        foreach ($keys as $key) {
            $isPascalCase = (preg_match('/^[A-Z][a-zA-Z]*$/', $key) === 1);

            $this->assertTrue($isPascalCase, "Key '{$key}' is not PascalCase");
        }
    }
}
```

## Testing debug-mode responses

To test the debug-mode path, define the constant before the test:

```php
public function testErrorEnvelopeWithDebugIncludesStackTrace(): void
{
    // This test only works if PLUGIN_NAME_DEBUG is true
    // Define it in a separate phpunit.xml bootstrap or test-specific setup
    if (!defined('PLUGIN_NAME_DEBUG')) {
        define('PLUGIN_NAME_DEBUG', true);
    }

    $exception = new \RuntimeException('Test exception');

    $response = EnvelopeBuilder::error('Test exception', 500, $exception)
        ->toResponse();

    $data = $response->get_data();

    $this->assertArrayHasKey('Errors', $data);
    $this->assertSame('Test exception', $data['Errors']['BackendMessage']);
    $this->assertSame('RuntimeException', $data['Errors']['ExceptionType']);
    $this->assertNotEmpty($data['Errors']['Backend']);
}
```

> **Warning:** PHP constants can only be defined once per process. If you need to test both debug ON and OFF, use separate PHPUnit test suites with different bootstrap files, or use a method-based approach in `PluginConfigType::isDebugMode()` that can be overridden in tests.

## Testable debug mode pattern

To make debug mode testable without constants:

```php
// In PluginConfigType — add override for tests
private static ?bool $debugOverride = null;

public static function setDebugOverride(?bool $value): void
{
    self::$debugOverride = $value;
}

public static function isDebugMode(): bool
{
    $hasOverride = (self::$debugOverride !== null);

    if ($hasOverride) {
        return self::$debugOverride;
    }

    $constantName = self::DebugConstant->value;
    $isDefined = defined($constantName);

    return $isDefined && constant($constantName) === true;
}
```

Then in tests:

```php
protected function setUp(): void
{
    PluginConfigType::setDebugOverride(true);
}

protected function tearDown(): void
{
    PluginConfigType::setDebugOverride(null);
}
```
