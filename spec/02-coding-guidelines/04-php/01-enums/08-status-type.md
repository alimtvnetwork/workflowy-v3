# StatusType — Transaction Result Status

> **Parent:** [00-overview.md](00-overview.md)

```php
enum StatusType: string
{
    case Success = 'success';
    case Failed  = 'failed';

    public function isEqual(self $other): bool { return $this === $other; }

    public function isSuccess(): bool { return $this->isEqual(self::Success); }
    public function isFailed(): bool  { return $this->isEqual(self::Failed); }
}
```
