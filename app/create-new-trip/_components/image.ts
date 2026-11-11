export const FALLBACK_IMAGE = "/placeholder.jpg";

// next/image throws at render time when a remote hostname is not listed in
// next.config.ts, so only allow hosts we know are configured.
const ALLOWED_IMAGE_HOSTS = new Set([
    "images.unsplash.com",
    "plus.unsplash.com",
    "assets.aceternity.com",
    "places.googleapis.com",
    "upload.wikimedia.org",
    "thumb.wikimedia.org",
]);

export function getSafeImageUrl(url?: string | null): string {
    if (!url) return FALLBACK_IMAGE;

    // Local images from /public are always safe.
    if (url.startsWith("/")) return url;

    try {
        const parsed = new URL(url);
        return ALLOWED_IMAGE_HOSTS.has(parsed.hostname)
            ? url
            : FALLBACK_IMAGE;
    } catch {
        return FALLBACK_IMAGE;
    }
}
