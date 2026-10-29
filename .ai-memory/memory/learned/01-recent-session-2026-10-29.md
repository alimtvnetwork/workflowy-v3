# Recent session — 2026-10-29

This note records what was created and shipped on 2026-10-29. Paths below are relative git paths.

## go-email-reader

- Specifications for warm-up sequences 08 through 13 are in `02-spec/21-app/08-ui-and-warm-up-algorithm-improvements/` through `02-spec/21-app/13-ui-and-warm-up-algorithm-improvements/`.
- Plans are in `.ai-memory/plans/pending/08-ui-and-warm-up-algorithm-improvements.md` through `.ai-memory/plans/pending/13-ui-and-warm-up-algorithm-improvements.md`.
- Sequence 08 is the connector and gate map. Sequence 09 is brakes. Sequence 10 is the send lease and cool-down. Sequence 11 is the shadow compare. Sequence 12 is the pace envelope. Sequence 13 is the shared quiet window.
- The live tick now consults `internal/warmup/gatefeed.go`. A peer can tighten the remaining-send cap and cannot raise it. An absent or stale peer does not stop local warm-up. Local quiet hours hold. A quiet skip does not send. A dry run does not spend the cap. The gate order is health, cadence, connector, theme.
- The reader UI gate map reads `GET /api/warmup/gates`.
- Commit `f3864ee` is on `main` and is pushed. The remote uses SSH.
- Sequences 08 through 13 stay pending as catalogs. Only the gate engine is implemented.
- `user.email` is `local@gitmap`. The name is `gitmap automation`.

## gitmap-v28

- Cursor-like IDE setup landed in `cli/cmdide/ide_setup.go`, `cli/cmdide/setup/`, and `cli/cmdui/ui_server_ide_setup.go`.
- The spec is `02-spec/21-app/352-cursor-like-ide-setup-from-gitmap/`.
- Pushed commits include `3229df9b4`, `864012968`, and `04690b952`.
- `cli/cov` is a coverage profile and was not committed.

## repo-cache

- Commit `f474298` stores heatmap databases, including `.heatmap/06-cursor/go-email-reader/heatmap.db`.
- SQLite `-shm` and `-wal` sidecars were not committed.

## Push denied

These local commits are still unpushed because GitHub denied `alimtvnetwork`:

- `alim.karim.profile` (19 commits)
- `kubernetes-training-v1` (19 commits)
- `common-linux-installer` (1 commit)

## Rules learned

- Do not put a personal access token in a git remote URL. Use SSH.
- Do not commit coverage profiles or SQLite sidecar files.

## Last 30 commits in this repo

```text
f595711e docs(memory) - record the 2026-10-29 warm-up and git session.
874a310d chore(version) - bump to v0.37.53
9c6709bf feat(sync) - sync canonical v6 execute suite, gitmap heatmap telemetry, skills, and prompts (29-Oct-26 06:33 pm)
b7039271 chore(version) - bump to v0.37.52
fc3b0f79 feat(sync) - sync canonical v6 execute suite, gitmap heatmap telemetry, skills, and prompts (29-Oct-26 04:25 pm)
e25cd885 chore(version) - bump to v0.37.51
c575d310 feat(sync) - sync canonical v6 execute suite, gitmap heatmap telemetry, skills, and prompts (29-Oct-26 03:18 pm)
152af21b chore(version) - bump to v0.37.50
3487ec08 feat(sync) - sync canonical v6 execute suite, gitmap heatmap telemetry, skills, and prompts (29-Oct-26 02:55 pm)
6e808375 chore(version) - bump to v0.37.49
eb90e3d8 feat(sync) - sync canonical v6 execute suite, gitmap heatmap telemetry, skills, and prompts (28-Oct-26 10:19 am)
f0889e64 chore(version) - bump to v0.37.48
735139dc feat(sync) - sync canonical v6 execute suite, gitmap heatmap telemetry, skills, and prompts
08d4340b chore(version) - bump to v0.37.47
8368dcfb feat(sync) - sync canonical v6 execute suite, gitmap heatmap telemetry, skills, and prompts
29245d00 chore(version): bump to v0.37.46
393e7e7f feat(sync): sync canonical prompts, skills, gitmap agent standards, and purge deprecated 46 task manager
ab3cbe50 chore(version): bump to v0.37.45
e951cc73 feat(sync): sync canonical prompts, skills, gitmap agent standards, and purge deprecated 46 task manager
2cd4fdba chore(version): bump to v0.37.44
754bce38 feat(sync): sync canonical prompts, skills, gitmap agent standards, and purge deprecated 46 task manager
f6737251 chore(version): bump to v0.37.43
e102ffcb feat(sync): sync canonical prompts, skills, gitmap agent standards, and purge deprecated 46 task manager
bf28ca7b chore(version): bump to v0.37.42
f08a5675 feat(sync): sync canonical prompts, skills, gitmap agent standards, and purge deprecated 46 task manager
abc304fc chore(version) - bump to v0.37.41
f4f86329 feat(sync) - sync canonical v6 execute suite, gitmap heatmap telemetry, skills, and prompts
4bf76c7c chore(version): bump to v0.37.40
d0443023 feat(sync): sync canonical prompts, skills, gitmap agent standards, and purge deprecated 46 task manager
4f685ece chore(version) - bump to v0.37.39
```
