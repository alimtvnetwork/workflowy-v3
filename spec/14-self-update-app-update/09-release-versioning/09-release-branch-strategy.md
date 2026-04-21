# 9. Release Branch Strategy

> **Parent:** [00-overview.md](./00-overview.md)

For release preparation:

```
main → release/1.2.0 → tag v1.2.0 → merge back to main
```

1. Create `release/1.2.0` branch from `main`.
2. Bump version, update changelog on the branch.
3. Push the branch — CI runs tests.
4. Tag the branch head as `v1.2.0`.
5. CI publishes the release.
6. Merge back to `main`.

## Rollback

If the release push fails:
1. Switch back to the original branch.
2. Force-delete the local release branch.
3. Delete the local tag.

```bash
git checkout main
git branch -D release/1.2.0
git tag -d v1.2.0
```
