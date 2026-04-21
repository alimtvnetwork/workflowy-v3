# 20.11 Step 10 — Feature Handler Traits

> **Parent:** [Phase 20 overview](./00-overview.md)  
> **Phase 3, §3.3** — Trait anatomy: public handler wraps `safeExecute`, private method has logic.  
> **Phase 6** — Validation guard clauses at top of every handler.

---

## 10a. TaskCreateTrait — POST /tasks

**File: `includes/Traits/Task/TaskCreateTrait.php`**

```php
<?php
namespace TaskTracker\Traits\Task;

if (!defined('ABSPATH')) {
    exit;
}

use Throwable;
use WP_REST_Request;
use WP_REST_Response;
use TaskTracker\Enums\TaskStatusType;
use TaskTracker\Helpers\EnvelopeBuilder;

trait TaskCreateTrait
{
    /**
     * Handle POST /tasks — Create a new task.
     */
    public function handleCreateTask(WP_REST_Request $request): WP_REST_Response
    {
        return $this->safeExecute(
            fn() => $this->executeCreateTask($request),
            'create-task',
        );
    }

    private function executeCreateTask(WP_REST_Request $request): WP_REST_Response
    {
        // ── Validate body ──
        $body = $request->get_json_params();
        $hasBody = ($body !== null && $this->isArray($body));

        if (!$hasBody) {
            return $this->validationError('Request body must be a JSON object', $request);
        }

        // ── Validate required: title ──
        $title = $body['title'] ?? null;
        $hasTitle = ($title !== null && $this->isString($title));

        if (!$hasTitle) {
            return $this->validationError('Missing required field: title', $request);
        }

        $titleLength = mb_strlen($title);
        $isTitleTooLong = ($titleLength > 200);

        if ($isTitleTooLong) {
            return $this->validationError(
                'Field "title" must not exceed 200 characters',
                $request,
            );
        }

        // ── Validate optional: priority ──
        $priority = $body['priority'] ?? null;
        $hasPriority = ($priority !== null);

        if ($hasPriority) {
            $isPriorityValid = $this->isInteger($priority);

            if (!$isPriorityValid) {
                return $this->validationError(
                    'Field "priority" must be an integer',
                    $request,
                );
            }
        }

        // ── Sanitise ──
        $sanitisedTitle = sanitize_text_field($title);
        $resolvedPriority = $hasPriority ? absint($priority) : 0;

        // ── Insert ──
        $pdo = $this->getDatabase();
        $stmt = $pdo->prepare(
            'INSERT INTO tasks (Title, Priority, Status) VALUES (:title, :priority, :status)'
        );
        $stmt->execute([
            ':title'    => $sanitisedTitle,
            ':priority' => $resolvedPriority,
            ':status'   => TaskStatusType::Pending->value,
        ]);

        $taskId = (int) $pdo->lastInsertId();

        $this->fileLogger->info('Task created', [
            'taskId'   => $taskId,
            'title'    => $sanitisedTitle,
            'priority' => $resolvedPriority,
        ]);

        return EnvelopeBuilder::success('Task created', 201)
            ->setRequestedAt($request->get_route())
            ->setSingleResult([
                'Id'       => $taskId,
                'Title'    => $sanitisedTitle,
                'Priority' => $resolvedPriority,
                'Status'   => TaskStatusType::Pending->value,
            ])
            ->toResponse();
    }
}
```

### Validation checklist applied (Phase 6, §6.8)

- [x] Body validated as array
- [x] Required `title` has `$hasTitle` guard
- [x] String length enforced (200 chars)
- [x] Optional `priority` type-checked with `TypeCheckerTrait`
- [x] Sanitisation after validation (`sanitize_text_field`)
- [x] Uses `$this->validationError()`, not `EnvelopeBuilder::error()` directly
- [x] Enum value for status, no magic string

## 10b. TaskListTrait — GET /tasks

**File: `includes/Traits/Task/TaskListTrait.php`**

