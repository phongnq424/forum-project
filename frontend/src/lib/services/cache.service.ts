/**
 * Frontend Caching Service
 * Provides client-side caching for API responses using localStorage and sessionStorage
 */

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    ttl: number; // in seconds
}

class CacheService {
    private prefix = 'forum_cache_';
    private sessionPrefix = 'forum_session_';

    /**
     * Get cache key with prefix
     */
    private getKey(key: string, isSession: boolean = false): string {
        const prefix = isSession ? this.sessionPrefix : this.prefix;
        return `${prefix}${key}`;
    }

    /**
     * Check if cache entry is expired
     */
    private isExpired(entry: CacheEntry<any>): boolean {
        if (entry.ttl === 0) return false; // 0 means no expiration
        const now = Date.now();
        return now - entry.timestamp > entry.ttl * 1000;
    }

    /**
     * Set cache with TTL (localStorage - persistent)
     * @param key - Cache key
     * @param data - Data to cache
     * @param ttl - Time to live in seconds (0 = no expiration)
     */
    set<T>(key: string, data: T, ttl: number = 300): void {
        try {
            const entry: CacheEntry<T> = {
                data,
                timestamp: Date.now(),
                ttl
            };
            localStorage.setItem(this.getKey(key), JSON.stringify(entry));
        } catch (error) {
            console.error('Cache set failed:', error);
        }
    }

    /**
     * Get cache (localStorage - persistent)
     * @param key - Cache key
     * @returns Cached data or null if not found or expired
     */
    get<T>(key: string): T | null {
        try {
            const item = localStorage.getItem(this.getKey(key));
            if (!item) return null;

            const entry: CacheEntry<T> = JSON.parse(item);
            if (this.isExpired(entry)) {
                this.remove(key);
                return null;
            }
            return entry.data;
        } catch (error) {
            console.error('Cache get failed:', error);
            return null;
        }
    }

    /**
     * Set session cache (sessionStorage - per session)
     * @param key - Cache key
     * @param data - Data to cache
     * @param ttl - Time to live in seconds
     */
    setSession<T>(key: string, data: T, ttl: number = 600): void {
        try {
            const entry: CacheEntry<T> = {
                data,
                timestamp: Date.now(),
                ttl
            };
            sessionStorage.setItem(this.getKey(key, true), JSON.stringify(entry));
        } catch (error) {
            console.error('Session cache set failed:', error);
        }
    }

    /**
     * Get session cache (sessionStorage - per session)
     * @param key - Cache key
     * @returns Cached data or null if not found or expired
     */
    getSession<T>(key: string): T | null {
        try {
            const item = sessionStorage.getItem(this.getKey(key, true));
            if (!item) return null;

            const entry: CacheEntry<T> = JSON.parse(item);
            if (this.isExpired(entry)) {
                this.removeSession(key);
                return null;
            }
            return entry.data;
        } catch (error) {
            console.error('Session cache get failed:', error);
            return null;
        }
    }

    /**
     * Remove cache entry
     */
    remove(key: string): void {
        try {
            localStorage.removeItem(this.getKey(key));
        } catch (error) {
            console.error('Cache remove failed:', error);
        }
    }

    /**
     * Remove session cache entry
     */
    removeSession(key: string): void {
        try {
            sessionStorage.removeItem(this.getKey(key, true));
        } catch (error) {
            console.error('Session cache remove failed:', error);
        }
    }

    /**
     * Clear all cache
     */
    clear(): void {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach((key) => {
                if (key.startsWith(this.prefix)) {
                    localStorage.removeItem(key);
                }
            });
        } catch (error) {
            console.error('Cache clear failed:', error);
        }
    }

    /**
     * Clear all session cache
     */
    clearSession(): void {
        try {
            const keys = Object.keys(sessionStorage);
            keys.forEach((key) => {
                if (key.startsWith(this.sessionPrefix)) {
                    sessionStorage.removeItem(key);
                }
            });
        } catch (error) {
            console.error('Session cache clear failed:', error);
        }
    }

    /**
     * Get cache statistics
     */
    getStats(): { itemCount: number; sessionItemCount: number } {
        try {
            const localItems = Object.keys(localStorage).filter((k) => k.startsWith(this.prefix)).length;
            const sessionItems = Object.keys(sessionStorage).filter((k) => k.startsWith(this.sessionPrefix)).length;
            return {
                itemCount: localItems,
                sessionItemCount: sessionItems
            };
        } catch (error) {
            console.error('Get stats failed:', error);
            return { itemCount: 0, sessionItemCount: 0 };
        }
    }
}

export const cacheService = new CacheService();

/**
 * Helper function to cache API responses
 * Usage:
 * ```
 * const data = await cachedFetch('/api/data', { ttl: 300 });
 * ```
 */
export async function cachedFetch<T>(
    url: string,
    options?: {
        ttl?: number;
        useSession?: boolean;
        headers?: HeadersInit;
        method?: string;
        body?: any;
    }
): Promise<T> {
    const { ttl = 300, useSession = false, ...fetchOptions } = options || {};
    const cacheKey = `api_${fetchOptions.method || 'GET'}_${url}`;
    const cache = useSession ? cacheService.getSession<T>(cacheKey) : cacheService.get<T>(cacheKey);

    if (cache) {
        return cache;
    }

    const response = await fetch(url, {
        credentials: 'include',
        ...fetchOptions
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
    }

    const data: T = await response.json();

    if (useSession) {
        cacheService.setSession(cacheKey, data, ttl);
    } else {
        cacheService.set(cacheKey, data, ttl);
    }

    return data;
}
