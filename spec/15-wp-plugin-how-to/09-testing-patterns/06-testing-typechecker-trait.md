# 9.6 Testing the TypeCheckerTrait

> **Parent:** [Phase 9 overview](./00-overview.md)

---

Traits cannot be instantiated directly. Create a concrete test class that uses the trait:

```php
<?php

namespace PluginName\Tests\Unit\Traits;

use PHPUnit\Framework\TestCase;
use PluginName\Traits\Core\TypeCheckerTrait;

final class TypeCheckerTraitTest extends TestCase
{
    private object $checker;

    protected function setUp(): void
    {
        // Anonymous class that uses the trait
        $this->checker = new class {
            use TypeCheckerTrait {
                isArray as public;
                isString as public;
                isInteger as public;
                isFloat as public;
                isBoolean as public;
                isObject as public;
                isNull as public;
                isNumeric as public;
                isScalar as public;
            }
        };
    }

    public function testIsArrayWithArray(): void
    {
        $this->assertTrue($this->checker->isArray([]));
        $this->assertTrue($this->checker->isArray([1, 2, 3]));
        $this->assertTrue($this->checker->isArray(['key' => 'value']));
    }

    public function testIsArrayRejectsNonArrays(): void
    {
        $this->assertFalse($this->checker->isArray('not array'));
        $this->assertFalse($this->checker->isArray(42));
        $this->assertFalse($this->checker->isArray(null));
        $this->assertFalse($this->checker->isArray(new \stdClass()));
    }

    public function testIsStringWithString(): void
    {
        $this->assertTrue($this->checker->isString('hello'));
        $this->assertTrue($this->checker->isString(''));
    }

    public function testIsStringRejectsNonStrings(): void
    {
        $this->assertFalse($this->checker->isString(42));
        $this->assertFalse($this->checker->isString(true));
        $this->assertFalse($this->checker->isString(null));
    }

    public function testIsIntegerWithInt(): void
    {
        $this->assertTrue($this->checker->isInteger(0));
        $this->assertTrue($this->checker->isInteger(-1));
        $this->assertTrue($this->checker->isInteger(PHP_INT_MAX));
    }

    public function testIsIntegerRejectsFloatAndNumericString(): void
    {
        $this->assertFalse($this->checker->isInteger(3.14));
        $this->assertFalse($this->checker->isInteger('42'));
    }

    public function testIsNumericAcceptsBothIntAndFloat(): void
    {
        $this->assertTrue($this->checker->isNumeric(42));
        $this->assertTrue($this->checker->isNumeric(3.14));
        $this->assertFalse($this->checker->isNumeric('42'));
        $this->assertFalse($this->checker->isNumeric(null));
    }

    public function testIsScalarAcceptsAllScalarTypes(): void
    {
        $this->assertTrue($this->checker->isScalar('hello'));
        $this->assertTrue($this->checker->isScalar(42));
        $this->assertTrue($this->checker->isScalar(3.14));
        $this->assertTrue($this->checker->isScalar(true));
    }

    public function testIsScalarRejectsCompoundTypes(): void
    {
        $this->assertFalse($this->checker->isScalar([]));
        $this->assertFalse($this->checker->isScalar(new \stdClass()));
        $this->assertFalse($this->checker->isScalar(null));
    }

    public function testIsNullOnlyMatchesNull(): void
    {
        $this->assertTrue($this->checker->isNull(null));
        $this->assertFalse($this->checker->isNull(false));
        $this->assertFalse($this->checker->isNull(0));
        $this->assertFalse($this->checker->isNull(''));
    }
}
```

## Key technique: Trait visibility override

```php
new class {
    use TypeCheckerTrait {
        isArray as public;  // Override protected → public for testing
    }
};
```

This is the standard PHPUnit pattern for testing `protected` trait methods without creating a full concrete class.
