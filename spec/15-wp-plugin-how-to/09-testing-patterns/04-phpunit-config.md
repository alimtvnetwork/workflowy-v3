# 9.4 PHPUnit Configuration — `phpunit.xml`

> **Parent:** [Phase 9 overview](./00-overview.md)

---

```xml
<?xml version="1.0" encoding="UTF-8"?>
<phpunit
    bootstrap="tests/bootstrap.php"
    colors="true"
    stopOnFailure="false"
    cacheDirectory=".phpunit.cache"
>
    <testsuites>
        <testsuite name="Unit">
            <directory>tests/Unit</directory>
        </testsuite>
        <testsuite name="Integration">
            <directory>tests/Integration</directory>
        </testsuite>
    </testsuites>

    <source>
        <include>
            <directory>includes</directory>
        </include>
        <exclude>
            <file>includes/Autoloader.php</file>
        </exclude>
    </source>
</phpunit>
```

Run unit tests only: `vendor/bin/phpunit --testsuite Unit`  
Run everything: `vendor/bin/phpunit`
