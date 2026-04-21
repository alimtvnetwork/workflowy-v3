# 9.9 Testing Validation (Unit)

> **Parent:** [Phase 9 overview](./00-overview.md)

---

Test the validation patterns from Phase 6 by creating a mock handler:

```php
<?php

namespace PluginName\Tests\Unit\Traits;

use PHPUnit\Framework\TestCase;

final class ValidationPatternTest extends TestCase
{
    private object $handler;

    protected function setUp(): void
    {
        $this->handler = new class {
            use \PluginName\Traits\Core\TypeCheckerTrait {
                isArray as public;
                isString as public;
                isInteger as public;
            }

            /**
             * Simulate the validation pattern for a "create widget" request.
             *
             * @param array<string, mixed>|null $body
             *
             * @return array{valid: bool, error: string|null, data: array<string, mixed>}
             */
            public function validateCreateWidget(?array $body): array
            {
                $hasBody = ($body !== null && $this->isArray($body));

                if (!$hasBody) {
                    return ['valid' => false, 'error' => 'Request body must be a JSON object', 'data' => []];
                }

                $name = $body['name'] ?? null;
                $hasName = ($name !== null && $this->isString($name));

                if (!$hasName) {
                    return ['valid' => false, 'error' => 'Missing required field: name', 'data' => []];
                }

                $nameLength = mb_strlen($name);
                $isNameTooLong = ($nameLength > 200);

                if ($isNameTooLong) {
                    return ['valid' => false, 'error' => 'Field "name" must not exceed 200 characters', 'data' => []];
                }

                return ['valid' => true, 'error' => null, 'data' => ['name' => $name]];
            }
        };
    }

    public function testRejectsNullBody(): void
    {
        $result = $this->handler->validateCreateWidget(null);

        $this->assertFalse($result['valid']);
        $this->assertSame('Request body must be a JSON object', $result['error']);
    }

    public function testRejectsMissingName(): void
    {
        $result = $this->handler->validateCreateWidget(['other' => 'value']);

        $this->assertFalse($result['valid']);
        $this->assertStringContainsString('name', $result['error']);
    }

    public function testRejectsNonStringName(): void
    {
        $result = $this->handler->validateCreateWidget(['name' => 42]);

        $this->assertFalse($result['valid']);
    }

    public function testRejectsOverlongName(): void
    {
        $longName = str_repeat('a', 201);
        $result = $this->handler->validateCreateWidget(['name' => $longName]);

        $this->assertFalse($result['valid']);
        $this->assertStringContainsString('200', $result['error']);
    }

    public function testAcceptsValidInput(): void
    {
        $result = $this->handler->validateCreateWidget(['name' => 'My Widget']);

        $this->assertTrue($result['valid']);
        $this->assertNull($result['error']);
        $this->assertSame('My Widget', $result['data']['name']);
    }

    public function testAcceptsMaxLengthName(): void
    {
        $maxName = str_repeat('a', 200);
        $result = $this->handler->validateCreateWidget(['name' => $maxName]);

        $this->assertTrue($result['valid']);
    }
}
```
