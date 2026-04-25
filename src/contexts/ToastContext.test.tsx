import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { act, render, renderHook, screen } from "@testing-library/react";
import { ToastProvider, useToast } from "./ToastContext";
import { Toaster } from "@/components/ui/Toaster";

/**
 * Behavioural contract for the toast queue:
 *   - `toast()` enqueues an entry and returns a stable id
 *   - `dismiss(id)` removes that entry
 *   - timers auto-dismiss after `durationMs` (or default 3000ms)
 *   - `clear()` empties the queue
 *   - `useToast` outside a provider throws
 *   - `<Toaster>` renders queued messages
 */

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ToastProvider>{children}</ToastProvider>
);

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

describe("useToast()", () => {
  it("throws when used outside provider", () => {
    expect(() => renderHook(() => useToast())).toThrow(
      /useToast must be used inside <ToastProvider>/,
    );
  });

  it("adds a toast and returns an id", () => {
    const { result } = renderHook(() => useToast(), { wrapper });
    let id = "";
    act(() => {
      id = result.current.toast({ message: "hello", variant: "info" });
    });
    expect(id).toMatch(/^t_/);
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].message).toBe("hello");
  });

  it("dismisses by id", () => {
    const { result } = renderHook(() => useToast(), { wrapper });
    let id = "";
    act(() => {
      id = result.current.toast({ message: "x", variant: "info" });
    });
    act(() => {
      result.current.dismiss(id);
    });
    expect(result.current.toasts).toHaveLength(0);
  });

  it("auto-dismisses after default duration", () => {
    const { result } = renderHook(() => useToast(), { wrapper });
    act(() => {
      result.current.toast({ message: "x", variant: "info" });
    });
    expect(result.current.toasts).toHaveLength(1);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current.toasts).toHaveLength(0);
  });

  it("respects custom durationMs", () => {
    const { result } = renderHook(() => useToast(), { wrapper });
    act(() => {
      result.current.toast({ message: "x", variant: "info", durationMs: 500 });
    });
    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(result.current.toasts).toHaveLength(1);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.toasts).toHaveLength(0);
  });

  it("clear() removes all toasts", () => {
    const { result } = renderHook(() => useToast(), { wrapper });
    act(() => {
      result.current.toast({ message: "a", variant: "info" });
      result.current.toast({ message: "b", variant: "error" });
    });
    expect(result.current.toasts).toHaveLength(2);
    act(() => {
      result.current.clear();
    });
    expect(result.current.toasts).toHaveLength(0);
  });

  it("preserves errorCode on the entry", () => {
    const { result } = renderHook(() => useToast(), { wrapper });
    act(() => {
      result.current.toast({
        message: "boom",
        variant: "error",
        errorCode: "E3025",
      });
    });
    expect(result.current.toasts[0].errorCode).toBe("E3025");
  });
});

describe("<Toaster />", () => {
  it("renders queued messages with provider", () => {
    const App = () => {
      const { toast } = useToast();
      return (
        <>
          <button
            type="button"
            onClick={() => toast({ message: "ping", variant: "success" })}
          >
            fire
          </button>
          <Toaster />
        </>
      );
    };
    render(
      <ToastProvider>
        <App />
      </ToastProvider>,
    );
    act(() => {
      screen.getByText("fire").click();
    });
    expect(screen.getByText("ping")).toBeInTheDocument();
  });

  it("renders nothing when queue is empty", () => {
    const { container } = render(
      <ToastProvider>
        <Toaster />
      </ToastProvider>,
    );
    expect(container.querySelector('[role="region"]')).toBeNull();
  });
});
