# CI Workflows — GitHub Actions, GitLab CI & Mono-Repo

> **Parent:** [09-ci-pipeline-quality-gate overview](./00-overview.md)

---

## 5. Reference GitHub Actions Workflow

```yaml
# .github/workflows/quality-gate.yml
name: Quality Gate

on:
  pull_request:
    branches: [main, develop]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Required for SonarQube

      # ── Stage 1: Format ──
      - name: Format check
        run: |
          # Replace with language-specific command from §3

      # ── Stage 2: Lint ──
      - name: Lint check
        run: |
          # Replace with language-specific command from §3

      # ── Stage 3: Type check ──
      - name: Type check
        run: |
          # Replace with language-specific command from §3

      # ── Stage 4: Test + Coverage ──
      - name: Test with coverage
        run: |
          # Replace with language-specific command from §3

      # ── Stage 5: SonarQube ──
      - name: SonarQube scan
        uses: SonarSource/sonarqube-scan-action@v3
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
          SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}

      - name: SonarQube quality gate
        uses: SonarSource/sonarqube-quality-gate-action@v1
        timeout-minutes: 5
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

---

## 6. Reference GitLab CI Configuration

```yaml
# .gitlab-ci.yml
stages:
  - format
  - lint
  - type-check
  - test
  - sonar

format:
  stage: format
  script:
    # Replace with language-specific command from §3

lint:
  stage: lint
  script:
    # Replace with language-specific command from §3

type-check:
  stage: type-check
  script:
    # Replace with language-specific command from §3

test:
  stage: test
  script:
    # Replace with language-specific command from §3
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage.xml

sonar:
  stage: sonar
  image: sonarsource/sonar-scanner-cli:latest
  variables:
    SONAR_USER_HOME: "${CI_PROJECT_DIR}/.sonar"
  cache:
    key: sonar
    paths:
      - .sonar/cache
  script:
    - sonar-scanner
  allow_failure: false
```

---

## 7. Mono-Repo Strategy

For repositories containing multiple languages, run language-specific checks in **parallel jobs**:

```yaml
# GitHub Actions — mono-repo
jobs:
  typescript:
    runs-on: ubuntu-latest
    steps:
      - run: npx eslint packages/frontend/ --max-warnings 0
      - run: npx tsc --noEmit --strict -p packages/frontend/tsconfig.json
      - run: npx vitest run --coverage --project packages/frontend

  go:
    runs-on: ubuntu-latest
    steps:
      - run: cd packages/api && golangci-lint run --timeout 5m
      - run: cd packages/api && go test -race -coverprofile=coverage.out ./...

  python:
    runs-on: ubuntu-latest
    steps:
      - run: ruff check packages/ml/ --output-format=github
      - run: mypy packages/ml/ --strict
      - run: cd packages/ml && pytest --cov --cov-report=xml

  sonar:
    needs: [typescript, go, python]
    runs-on: ubuntu-latest
    steps:
      - uses: SonarSource/sonarqube-scan-action@v3
```

---

## Related

- [`00-overview.md`](./00-overview.md) — Parent overview
- [`03-language-commands.md`](./03-language-commands.md) — Language commands
- [`04-sonarqube-config.md`](./04-sonarqube-config.md) — SonarQube config
- [`06-exemptions-and-checklist.md`](./06-exemptions-and-checklist.md) — Exemptions

---

*CI workflows v3.2.0 — 2026-04-20*
