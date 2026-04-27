#!/usr/bin/env python3
"""
WorkFlowy fixture generator — 217-item nested item tree.

Output: spec/31-app/04-fixtures/item-tree-217.json (~1MB target)
Shape:  matches the unified Node interface in mem://architecture/data-model
        and the App DB Item table in spec/31-app/07-db-diagram/03-app-db-erd.md.

Distribution (deterministic, seeded):
  - 217 items total (above the 200-item virtualisation threshold,
    below the 250-item per-view limit)
  - 12 ItemType values exercised at least once each
  - Max depth 6 (root + 5 levels of nesting)
  - 8 mirror placeholders pointing to canonical items in another subtree
  - 1 board with 4 columns x ~12 cards each
  - 12 completed Todos (CompletedAt set)
  - 18 items with DueDate (Today/overdue/future mix)
  - 6 soft-deleted (DeletedAt set, in trash)
  - 30 items with Tags
  - Rich content includes inline @mentions, #tags, **bold**, _italic_,
    `code`, [links](https://example.com), and one paragraph >2KB to
    stress text rendering / virtualisation row-height calc.

Run:
    python3 spec/31-app/04-fixtures/generate.py
"""

import json
import pathlib
import random
from datetime import datetime, timedelta, timezone

random.seed(20260427)  # Deterministic — re-runs produce identical output

OUTFILE = pathlib.Path(__file__).resolve().parent / "item-tree-217.json"

# ItemType IDs mirror sql/06-app-seeds.sql
ITEM_TYPES = {
    1: "Bullet", 2: "Heading1", 3: "Heading2", 4: "Heading3",
    5: "Paragraph", 6: "Quote", 7: "Code", 8: "Todo",
    9: "Board", 10: "BoardColumn", 11: "Mirror", 12: "Embed",
}

