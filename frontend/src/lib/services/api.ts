import { PUBLIC_API_URL } from '$env/static/public';
import { authState } from '$lib/states/auth.svelte';


interface SendOptions<T = unknown> {
    method: string;
    path: string;
    data?: any;
    params?: Record<string, any>;
    fetch?: typeof fetch;
}

let isRefreshing = false;
let failedQueue: { resolve: (val?: any) => void; reject: (err?: any) => void }[] = [];

async function processQueue(error: any = null) {
    failedQueue.forEach(p => error ? p.reject(error) : p.resolve());
    failedQueue = [];
}

async function send<T>(opts: SendOptions<T>): Promise<T> {

    const { method, path, data, params, fetch: svelteFetch } = opts;
    let url = `${PUBLIC_API_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
    const fetcher = svelteFetch || fetch;
    if (params) {
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, v]) => v != null)
        );
        const queryString = new URLSearchParams(cleanParams as any).toString();
        if (queryString) {
            url += (url.includes('?') ? '&' : '?') + queryString;
        }
    }

    const headers: HeadersInit = { Accept: 'application/json' };
    let body: any = data;
    if (data && !(data instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify(data);
    }

    const requestOpts: RequestInit = {
        method,
        headers,
        body,
        credentials: 'include' // Send cookies automatically
    };

    let response = await fetcher(url, requestOpts);

    if (response.status === 401 && !path.includes('refresh') && !path.includes('login') && !path.includes('register')) {
        if (!isRefreshing) {
            isRefreshing = true;
            try {
                // Call refresh endpoint - backend sets new access_token cookie
                const refreshResponse = await fetcher(`${PUBLIC_API_URL}auth/refresh`, {
                    method: 'POST',
                    credentials: 'include'
                });

                if (!refreshResponse.ok) throw new Error('Refresh failed');

                await processQueue();

                // Retry original request with new token from cookie
                response = await fetcher(url, requestOpts);
            } catch (err) {
                await processQueue(err);
                authState.clearAuth();
                throw err;
            } finally {
                isRefreshing = false;
            }
        } else {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            }).then(() => send(opts));
        }
    }

    if (!response.ok) {
        const errData = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('API Error:', { url, method, status: response.status, body: data, error: errData });
        const message = errData.message || errData.error || 'Unknown error';
        const err = new Error(message);
        (err as any).status = response.status;
        throw err;
    }

    const result = response.status === 204 ? ({} as T) : await response.json() as T;

    return result;
}

export const api = {
    get: <T>(path: string, opts?: { params?: Record<string, any>, fetch?: typeof fetch }) =>
        send<T>({ method: 'GET', path, ...opts }),

    post: <T>(path: string, data?: any, opts?: { params?: Record<string, any>, fetch?: typeof fetch }) =>
        send<T>({ method: 'POST', path, data, ...opts }),

    put: <T>(path: string, data?: any, opts?: { params?: Record<string, any>, fetch?: typeof fetch }) =>
        send<T>({ method: 'PUT', path, data, ...opts }),

    patch: <T>(path: string, data?: any, opts?: { params?: Record<string, any>, fetch?: typeof fetch }) =>
        send<T>({ method: 'PATCH', path, data, ...opts }),

    delete: <T>(path: string, data?: any, opts?: { params?: Record<string, any>, fetch?: typeof fetch }) =>
        send<T>({ method: 'DELETE', path, data, ...opts })
};