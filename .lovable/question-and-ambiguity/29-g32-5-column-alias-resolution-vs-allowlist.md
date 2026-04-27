# 29 — G-32.5 column-alias resolution vs PARITY_EXEMPT

**Date:** 2026-04-27
**Context:** F-future-G32d added G-32.5 column / predicate parity. On first
run the gate caught `IdxMirrorMember_MirrorGroupId` because the doc row
references `MirrorPeerGroupId` (prose alias) while the DDL declares
`MirrorGroupId`. Two ways to resolve: allow-list the divergence, or
extend the runner to consult the §Naming Bridge column-alias table.

## Decision

Built `collectColumnAliasMap()` and use it inside `checkParity()` —
column matches now accept either the DDL name or its registered prose
alias. Same pattern as the existing index-alias resolution (G-32.3).

The bridge already documents `MirrorGroupId ↔ MirrorPeerGroupId` (and
several PK aliases like `MirrorMemberId ↔ MirrorPeerGroupMemberId`);
making the runner read that table avoids drift between "the bridge says
they're aliases" and "the gate says they're a violation".

## Why not PARITY_EXEMPT

PARITY_EXEMPT exists for **un-aliasable** divergences (e.g. doc
deliberately paraphrases a complex predicate). Using it for documented
aliases would force every future column rename to update both the
bridge AND the allow-list — twice the maintenance, twice the drift
surface.

## Trade-off

The §Naming Bridge column-alias regex
(`/\|\s*`([A-Z]\w+)\.(\w+)`[^|]*\|\s*`([A-Z]\w+)\.(\w+)`/g`) only
recognises `Table.Col` shaped cells. Index-alias rows (no dot) are
handled by `collectIndexAliasMap()`. Free-prose aliases ("the LWW
column" → `UpdatedAt`) are not auto-resolved — those would need
PARITY_EXEMPT.

## Future option (no slot allocated)

Could extend the bridge regex to also accept bare-column rows
(e.g. `| `OldName` | `NewName` |`) for pre-1.0 column renames that
don't carry a table prefix. Not needed today — the only column
aliases in the bridge are FK columns, which always carry the
`Table.Col` form.
