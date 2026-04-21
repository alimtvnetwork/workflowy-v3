# 9.5 Testing Enums

> **Parent:** [Phase 9 overview](./00-overview.md)

---

Enums are the easiest to test — pure value objects with no dependencies.

## PluginConfigTypeTest.php

```php
<?php

namespace PluginName\Tests\Unit\Enums;

use PHPUnit\Framework\TestCase;
use PluginName\Enums\PluginConfigType;

final class PluginConfigTypeTest extends TestCase
{
    public function testSlugIsKebabCase(): void
    {
        $slug = PluginConfigType::Slug->value;
        $isKebabCase = (preg_match('/^[a-z0-9]+(-[a-z0-9]+)*$/', $slug) === 1);

        $this->assertTrue($isKebabCase, "Slug '{$slug}' must be kebab-case");
    }

    public function testVersionFollowsSemver(): void
    {
        $version = PluginConfigType::Version->value;
        $isSemver = (preg_match('/^\d+\.\d+\.\d+$/', $version) === 1);

        $this->assertTrue($isSemver, "Version '{$version}' must follow semver (x.y.z)");
    }

    public function testApiFullNamespaceFormat(): void
    {
        $namespace = PluginConfigType::apiFullNamespace();

        $this->assertStringContainsString('/', $namespace);
        $this->assertStringEndsWith('/v1', $namespace);
    }

    public function testDebugModeReturnsBool(): void
    {
        $result = PluginConfigType::isDebugMode();

        $this->assertIsBool($result);
    }

    public function testIsEqualComparison(): void
    {
        $slug = PluginConfigType::Slug;

        $this->assertTrue($slug->isEqual(PluginConfigType::Slug));
        $this->assertFalse($slug->isEqual(PluginConfigType::Version));
    }

    public function testIsOtherThanComparison(): void
    {
        $slug = PluginConfigType::Slug;

        $this->assertTrue($slug->isOtherThan(PluginConfigType::Version));
        $this->assertFalse($slug->isOtherThan(PluginConfigType::Slug));
    }

    public function testIsAnyOfComparison(): void
    {
        $slug = PluginConfigType::Slug;

        $this->assertTrue($slug->isAnyOf(PluginConfigType::Slug, PluginConfigType::Name));
        $this->assertFalse($slug->isAnyOf(PluginConfigType::Version, PluginConfigType::Name));
    }
}
```

## PhpNativeTypeTest.php

```php
<?php

namespace PluginName\Tests\Unit\Enums;

use PHPUnit\Framework\TestCase;
use PluginName\Enums\PhpNativeType;

final class PhpNativeTypeTest extends TestCase
{
    /**
     * @dataProvider matchesProvider
     */
    public function testMatchesReturnsCorrectResult(
        PhpNativeType $type,
        mixed $value,
        bool $expected,
    ): void {
        $this->assertSame($expected, $type->matches($value));
    }

    /**
     * @return array<string, array{PhpNativeType, mixed, bool}>
     */
    public static function matchesProvider(): array
    {
        return [
            'array matches array'       => [PhpNativeType::PhpArray, [1, 2], true],
            'array rejects string'      => [PhpNativeType::PhpArray, 'hello', false],
            'string matches string'     => [PhpNativeType::PhpString, 'hello', true],
            'string rejects int'        => [PhpNativeType::PhpString, 42, false],
            'integer matches int'       => [PhpNativeType::PhpInteger, 42, true],
            'integer rejects float'     => [PhpNativeType::PhpInteger, 3.14, false],
            'double matches float'      => [PhpNativeType::PhpDouble, 3.14, true],
            'double rejects int'        => [PhpNativeType::PhpDouble, 42, false],
            'boolean matches bool'      => [PhpNativeType::PhpBoolean, true, true],
            'boolean rejects string'    => [PhpNativeType::PhpBoolean, 'true', false],
            'null matches null'         => [PhpNativeType::PhpNull, null, true],
            'null rejects empty string' => [PhpNativeType::PhpNull, '', false],
            'object matches object'     => [PhpNativeType::PhpObject, new \stdClass(), true],
            'object rejects array'      => [PhpNativeType::PhpObject, [], false],
        ];
    }

    public function testAllCasesHaveValidGettypeValue(): void
    {
        $validTypes = ['array', 'string', 'integer', 'double', 'boolean', 'object', 'NULL'];

        foreach (PhpNativeType::cases() as $case) {
            $this->assertContains(
                $case->value,
                $validTypes,
                "Enum case {$case->name} has invalid gettype value: {$case->value}",
            );
        }
    }
}
```

## Pattern: Every enum test should verify

- [ ] All cases have the expected backing values
- [ ] `isEqual()`, `isOtherThan()`, `isAnyOf()` work correctly
- [ ] Helper methods return expected types
- [ ] Format constraints are met (kebab-case slugs, semver versions, etc.)
