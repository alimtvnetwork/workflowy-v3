# PostStatusType — WordPress Post Statuses

> **Parent:** [00-overview.md](00-overview.md)

```php
enum PostStatusType: string
{
    case Publish = 'publish';
    case Draft   = 'draft';
    case Pending = 'pending';

    public function isEqual(self $other): bool { return $this === $other; }

    public function isPublic(): bool { return $this->isEqual(self::Publish); }

    public static function validValues(): array
    {
        return array_map(fn(self $case) => $case->value, self::cases());
    }
}
```
