# 8.4 File Upload Handling

> **Parent:** [Phase 8 overview](./00-overview.md)

---

## REST endpoint for file uploads

```php
namespace PluginName\Traits\Upload;

if (!defined('ABSPATH')) {
    exit;
}

use WP_REST_Request;
use WP_REST_Response;
use PluginName\Helpers\EnvelopeBuilder;
use PluginName\Helpers\PathHelper;

trait FileUploadTrait
{
    public function handleFileUpload(WP_REST_Request $request): WP_REST_Response
    {
        return $this->safeExecute(
            fn() => $this->executeFileUpload($request),
            'file-upload',
        );
    }

    private function executeFileUpload(WP_REST_Request $request): WP_REST_Response
    {
        // ── 1. Check for uploaded files ──
        $files = $request->get_file_params();
        $hasFiles = (!empty($files) && isset($files['file']));

        if (!$hasFiles) {
            return $this->validationError('No file uploaded', $request);
        }

        $file = $files['file'];

        // ── 2. Check for upload errors ──
        $uploadError = $file['error'] ?? UPLOAD_ERR_NO_FILE;
        $hasUploadError = ($uploadError !== UPLOAD_ERR_OK);

        if ($hasUploadError) {
            $errorMessage = $this->resolveUploadError($uploadError);

            return $this->validationError($errorMessage, $request);
        }

        // ── 3. Validate file type ──
        $fileName = sanitize_file_name($file['name']);
        $extension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
        $allowedExtensions = ['zip', 'json', 'csv'];
        $isAllowedType = in_array($extension, $allowedExtensions, true);

        if (!$isAllowedType) {
            $allowed = implode(', ', $allowedExtensions);

            return $this->validationError(
                "File type '.{$extension}' is not allowed. Allowed: {$allowed}",
                $request,
            );
        }

        // ── 4. Validate file size (max 50MB) ──
        $maxSizeBytes = 50 * 1024 * 1024;
        $fileSize = $file['size'] ?? 0;
        $isTooBig = ($fileSize > $maxSizeBytes);

        if ($isTooBig) {
            $maxMb = $maxSizeBytes / 1048576;

            return $this->validationError(
                "File exceeds maximum size of {$maxMb}MB",
                $request,
            );
        }

        // ── 5. Move file to plugin directory ──
        $tempPath = $file['tmp_name'];
        $targetDir = PathHelper::getTempDir();
        PathHelper::ensureDirectory($targetDir);

        $targetPath = $targetDir . '/' . $fileName;
        $isMoved = move_uploaded_file($tempPath, $targetPath);

        if (!$isMoved) {
            return EnvelopeBuilder::error('Failed to save uploaded file', 500)
                ->setRequestedAt($request->get_route())
                ->toResponse();
        }

        $this->fileLogger->info('File uploaded', [
            'fileName' => $fileName,
            'size'     => $fileSize,
        ]);

        return EnvelopeBuilder::success('File uploaded successfully')
            ->setRequestedAt($request->get_route())
            ->setSingleResult([
                'fileName' => $fileName,
                'size'     => $fileSize,
                'path'     => $targetPath,
            ])
            ->toResponse();
    }

    /**
     * Map PHP upload error codes to human-readable messages.
     */
    private function resolveUploadError(int $errorCode): string
    {
        return match ($errorCode) {
            UPLOAD_ERR_INI_SIZE   => 'File exceeds server upload limit',
            UPLOAD_ERR_FORM_SIZE  => 'File exceeds form upload limit',
            UPLOAD_ERR_PARTIAL    => 'File was only partially uploaded',
            UPLOAD_ERR_NO_FILE    => 'No file was uploaded',
            UPLOAD_ERR_NO_TMP_DIR => 'Server misconfiguration: missing temp directory',
            UPLOAD_ERR_CANT_WRITE => 'Server failed to write file to disk',
            UPLOAD_ERR_EXTENSION  => 'Upload blocked by server extension',
            default               => "Unknown upload error (code: {$errorCode})",
        };
    }
}
```

## Route registration for file upload

```php
// In RouteRegistrationTrait — file uploads need special handling
$safeRegister(
    EndpointType::FileUpload->route(),
    [
        'methods'             => HttpMethodType::Post->value,
        'callback'            => [$this, 'handleFileUpload'],
        'permission_callback' => [$this, 'checkPluginPermission'],
    ],
);
```

## Edge cases

| Scenario | Handling |
|----------|----------|
| PHP `upload_max_filesize` too low | Check `ini_get('upload_max_filesize')` and warn in health check |
| `post_max_size` smaller than file | Returns empty `$_FILES` — check for this before validation |
| Symlink attack on temp file | Use `move_uploaded_file()` (not `rename()`) — it validates the temp path |
| File name collision | Prepend timestamp or UUID: `time() . '_' . $fileName` |
| Binary file disguised as allowed type | Check MIME via `wp_check_filetype()` in addition to extension |
