import { PUBLIC_API_URL } from '$env/static/public';
import { get } from 'svelte/store';
import { auth, setAuth, clearAuth } from '$lib/stores/auth.store';

interface SendOptions<T = unknown> {
    method: string;
    path: string;
    data?: any;
    fetch?: typeof fetch;
}

let isRefreshing = false;
let failedQueue: { resolve: (val?: any) => void; reject: (err?: any) => void }[] = [];

async function processQueue(error: any = null) {
    failedQueue.forEach(p => error ? p.reject(error) : p.resolve());
    failedQueue = [];
}

async function send<T>(opts: SendOptions<T>): Promise<T> {

    const { method, path, data, fetch: customFetch = fetch } = opts;
    const url = `${PUBLIC_API_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;

    const headers: HeadersInit = { Accept: 'application/json' };
    if (data) headers['Content-Type'] = 'application/json';

    const token = get(auth).accessToken;
    if (token) headers.Authorization = `Bearer ${token}`;

    const requestOpts: RequestInit = {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
        credentials: 'include'
    };

    let response = await customFetch(url, requestOpts);

    if (response.status === 401 && !path.includes('refresh') && !path.includes('login')) {
        if (!isRefreshing) {
            isRefreshing = true;
            try {
                const refreshResponse = await customFetch(`${PUBLIC_API_URL}/auth/refresh`, {
                    method: 'POST',
                    credentials: 'include'
                });

                if (!refreshResponse.ok) throw new Error('Refresh failed');

                const { accessToken } = await refreshResponse.json(); // BE set Set-Cookie refresh mới nếu rotation

                setAuth(accessToken);

                await processQueue();

                // Retry original request
                headers.Authorization = `Bearer ${accessToken}`;
                response = await customFetch(url, { ...requestOpts, headers });
            } catch (err) {
                await processQueue(err);
                clearAuth();
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

    return response.status === 204 ? ({} as T) : await response.json() as T;
}

export const api = {
    get: <T>(path: string, opts?: { fetch?: typeof fetch }) => send<T>({ method: 'GET', path, ...opts }),
    post: <T>(path: string, data: any, opts?: { fetch?: typeof fetch }) => send<T>({ method: 'POST', path, data, ...opts }),
    put: <T>(path: string, data: any, opts?: { fetch?: typeof fetch }) => send<T>({ method: 'PUT', path, data, ...opts }),
    delete: <T>(path: string, opts?: { fetch?: typeof fetch }) => send<T>({ method: 'DELETE', path, ...opts })
};