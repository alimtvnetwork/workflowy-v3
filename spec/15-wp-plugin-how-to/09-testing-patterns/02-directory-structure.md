# 9.2 Test Directory Structure

> **Parent:** [Phase 9 overview](./00-overview.md)

---

```
plugin-slug/
├── tests/
│   ├── bootstrap.php              ← Test bootstrap (loads autoloader, mocks ABSPATH)
│   ├── Unit/
│   │   ├── Enums/
│   │   │   ├── PluginConfigTypeTest.php
│   │   │   ├── HttpStatusTypeTest.php
│   │   │   ├── PhpNativeTypeTest.php
│   │   │   └── ResponseKeyTypeTest.php
│   │   ├── Helpers/
│   │   │   ├── EnvelopeBuilderTest.php
│   │   │   ├── DateHelperTest.php
│   │   │   └── PathHelperTest.php
│   │   ├── Traits/
│   │   │   ├── TypeCheckerTraitTest.php
│   │   │   └── ResponseTraitTest.php
│   │   └── Database/
│   │       └── DatabaseSeederTest.php
│   ├── Integration/
│   │   ├── Endpoints/
│   │   │   ├── StatusEndpointTest.php
│   │   │   └── UploadEndpointTest.php
│   │   └── Cron/
│   │       └── CronSchedulerTest.php
│   └── Fixtures/
│       ├── sample-upload.zip
│       ├── invalid-file.txt
│       └── seeds/                   ← Test seed fixtures
│           ├── manifest.json
│           └── settings.json
├── phpunit.xml
└── composer.json                  ← PHPUnit + wp-phpunit as dev deps
```
