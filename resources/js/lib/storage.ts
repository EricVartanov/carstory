export function storageUrl(path: string | null | undefined): string | null {
    if (!path) {
        return null;
    }

    return `/storage/${path}`;
}
