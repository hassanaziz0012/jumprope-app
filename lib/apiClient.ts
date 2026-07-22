import { API_URL } from "./constants";
import { showToast } from "./toastState";
import { handleAccountNotFound } from "./sync";

export interface ApiClientOptions extends Omit<RequestInit, "body"> {
    body?: any;
    timeoutMs?: number; // Default 10000ms
    suppressToast?: boolean; // Default false
    throwOnError?: boolean; // Default false
}

export class ApiClientError extends Error {
    status?: number;
    data?: any;
    isNetworkError?: boolean;
    isTimeout?: boolean;

    constructor(
        message: string,
        options?: {
            status?: number;
            data?: any;
            isNetworkError?: boolean;
            isTimeout?: boolean;
        }
    ) {
        super(message);
        this.name = "ApiClientError";
        this.status = options?.status;
        this.data = options?.data;
        this.isNetworkError = options?.isNetworkError;
        this.isTimeout = options?.isTimeout;
    }
}

/**
 * Universal API request function for backend API communication.
 * Handles timeouts, network disconnections, non-2xx status codes,
 * and notifies users automatically via Toast notification on errors.
 *
 * Does not throw by default unless throwOnError: true is passed.
 */
export async function apiClient<T = any>(
    endpointOrUrl: string,
    options: ApiClientOptions & { throwOnError: true }
): Promise<T>;
export async function apiClient<T = any>(
    endpointOrUrl: string,
    options?: ApiClientOptions
): Promise<T | null>;
export async function apiClient<T = any>(
    endpointOrUrl: string,
    options: ApiClientOptions = {}
): Promise<T | null> {
    const {
        timeoutMs = 10000,
        suppressToast = false,
        throwOnError = false,
        headers = {},
        body,
        method: methodOption,
        ...restOptions
    } = options;

    // Build absolute URL
    let url = endpointOrUrl;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        const path = url.startsWith("/") ? url : `/${url}`;
        url = `${API_URL}${path}`;
    }

    // Determine method
    const method = methodOption || (body !== undefined ? "POST" : "GET");

    // Setup headers and body
    const requestHeaders: Record<string, string> = {
        ...((headers as Record<string, string>) || {}),
    };

    let requestBody: any = body;
    if (body !== undefined && typeof body === "object" && !(body instanceof FormData)) {
        if (!requestHeaders["Content-Type"]) {
            requestHeaders["Content-Type"] = "application/json";
        }
        requestBody = JSON.stringify(body);
    }

    // Setup AbortController for request timeout
    const controller = new AbortController();
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    if (timeoutMs > 0) {
        timeoutId = setTimeout(() => {
            controller.abort();
        }, timeoutMs);
    }

    try {
        const response = await fetch(url, {
            ...restOptions,
            method,
            headers: requestHeaders,
            body: requestBody,
            signal: controller.signal,
        });

        if (timeoutId) clearTimeout(timeoutId);

        if (!response.ok) {
            let errorDetail = "";
            let responseData: any = null;

            try {
                const text = await response.text();
                if (text) {
                    try {
                        responseData = JSON.parse(text);
                        errorDetail =
                            responseData.detail ||
                            responseData.error ||
                            responseData.message ||
                            text;
                    } catch {
                        errorDetail = text;
                    }
                }
            } catch {
                // Response text read failed
            }

            const statusText = response.statusText ? ` ${response.statusText}` : "";
            const formattedMsg = errorDetail
                ? `API Error (${response.status}): ${errorDetail}`
                : `Request failed with status ${response.status}${statusText}.`;

            if (!suppressToast) {
                showToast(formattedMsg, "error");
            }

            if (
                response.status === 404 ||
                (typeof errorDetail === "string" &&
                    (errorDetail.includes("User account not found") ||
                        errorDetail.includes("User not found")))
            ) {
                handleAccountNotFound();
            }

            if (throwOnError) {
                throw new ApiClientError(formattedMsg, {
                    status: response.status,
                    data: responseData,
                });
            }

            return null;
        }

        // Handle empty or 204 No Content response
        if (response.status === 204) {
            return {} as T;
        }

        const responseText = await response.text();
        if (!responseText || responseText.trim() === "") {
            return {} as T;
        }

        try {
            return JSON.parse(responseText) as T;
        } catch {
            return responseText as unknown as T;
        }
    } catch (error: any) {
        if (timeoutId) clearTimeout(timeoutId);

        // If it's already an ApiClientError, rethrow only if throwOnError is true
        if (error instanceof ApiClientError) {
            if (throwOnError) throw error;
            return null;
        }

        let errorMessage = "An unexpected error occurred.";
        let isTimeout = false;
        let isNetworkError = false;

        if (error.name === "AbortError") {
            isTimeout = true;
            errorMessage = "Request timed out. Please check your connection.";
        } else if (
            error instanceof TypeError ||
            error.message?.includes("Network request failed") ||
            error.message?.includes("Failed to fetch")
        ) {
            isNetworkError = true;
            errorMessage = "Unable to connect to the server. Please check your network connection.";
        } else if (error.message) {
            errorMessage = error.message;
        }

        if (!suppressToast) {
            showToast(errorMessage, "error");
        }

        if (throwOnError) {
            throw new ApiClientError(errorMessage, {
                isTimeout,
                isNetworkError,
            });
        }

        return null;
    }
}
