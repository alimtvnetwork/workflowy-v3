import { useToast, type ToastEntry, type ToastVariant } from "@/contexts/ToastContext";

/**
 * Renders the live toast queue. Pure presentation — all state lives in
 * `ToastContext`. Mount once near the app root; styling uses semantic
 * design tokens only (`mem://design/theme`).
 */

const VARIANT_CLASSES: Record<ToastVariant, string> = {
  success: "bg-success text-background",
  error: "bg-destructive text-destructive-foreground",
  info: "bg-foreground text-background",
  warning: "bg-warning text-background",
};

interface ToastItemProps {
  readonly entry: ToastEntry;
  readonly onDismiss: (id: string) => void;
}

const ToastItem = ({ entry, onDismiss }: ToastItemProps) => {
  const variantClass = VARIANT_CLASSES[entry.variant];
  return (
    <button
      type="button"
      onClick={() => onDismiss(entry.id)}
      className={`pointer-events-auto rounded-md px-xl py-lg text-menu shadow-lg ${variantClass}`}
      aria-label="Dismiss notification"
    >
      {entry.message}
    </button>
  );
};

export const Toaster = () => {
  const { toasts, dismiss } = useToast();
  if (toasts.length === 0) return null;
  return (
    <div
      role="region"
      aria-label="Notifications"
      className="pointer-events-none fixed bottom-xl right-xl flex flex-col gap-md"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} entry={t} onDismiss={dismiss} />
      ))}
    </div>
  );
};