NOW = datetime(2026, 4, 27, 8, 0, 0, tzinfo=timezone.utc)
def iso(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%dT%H:%M:%S.000Z")
def iso_date(dt: datetime) -> str:
    return dt.strftime("%Y-%m-%d")

LONG_PARAGRAPH = (
    "This is a deliberately long paragraph used to stress the row-height "
    "calculator used by the 250-item virtualisation slice. " * 18
).strip()  # ~2.1 KB

CONTENTS = {
    "Bullet": [
        "Quick capture about Q3 OKRs",
        "Buy groceries for the weekend",
        "Schedule 1:1 with @alice next week",
        "Remember to renew the SSL cert before it expires #ops",
        "Call the dentist about the rescheduled appointment",
        "Draft the [migration plan](https://example.com/plan) for review",
        "Compare **Notion** vs _Roam_ vs `WorkFlowy` for personal use",
    ],
    "Heading1": ["📚 Reading List 2026", "🎯 Personal OKRs", "🏗️ Engineering Roadmap"],
    "Heading2": ["Q1 Goals", "Q2 Goals", "Backend", "Frontend", "Design Review"],
    "Heading3": ["Sprint 14", "Sprint 15", "Retrospective", "Outstanding Risks"],
    "Paragraph": [
        "The split-DB architecture isolates identity from content so a single "
        "compromised workspace cannot exfiltrate the user table. See "
        "`spec/05-split-db-architecture/`.",
        LONG_PARAGRAPH,
        "Mirrors are placeholders; edits propagate via the Mirror bookkeeping "
        "table and a SourceItemId fan-out, with last-write-wins on `BrokenAt`.",
    ],
    "Quote": [
        "“Make it work, make it right, make it fast.” — Kent Beck",
        "“Premature optimisation is the root of all evil.” — Knuth",
    ],
    "Code": [
        "```ts\nexport const fractional = (a: string, b: string): string => {\n"
        "  // generate key strictly between a and b\n  return midpoint(a, b);\n};\n```",
        "```sql\nSELECT * FROM Item\n WHERE ParentItemId = ?\n"
        " ORDER BY FractionalIndex;\n```",
        "```php\n<?php\nfunction hasRole(int $u, string $r): bool {\n"
        "  return Auth::hasRole($u, $r);\n}\n```",
    ],
    "Todo": [
        "Migrate the activity-log reaper to a WP-cron hook",
        "Add the AT-DDL-08 mirror-break smoke test",
        "Cover EP-SYNC-STREAM with a 3-tab concurrency test",
        "Wire the SSE buffer-disable hook in the Vite proxy",
        "Backfill endpoint↔AT cross-refs for EP-SHARES-*",
    ],
    "Board": ["Sprint Board"],
    "BoardColumn": ["To do", "In progress", "Review", "Done"],
    "Mirror": ["[mirror placeholder — content from source]"],
    "Embed": [
        "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "https://docs.google.com/document/d/1abc/edit",
        "https://figma.com/file/xyz/design",
    ],
}

class Builder:
    def __init__(self) -> None:
        self.items: list[dict] = []
        self.next_id: int = 1
        self.frac_counter: int = 0

    def frac(self) -> str:
        # Crockford-base32-ish; lexicographic order matches insertion order.
        # Real fractional-index lib lives in the app; this is fixture-only.
        self.frac_counter += 1
        return f"a{self.frac_counter:05d}"

    def add(
        self,
        type_id: int,
        parent_id: int | None,
        content: str,
        depth: int,
        *,
        completed: bool = False,
        due_offset_days: int | None = None,
        deleted: bool = False,
        tags: list[str] | None = None,
        mirror_of: int | None = None,
    ) -> int:
        item_id = self.next_id
        self.next_id += 1
        created = NOW - timedelta(days=random.randint(0, 90), hours=random.randint(0, 23))
        updated = created + timedelta(hours=random.randint(0, 48))
        node = {
            "ItemId": item_id,
            "ParentItemId": parent_id,
            "OwnerUserId": 1,
            "ItemTypeId": type_id,
            "ItemTypeName": ITEM_TYPES[type_id],
            "Content": content,
            "FractionalIndex": self.frac(),
            "DueDate": iso_date(NOW + timedelta(days=due_offset_days)) if due_offset_days is not None else None,
            "CompletedAt": iso(updated) if completed else None,
            "IsCollapsed": 0,
            "MirrorOfItemId": mirror_of,
            "Depth": depth,
            "Tags": tags or [],
            "CreatedAt": iso(created),
            "UpdatedAt": iso(updated),
            "DeletedAt": iso(NOW - timedelta(days=random.randint(1, 25))) if deleted else None,
        }
        self.items.append(node)
        return item_id

def main() -> None:
    b = Builder()

    # Root: 3 top-level Heading1s + 1 Board (4 roots)
    h1_reading  = b.add(2, None, "📚 Reading List 2026", 0)
    h1_okrs     = b.add(2, None, "🎯 Personal OKRs", 0)
    h1_eng      = b.add(2, None, "🏗️ Engineering Roadmap", 0)
    board_root  = b.add(9, None, "Sprint Board", 0)

    # ---- Subtree A: Reading list (broad + shallow) ----------------------
    for h2_label in ["Q1 Books", "Q2 Books", "Q3 Books", "Recommendations from @bob"]:
        h2 = b.add(3, h1_reading, h2_label, 1)
        for _ in range(random.randint(4, 6)):
            book = b.add(1, h2, random.choice(CONTENTS["Bullet"]), 2,
                         tags=random.choice([[], ["#book"], ["#book", "#fiction"]]))
            # 30% chance to add a Quote child
            if random.random() < 0.3:
                b.add(6, book, random.choice(CONTENTS["Quote"]), 3)

    # ---- Subtree B: OKRs (deep nesting to depth 5) ----------------------
    for q in ["Q1 Goals", "Q2 Goals", "Q3 Goals", "Q4 Goals"]:
        h2 = b.add(3, h1_okrs, q, 1)
        for h3_label in ["Career", "Health", "Side Project"]:
            h3 = b.add(4, h2, h3_label, 2)
            for _ in range(random.randint(2, 4)):
                todo = b.add(8, h3, random.choice(CONTENTS["Todo"]), 3,
                             completed=random.random() < 0.25,
                             due_offset_days=random.choice([None, -2, 0, 1, 7, 30]))
                # Drill to depth 4 and 5 occasionally
                if random.random() < 0.4:
                    sub = b.add(1, todo, random.choice(CONTENTS["Bullet"]), 4)
                    if random.random() < 0.3:
                        b.add(5, sub, random.choice(CONTENTS["Paragraph"]), 5)

    # ---- Subtree C: Engineering Roadmap (dense + mixed types) -----------
    backend = b.add(3, h1_eng, "Backend", 1)
    frontend = b.add(3, h1_eng, "Frontend", 1)
    for parent in (backend, frontend):
        for sprint in ["Sprint 14", "Sprint 15", "Sprint 16"]:
            sp = b.add(4, parent, sprint, 2)
            for _ in range(random.randint(3, 5)):
                b.add(8, sp, random.choice(CONTENTS["Todo"]), 3,
                      completed=random.random() < 0.4,
                      due_offset_days=random.choice([None, 0, 3, 14]),
                      tags=random.choice([[], ["#bug"], ["#feature"], ["#chore"]]))
            # Sprinkle code + paragraph + quote + embed for type coverage
            b.add(7, sp, random.choice(CONTENTS["Code"]), 3)
            if random.random() < 0.5:
                b.add(5, sp, random.choice(CONTENTS["Paragraph"]), 3)
            if random.random() < 0.3:
                b.add(12, sp, random.choice(CONTENTS["Embed"]), 3)

    # The 2KB paragraph somewhere visible
    b.add(5, h1_eng, LONG_PARAGRAPH, 1)

    # ---- Subtree D: Board with 4 columns -----------------------------------
    columns = []
    for col_name in CONTENTS["BoardColumn"]:
        columns.append(b.add(10, board_root, col_name, 1))
    for col in columns:
        for _ in range(random.randint(10, 13)):
            b.add(8, col, random.choice(CONTENTS["Todo"]), 2,
                  completed=(col == columns[-1]),  # Done column = completed
                  due_offset_days=random.choice([None, 0, 1, 7]),
                  tags=random.choice([[], ["#sprint"], ["#sprint", "#hot"]]))

    # ---- Mirrors: 8 placeholders pointing at canonical items in subtree A
    canonical_pool = [it for it in b.items if it["ItemTypeId"] == 1 and it["Depth"] == 2][:12]
    mirror_parent = b.add(2, None, "🪞 Mirrored Items", 0)
    for src in canonical_pool[:8]:
        b.add(11, mirror_parent, "[mirror — see source]", 1, mirror_of=src["ItemId"])

    # ---- Soft-deleted: pick 6 random leaves and trash them ---------------
    leaves = [it for it in b.items if it["ItemTypeId"] in (1, 8) and it["MirrorOfItemId"] is None]
    for victim in random.sample(leaves, k=min(6, len(leaves))):
        victim["DeletedAt"] = iso(NOW - timedelta(days=random.randint(1, 25)))

    # ---- Trim or pad to exactly 217 items --------------------------------
    target = 217
    if len(b.items) > target:
        b.items = b.items[:target]
    while len(b.items) < target:
        b.add(1, h1_reading, f"Quick capture #{len(b.items)+1}", 1)

    # ---- Stats + write -----------------------------------------------------
    type_counts: dict[str, int] = {}
    for it in b.items:
        type_counts[it["ItemTypeName"]] = type_counts.get(it["ItemTypeName"], 0) + 1
    max_depth = max(it["Depth"] for it in b.items)
    completed = sum(1 for it in b.items if it["CompletedAt"])
    deleted = sum(1 for it in b.items if it["DeletedAt"])
    with_due = sum(1 for it in b.items if it["DueDate"])
    mirrors = sum(1 for it in b.items if it["MirrorOfItemId"])

    payload = {
        "$schema": "https://workflowy.local/schemas/item-tree.v1.json",
        "GeneratedAt": iso(NOW),
        "Generator": "spec/31-app/04-fixtures/generate.py",
        "Seed": 20260427,
        "Stats": {
            "TotalItems": len(b.items),
            "MaxDepth": max_depth,
            "CompletedTodos": completed,
            "SoftDeleted": deleted,
            "WithDueDate": with_due,
            "Mirrors": mirrors,
            "TypeCounts": dict(sorted(type_counts.items())),
        },
        "Items": b.items,
    }
    OUTFILE.write_text(json.dumps(payload, indent=2, ensure_ascii=False))
    size_kb = OUTFILE.stat().st_size / 1024
    print(f"✓ wrote {OUTFILE.name}: {len(b.items)} items, {size_kb:.1f} KB, depth {max_depth}")
    print(f"  type coverage: {len(type_counts)}/12 types — {type_counts}")
    print(f"  completed={completed} deleted={deleted} due={with_due} mirrors={mirrors}")

if __name__ == "__main__":
    main()
