# Full Examples

> **Parent:** [00-overview.md](00-overview.md)

## Generic Domain — Movie Collection

```
  ╔══════════════════════════════════════╗
  ║          moviecli v3.2.1             ║
  ╚══════════════════════════════════════╝

  ✓ Found 6 movies

  ■ Movies
  ──────────────────────────────────────────

  1/6 🎬 The Matrix (1999)
      └─ Genre: Sci-Fi | Rating: 8.7 | Runtime: 136m

  2/6 🎬 Inception (2010)
      └─ Genre: Sci-Fi | Rating: 8.8 | Runtime: 148m

  3/6 🎬 The Grand Budapest Hotel (2014)
      └─ Genre: Comedy | Rating: 8.1 | Runtime: 99m

  4/6 🎬 Parasite (2019)
      └─ Genre: Thriller | Rating: 8.5 | Runtime: 132m

  5/6 🎬 Everything Everywhere All at Once (2022)
      └─ Genre: Sci-Fi | Rating: 7.8 | Runtime: 139m

  6/6 🎬 Dune: Part Two (2024)
      └─ Genre: Sci-Fi | Rating: 8.6 | Runtime: 166m

  ■ By Genre
  ──────────────────────────────────────────

  ├── 📁 Comedy
  │   └── 🎬 The Grand Budapest Hotel (2014)
  ├── 📁 Sci-Fi
  │   ├── 🎬 Dune: Part Two (2024)
  │   ├── 🎬 Everything Everywhere All at Once (2022)
  │   ├── 🎬 Inception (2010)
  │   └── 🎬 The Matrix (1999)
  └── 📁 Thriller
      └── 🎬 Parasite (2019)

  ■ Output Files
  ──────────────────────────────────────────

  📁 ~/.moviecli/output/
  ├── 📄 movies.csv  Movie data in CSV
  ├── 📄 movies.json  Movie data in JSON
  └── 📄 watchlist.md  Formatted watchlist

  ■ What You Can Do Next
  ──────────────────────────────────────────

  1. Browse your collection:
     moviecli list --sort rating

  2. Get recommendations:
     moviecli recommend --genre sci-fi

  3. Export for sharing:
     moviecli export --format markdown > my-movies.md

CSV written to /home/user/.moviecli/output/movies.csv
JSON written to /home/user/.moviecli/output/movies.json
Watchlist written to /home/user/.moviecli/output/watchlist.md
Database updated: 6 movies upserted
```

## Server Inventory

```
  ╔══════════════════════════════════════╗
  ║          infra-scan v1.4.0           ║
  ╚══════════════════════════════════════╝

  ✓ Discovered 4 servers

  ■ Servers
  ──────────────────────────────────────────

  1/4 📡 api-prod-us (online)
      └─ 10.0.1.42:8080 | CPU: 23% | Mem: 4.2/8GB | Uptime: 14d

  2/4 📡 api-prod-eu (online)
      └─ 10.0.2.18:8080 | CPU: 45% | Mem: 6.1/8GB | Uptime: 7d

  3/4 📡 api-staging (maintenance)
      └─ 10.0.3.5:8080 | CPU: 0% | Mem: 1.2/8GB | Uptime: 0d

  4/4 📡 worker-batch (online)
      └─ 10.0.4.22:9090 | CPU: 87% | Mem: 7.8/8GB | Uptime: 3d

  ■ By Region
  ──────────────────────────────────────────

  ├── 📁 US East
  │   └── 📡 api-prod-us (online)
  ├── 📁 EU West
  │   └── 📡 api-prod-eu (online)
  └── 📁 Staging
      ├── 📡 api-staging (maintenance)
      └── 📡 worker-batch (online)

  ■ Output Files
  ──────────────────────────────────────────

  📁 /etc/infra-scan/output/
  ├── 📄 inventory.csv  Server data in CSV
  ├── 📄 inventory.json  Machine-readable inventory
  └── 📄 health-report.md  Status summary

  ■ Next Steps
  ──────────────────────────────────────────

  1. Check unhealthy servers:
     infra-scan status --filter unhealthy

  2. Run diagnostics:
     infra-scan diagnose api-staging

  3. Export for monitoring:
     infra-scan export --format prometheus > targets.yml

Inventory written to /etc/infra-scan/output/inventory.csv
JSON written to /etc/infra-scan/output/inventory.json
Report written to /etc/infra-scan/output/health-report.md
Database updated: 4 servers upserted
```
