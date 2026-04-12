function readCookie(name: string): string | null {
    const match = document.cookie.match(
        new RegExp(`(?:^|; )${name}=([^;]*)`),
    );

    return match ? decodeURIComponent(match[1]) : null;
}

/**
 * POST JSON to same-origin Laravel route with CSRF cookie header.
 */
export async function postJson(
    url: string,
    body: unknown,
): Promise<Response> {
    const token = readCookie('XSRF-TOKEN');

    return fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...(token ? { 'X-XSRF-TOKEN': token } : {}),
        },
        credentials: 'same-origin',
        body: JSON.stringify(body),
    });
}
