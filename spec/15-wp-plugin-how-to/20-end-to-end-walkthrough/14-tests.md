# 20.14 Step 13 — Tests

> **Parent:** [Phase 20 overview](./00-overview.md)  
> **Phase 9, §9.1–§9.3** — Unit tests run without WordPress.

---

## 13a. Test bootstrap

**File: `tests/bootstrap.php`**

```php
<?php
// Mock ABSPATH so includes load
define('ABSPATH', '/tmp/wordpress/');

// Load autoloader
require_once __DIR__ . '/../includes/Autoloader.php';
```

## 13b. Enum test

**File: `tests/Unit/Enums/TaskStatusTypeTest.php`**

```php
<?php
namespace TaskTracker\Tests\Unit\Enums;

use PHPUnit\Framework\TestCase;
use TaskTracker\Enums\TaskStatusType;

final class TaskStatusTypeTest extends TestCase
{
    public function testPendingValueIsCorrect(): void
    {
        $this->assertSame('pending', TaskStatusType::Pending->value);
    }

    public function testDoneValueIsCorrect(): void
    {
        $this->assertSame('done', TaskStatusType::Done->value);
    }

    public function testLabelReturnsHumanReadable(): void
    {
        $this->assertSame('Pending', TaskStatusType::Pending->label());
        $this->assertSame('Done', TaskStatusType::Done->label());
    }

    public function testCssClassReturnsBadgeClass(): void
    {
        $this->assertSame('badge--warning', TaskStatusType::Pending->cssClass());
        $this->assertSame('badge--success', TaskStatusType::Done->cssClass());
    }

    public function testIsPendingReturnsCorrectly(): void
    {
        $this->assertTrue(TaskStatusType::Pending->isPending());
        $this->assertFalse(TaskStatusType::Done->isPending());
    }

    public function testTryFromReturnsNullForInvalidValue(): void
    {
        $result = TaskStatusType::tryFrom('invalid');

        $this->assertNull($result);
    }

    public function testIsEqualComparison(): void
    {
        $this->assertTrue(TaskStatusType::Pending->isEqual(TaskStatusType::Pending));
        $this->assertFalse(TaskStatusType::Pending->isEqual(TaskStatusType::Done));
    }

    public function testIsAnyOfComparison(): void
    {
        $result = TaskStatusType::Pending->isAnyOf(
            TaskStatusType::Pending,
            TaskStatusType::Done,
        );

        $this->assertTrue($result);
    }
}
```
