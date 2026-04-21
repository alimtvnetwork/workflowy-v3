# 5. Tagging

> **Parent:** [00-overview.md](./00-overview.md)

After version resolution, the release system:

1. **Verifies** the tag does not already exist locally or remotely.
2. **Creates** a lightweight Git tag at `HEAD`.
3. **Pushes** the tag to the remote.

## Tag Verification — Bash

```bash
verify_tag_available() {
    local tag="$1"

    # Check local tags
    if git tag -l "$tag" | grep -q "$tag"; then
        echo "::error::Tag $tag already exists locally"
        exit 1
    fi

    # Check remote tags
    if git ls-remote --tags origin "$tag" | grep -q "$tag"; then
        echo "::error::Tag $tag already exists on remote"
        exit 1
    fi

    echo "✅ Tag $tag is available"
}

create_and_push_tag() {
    local tag="$1"

    verify_tag_available "$tag"

    git tag "$tag"

    if ! git push origin "$tag"; then
        echo "::error::Failed to push tag $tag — cleaning up"
        git tag -d "$tag"
        exit 1
    fi

    echo "✅ Tag $tag pushed successfully"
}

# Usage:
# create_and_push_tag "v1.3.0"
```

## Tag Verification — Go

```go
import (
    "fmt"
    "os/exec"
    "strings"
)

// VerifyTagAvailable checks that a tag does not exist locally or remotely.
func VerifyTagAvailable(tag string) error {
    // Check local
    out, _ := exec.Command("git", "tag", "-l", tag).Output()
    if strings.TrimSpace(string(out)) == tag {
        return fmt.Errorf("tag %s already exists locally", tag)
    }

    // Check remote
    out, _ = exec.Command("git", "ls-remote", "--tags", "origin", tag).Output()
    if strings.Contains(string(out), tag) {
        return fmt.Errorf("tag %s already exists on remote", tag)
    }

    return nil
}

// CreateAndPushTag creates a lightweight tag and pushes it.
// On push failure, the local tag is deleted to prevent stale state.
func CreateAndPushTag(tag string) error {
    if err := VerifyTagAvailable(tag); err != nil {
        return err
    }

    if err := exec.Command("git", "tag", tag).Run(); err != nil {
        return fmt.Errorf("create tag %s: %w", tag, err)
    }

    if err := exec.Command("git", "push", "origin", tag).Run(); err != nil {
        // Cleanup: remove local tag on push failure
        _ = exec.Command("git", "tag", "-d", tag).Run()
        return fmt.Errorf("push tag %s: %w", tag, err)
    }

    return nil
}
```
