/**
 * Tiny toast pub/sub. Lets any code dispatch a floating toast without
 * running through the game reducer (which keeps save state clean).
 * Mounted once via <ToastHost /> in AuthProvider.
 */

export type ToastVariant = "info" | "success" | "warning" | "reward";

export type ToastPayload = {
  id: number;
  text: string;
  variant: ToastVariant;
  detail?: string;
  at: number;
};

type Listener = (toast: ToastPayload) => void;

let nextId = 1;
const listeners = new Set<Listener>();

export function subscribeToasts(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function pushToast(
  text: string,
  opts: { variant?: ToastVariant; detail?: string } = {},
): void {
  const toast: ToastPayload = {
    id: nextId++,
    text,
    variant: opts.variant ?? "info",
    detail: opts.detail,
    at: Date.now(),
  };
  listeners.forEach((l) => l(toast));
}
