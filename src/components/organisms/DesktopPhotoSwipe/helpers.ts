import { InputObject } from './types';

export function getBaseUrl(): string {
    return `${window.location.pathname}${window.location.search}`;
}

export function getHashValue(): string {
    return window.location.hash.substring(1);
}

export function hashToObject(hash: string): Record<string, string> {
    return hash.split('&').reduce(
        (acc, keyValue) => {
            const [key, value] = keyValue.split('=');
            if (key) {
                acc[key] = value;
            }
            return acc;
        },
        {} as Record<string, string>,
    );
}

export function objectToHash(obj: InputObject): string {
    return Object.entries(obj)
        .map(([key, value]) => (value ? `${key}=${value}` : key))
        .join('&');
}

export function getHashWithoutGidAndPid(hash: string): string {
    const obj = hashToObject(hash);
    delete obj.gid;
    delete obj.pid;
    return objectToHash(obj);
}

export function hashIncludesNavigationQueryParams(hash: string): boolean {
    const hashParts = hashToObject(hash);
    return Boolean(hashParts.gid) && Boolean(hashParts.pid);
}

export function getInitialActiveSlideIndex(index: number | null, targetId: string | null | undefined): number {
    if (index !== null) return index;
    return targetId ? parseInt(targetId, 10) - 1 : 0;
}
