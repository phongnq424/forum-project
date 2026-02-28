import type { Handle } from '@sveltejs/kit';
import { ENDPOINTS } from '$lib/constants';
import { PUBLIC_API_URL } from '$env/static/public';

export const handle: Handle = async ({ event, resolve }) => {
    const accessToken = event.cookies.get('access_token');
    const refreshToken = event.cookies.get('refresh_token');

    if (accessToken) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);

            // Send cookies to backend using Cookie header
            let cookieHeader = `access_token=${accessToken}`;
            if (refreshToken) {
                cookieHeader += `; refresh_token=${refreshToken}`;
            }

            const response = await fetch(`${PUBLIC_API_URL}${ENDPOINTS.AUTH.GET_ME}`, {
                method: 'GET',
                headers: {
                    'Cookie': cookieHeader,
                    'Accept': 'application/json'
                },
                credentials: 'include',
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.ok) {

                const data = await response.json();
                event.locals.user = data.user || null;
            } else {
                console.warn('[hook] /auth/me failed:', response.status);
                event.locals.user = null;
            }
        } catch (err) {
            console.warn('[hook] /auth/me error:', (err as Error).message);
            event.locals.user = null;
        }
    } else {
        event.locals.user = null;
    }

    return await resolve(event);
};