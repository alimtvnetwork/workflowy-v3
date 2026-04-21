# Section 4 — Tree View

> **Parent:** [00-overview.md](00-overview.md)

Hierarchical data rendered as a Unicode tree. Used for folder structures,
dependency graphs, category hierarchies, or any parent-child relationship.

## Format

```
  ■ Folder Structure
  ──────────────────────────────────────────

  ├── 📦 agent-experiment (main)
  ├── 📦 atto-property (dev)
  ├── 📁 auk-go
  │   ├── 📦 core-v7 (feature/1.5.6)
  │   ├── 📦 enum (main)
  │   └── 📦 zipper (develop)
  ├── 📦 category-forge (main)
  └── 📦 wp-upload-test-v1 (main)
```

## Tree Characters

| Character | Usage |
|-----------|-------|
| `├──` | Non-last child at current level |
| `└──` | Last child at current level |
| `│   ` | Continuation line from a parent that has more children |
| `    ` | Continuation line from a parent that was the last child |

## Emoji in Trees

| Emoji | Meaning |
|-------|---------|
| `📦` | Leaf item (repo, package, file) |
| `📁` | Container/folder (has children, is not itself a leaf) |
| `📄` | Document/file artifact |
| `🎬` | Media item |
| `📡` | Network/service item |

## Rules

| Rule | Detail |
|------|--------|
| Depth limit | Maximum 4 levels deep — flatten beyond that |
| Sorting | Folders first, then items, both alphabetically |
| Emoji | Containers use `📁`, leaves use the domain emoji |
| Status | Shown in parentheses after the name, same as item list |
| No detail line | Trees show identity only — no second line |

## Generic Examples

**Category hierarchy (movies):**
```
  ├── 📁 Action
  │   ├── 🎬 Die Hard (1988)
  │   ├── 🎬 Mad Max: Fury Road (2015)
  │   └── 🎬 The Dark Knight (2008)
  ├── 📁 Sci-Fi
  │   ├── 🎬 Blade Runner (1982)
  │   └── 🎬 Interstellar (2014)
  └── 📁 Comedy
      ├── 🎬 Groundhog Day (1993)
      └── 🎬 The Grand Budapest Hotel (2014)
```

**Dependency tree (packages):**
```
  ├── 📦 express (4.18.2)
  │   ├── 📦 body-parser (1.20.2)
  │   ├── 📦 cookie (0.6.0)
  │   └── 📦 path-to-regexp (0.1.7)
  └── 📦 react (18.2.0)
      ├── 📦 react-dom (18.2.0)
      └── 📦 scheduler (0.23.0)
```

## Implementation

```go
type TreeNode struct {
    Name     string
    Status   string
    Emoji    string
    Children []TreeNode
}

func printTree(nodes []TreeNode, prefix string) {
    for i, node := range nodes {
        isLast := i == len(nodes)-1
        connector := "├── "
        if isLast {
            connector = "└── "
        }

        fmt.Fprintf(os.Stderr, "  %s%s%s %s (%s)\n",
            prefix, connector, node.Emoji, node.Name, node.Status)

        if len(node.Children) > 0 {
            childPrefix := prefix + "│   "
            if isLast {
                childPrefix = prefix + "    "
            }
            printTree(node.Children, childPrefix)
        }
    }
}
```
