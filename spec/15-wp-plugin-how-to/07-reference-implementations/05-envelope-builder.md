# 7.5 EnvelopeBuilder — `includes/Helpers/EnvelopeBuilder.php`

> **Parent:** [Phase 7 overview](./00-overview.md)

```php
<?php
/**
 * EnvelopeBuilder — Fluent builder for the standard API response envelope.
 *
 * @package PluginName\Helpers
 * @since   1.0.0
 */

namespace PluginName\Helpers;

if (!defined('ABSPATH')) {
    exit;
}

use WP_REST_Response;
use PluginName\Enums\PluginConfigType;
use PluginName\Enums\ResponseKeyType;

final class EnvelopeBuilder
{
    private bool $isSuccess;
    private int $code;
    private string $message;
    private string $requestedAt = '';

    /** @var array<int, array<string, mixed>> */
    private array $results = [];

    private ?string $backendMessage = null;
    private ?string $exceptionType = null;

    /** @var array<int, string>|null */
    private ?array $stackFrames = null;

    private function __construct(bool $isSuccess, string $message, int $code)
    {
        $this->isSuccess = $isSuccess;
        $this->message = $message;
        $this->code = $code;
    }

    /**
     * Create a success envelope.
     *
     * @param string $message Status message (default: 'OK')
     * @param int    $code    HTTP status code (default: 200)
     */
    public static function success(string $message = 'OK', int $code = 200): self
    {
        return new self(true, $message, $code);
    }

    /**
     * Create an error envelope. Automatically extracts exception info if provided.
     *
     * @param string          $message   Error description
     * @param int             $code      HTTP status code (default: 500)
     * @param \Throwable|null $exception Optional exception for trace extraction
     */
    public static function error(
        string $message,
        int $code = 500,
        ?\Throwable $exception = null,
    ): self {
        $isDebug = PluginConfigType::isDebugMode();
        $isServerError = ($code >= 500);

        // Gate the error message for 5xx in production
        $resolvedMessage = ($isServerError && !$isDebug)
            ? 'An internal error occurred'
            : $message;

        $builder = new self(false, $resolvedMessage, $code);
        $builder->backendMessage = $message;

        $hasException = ($exception !== null);

        if ($hasException && $isDebug) {
            $builder->exceptionType = get_class($exception);
            $builder->stackFrames = self::extractFrames($exception);
        }

        return $builder;
    }

    public function setRequestedAt(string $path): self
    {
        $this->requestedAt = $path;

        return $this;
    }

    /**
     * @param array<string, mixed> $item Single result item
     */
    public function setSingleResult(array $item): self
    {
        $this->results = [$item];

        return $this;
    }

    /**
     * @param array<int, array<string, mixed>> $items List of result items
     */
    public function setListResult(array $items): self
    {
        $this->results = $items;

        return $this;
    }

    /**
     * @param array<int, string> $frames Stack trace frames
     */
    public function setStackTrace(array $frames): self
    {
        $isDebug = PluginConfigType::isDebugMode();

        if ($isDebug) {
            $this->stackFrames = $frames;
        }

        return $this;
    }

    /**
     * Build and return the final WP_REST_Response.
     */
    public function toResponse(): WP_REST_Response
    {
        $envelope = [
            ResponseKeyType::Status->value => [
                ResponseKeyType::IsSuccess->value => $this->isSuccess,
                ResponseKeyType::IsFailed->value  => !$this->isSuccess,
                ResponseKeyType::Code->value      => $this->code,
                ResponseKeyType::Message->value   => $this->message,
                ResponseKeyType::Timestamp->value => DateHelper::nowUtc(),
            ],
            ResponseKeyType::Attributes->value => [
                ResponseKeyType::RequestedAt->value  => $this->requestedAt,
                ResponseKeyType::TotalRecords->value => count($this->results),
            ],
            ResponseKeyType::Results->value => $this->results,
        ];

        // Only add Errors key on failure AND when there's debug info to show
        $hasErrors = (!$this->isSuccess && $this->stackFrames !== null);

        if ($hasErrors) {
            $envelope[ResponseKeyType::Errors->value] = [
                'BackendMessage' => $this->backendMessage,
                'ExceptionType'  => $this->exceptionType,
                'Backend'        => $this->stackFrames,
            ];
        }

        return new WP_REST_Response($envelope, $this->code);
    }

    /**
     * @param \Throwable $e
     *
     * @return array<int, string>
     */
    private static function extractFrames(\Throwable $e): array
    {
        $rawTrace = $e->getTraceAsString();
        $lines = explode("\n", $rawTrace);
        $frames = [];

        foreach ($lines as $line) {
            $trimmedLine = trim($line);
            $hasContent = ($trimmedLine !== '');

            if ($hasContent) {
                $frames[] = $trimmedLine;
            }
        }

        return $frames;
    }
}
```
