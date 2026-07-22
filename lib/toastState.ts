export interface ToastPayload {
    id: string;
    message: string;
    type?: "error" | "warning" | "info";
    duration?: number; // duration in ms, default 3000
}

type ToastListener = (toast: ToastPayload | null) => void;

const listeners = new Set<ToastListener>();
let currentToast: ToastPayload | null = null;

export function subscribeToToast(listener: ToastListener) {
    listeners.add(listener);
    listener(currentToast);
    return () => {
        listeners.delete(listener);
    };
}

export function showToast(
    message: string,
    type: "error" | "warning" | "info" = "error",
    duration: number = 3000
) {
    currentToast = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
        message,
        type,
        duration,
    };
    listeners.forEach((l) => l(currentToast));
}

export function hideToast() {
    currentToast = null;
    listeners.forEach((l) => l(null));
}
