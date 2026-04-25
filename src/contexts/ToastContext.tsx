import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";

/**
 * Toast queue — typed, framework-free state container.
 *
 * Design rules (per `mem://constraints/coding-guidelines`):
 *   - zero `any`; every variant is a discriminated literal
 *   - max 3 params per fn; max 15 lines per fn body
 *   - positive guard clauses only
 *
 * Future hook-up points (kept narrow today):
 *   - `errorCode` will eventually carry an `apperror` code from
 *     `spec/03-error-manage/02-error-architecture/`. Today it's an
 *     opaque string so call sites can pre-thread the contract.
 */

export type ToastVariant = "success" | "error" | "info" | "warning";

export interface ToastInput {
  readonly message: string;
  readonly variant: ToastVariant;
  readonly errorCode?: string;
  readonly durationMs?: number;
}

export interface ToastEntry extends ToastInput {
  readonly id: string;
  readonly createdAt: number;
}

interface ToastContextValue {
  readonly toasts: ReadonlyArray<ToastEntry>;
  readonly toast: (input: ToastInput) => string;
  readonly dismiss: (id: string) => void;
  readonly clear: () => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION_MS = 3000;

function makeId(seed: number): string {
  return `t_${seed.toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

interface ToastProviderProps {
  readonly children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toasts, setToasts] = useState<ReadonlyArray<ToastEntry>>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (input: ToastInput): string => {
      const id = makeId(Date.now());
      const entry: ToastEntry = { ...input, id, createdAt: Date.now() };
      setToasts((prev) => [...prev, entry]);
      const ms = input.durationMs ?? DEFAULT_DURATION_MS;
      const timer = setTimeout(() => dismiss(id), ms);
      timersRef.current.set(id, timer);
      return id;
    },
    [dismiss],
  );

  const clear = useCallback(() => {
    for (const timer of timersRef.current.values()) clearTimeout(timer);
    timersRef.current.clear();
    setToasts([]);
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({ toasts, toast, dismiss, clear }),
    [toasts, toast, dismiss, clear],
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
};

/**
 * Read-side hook for any component that needs to show a toast.
 * Throws when used outside `<ToastProvider>` — fail loud at dev time.
 */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (ctx) return ctx;
  throw new Error("useToast must be used inside <ToastProvider>");
}