```php
<?php
namespace TaskTracker\Traits\Task;

if (!defined('ABSPATH')) {
    exit;
}

use WP_REST_Request;
use WP_REST_Response;
use TaskTracker\Helpers\EnvelopeBuilder;

trait TaskListTrait
{
    public function handleListTasks(WP_REST_Request $request): WP_REST_Response
    {
        return $this->safeExecute(
            fn() => $this->executeListTasks($request),
            'list-tasks',
        );
    }

    private function executeListTasks(WP_REST_Request $request): WP_REST_Response
    {
        // ── Pagination (silent defaults allowed per Phase 6, §6.5) ──
        $page = $request->get_param('page');
        $perPage = $request->get_param('per_page');

        $resolvedPage = ($page !== null && $this->isNumeric($page))
            ? max(1, absint($page))
            : 1;
        $resolvedPerPage = ($perPage !== null && $this->isNumeric($perPage))
            ? min(100, max(1, absint($perPage)))
            : 20;

        $offset = ($resolvedPage - 1) * $resolvedPerPage;

        // ── Query ──
        $pdo = $this->getDatabase();

        $countStmt = $pdo->query('SELECT COUNT(*) FROM tasks');
        $totalRecords = (int) $countStmt->fetchColumn();

        $stmt = $pdo->prepare(
            'SELECT Id, Title, Priority, Status, CreatedAt, UpdatedAt
             FROM tasks
             ORDER BY CreatedAt DESC
             LIMIT :limit OFFSET :offset'
        );
        $stmt->bindValue(':limit', $resolvedPerPage, \PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, \PDO::PARAM_INT);
        $stmt->execute();

        $tasks = $stmt->fetchAll(\PDO::FETCH_ASSOC);

        return EnvelopeBuilder::success()
            ->setRequestedAt($request->get_route())
            ->setListResult($tasks)
            ->toResponse();
    }
}
```

## 10c. TaskCompleteTrait — POST /tasks/complete

**File: `includes/Traits/Task/TaskCompleteTrait.php`**

```php
<?php
namespace TaskTracker\Traits\Task;

if (!defined('ABSPATH')) {
    exit;
}

use WP_REST_Request;
use WP_REST_Response;
use TaskTracker\Enums\TaskStatusType;
use TaskTracker\Helpers\EnvelopeBuilder;

trait TaskCompleteTrait
{
    public function handleCompleteTask(WP_REST_Request $request): WP_REST_Response
    {
        return $this->safeExecute(
            fn() => $this->executeCompleteTask($request),
            'complete-task',
        );
    }

    private function executeCompleteTask(WP_REST_Request $request): WP_REST_Response
    {
        // ── Validate ──
        $body = $request->get_json_params();
        $hasBody = ($body !== null && $this->isArray($body));

        if (!$hasBody) {
            return $this->validationError('Request body must be a JSON object', $request);
        }

        $taskId = $body['task_id'] ?? null;
        $hasTaskId = ($taskId !== null && $this->isInteger($taskId));

        if (!$hasTaskId) {
            return $this->validationError('Missing required field: task_id (integer)', $request);
        }

        // ── Update ──
        $pdo = $this->getDatabase();
        $stmt = $pdo->prepare(
            "UPDATE tasks SET Status = :status, UpdatedAt = datetime('now') WHERE Id = :id"
        );
        $stmt->execute([
            ':status' => TaskStatusType::Done->value,
            ':id'     => absint($taskId),
        ]);

        $affectedRows = $stmt->rowCount();
        $hasMatch = ($affectedRows > 0);

        if (!$hasMatch) {
            return EnvelopeBuilder::error('Task not found', 404)
                ->setRequestedAt($request->get_route())
                ->toResponse();
        }

        $this->fileLogger->info('Task completed', ['taskId' => $taskId]);

        return EnvelopeBuilder::success('Task marked as done')
            ->setRequestedAt($request->get_route())
            ->setSingleResult(['Id' => $taskId, 'Status' => TaskStatusType::Done->value])
            ->toResponse();
    }
}
```
