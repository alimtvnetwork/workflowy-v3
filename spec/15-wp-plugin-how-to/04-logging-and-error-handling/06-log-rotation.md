# 4.6 Log Rotation

> **Parent:** [Phase 4 overview](./00-overview.md)

---

The FileLogger automatically rotates log files when they exceed a size threshold.

| Setting | Default | Range |
|---------|---------|-------|
| Max file size | 512 KB | 64 KB – 10 MB |
| Max rotations | 10 | 1 – 100 |

## Rotation process

1. Before each write, check if the target file exceeds `maxLogSizeBytes`
2. If yes, move the file to `logs/archive/{NNN}/{filename}` where NNN is a zero-padded sequential index
3. If archive folder count reaches `maxRotations`, delete the oldest folders first
4. The current file is now empty and ready for new writes

## Archive structure

```
logs/
├── info.log           ← current
├── error.log          ← current
├── stacktrace.log     ← current
└── archive/
    ├── 001/
    │   ├── info.log
    │   └── error.log
    ├── 002/
    │   └── info.log
    └── 003/
        └── stacktrace.log
```
