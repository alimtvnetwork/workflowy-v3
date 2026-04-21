# 9.10 Testing Data Providers — Edge Case Coverage

> **Parent:** [Phase 9 overview](./00-overview.md)

---

Use PHPUnit data providers to test boundary conditions systematically:

```php
/**
 * @dataProvider edgeCaseInputProvider
 */
public function testIsArrayEdgeCases(mixed $input, bool $expected): void
{
    $this->assertSame($expected, $this->checker->isArray($input));
}

/**
 * @return array<string, array{mixed, bool}>
 */
public static function edgeCaseInputProvider(): array
{
    return [
        'empty array'           => [[], true],
        'indexed array'         => [[1, 2, 3], true],
        'associative array'     => [['key' => 'val'], true],
        'nested array'          => [[[]], true],
        'string "array"'        => ['array', false],
        'integer zero'          => [0, false],
        'boolean false'         => [false, false],
        'null'                  => [null, false],
        'empty string'          => ['', false],
        'stdClass object'       => [new \stdClass(), false],
        'ArrayObject'           => [new \ArrayObject(), false],  // Important: not a native array!
    ];
}
```

## Critical edge case: `ArrayObject` is not an array

`gettype(new ArrayObject()) === 'object'` — this catches a common mistake where code assumes array-like objects are arrays. The TypeCheckerTrait correctly rejects them.
