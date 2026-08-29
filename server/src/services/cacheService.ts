import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

export function getCached<T>(key: string): T | undefined {
    return cache.get<T>(key);
}

export function setCached<T>(key: string, value: T, ttlSeconds?: number): void {
    if (ttlSeconds !== undefined) {
        cache.set(key, value, ttlSeconds);
    } else {
        cache.set(key, value);
    } 
}

export function getCacheStatus(key: string): 'HIT' | 'MISS' {
    return cache.has(key) ? 'HIT' : 'MISS';
}

export function getAllCacheKeys(): string[] {
    return cache.keys();
}