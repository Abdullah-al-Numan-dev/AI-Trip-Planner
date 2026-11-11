"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import type { PlaceInfo } from "./types";
import { FALLBACK_IMAGE, getSafeImageUrl } from "./image";

type PhotoSource = "google" | "wikipedia" | "wikimedia" | null;
type PhotoScope = "exact" | "destination" | null;

type CachedEntry = {
    data: PlaceInfo | null;
    photoUrl: string | null;
    photoSource: PhotoSource;
    photoScope: PhotoScope;
    photoCreditUrl?: string | null;
    photoCreditTitle?: string | null;
    timestamp: number;
};

type PlaceDetailsOptions = {
    fallbackImage?: string;
    context?: string;
    destination?: string;
    type?: "hotel" | "place";
};

const DAY_MS = 24 * 60 * 60 * 1000;
const CACHE_TTL_MS = 7 * DAY_MS;
const FALLBACK_TTL_MS = DAY_MS;
const CACHE_PREFIX = "place-detail-v3:";
const QUOTA_KEY = "google-place-quota-until";

function readCache(key: string): CachedEntry | null {
    try {
        const raw = window.localStorage.getItem(CACHE_PREFIX + key);
        if (!raw) return null;

        const parsed = JSON.parse(raw) as CachedEntry;
        return parsed?.timestamp ? parsed : null;
    } catch {
        return null;
    }
}

function isCacheFresh(entry: CachedEntry) {
    const ttl =
        entry.photoSource === "google" ? CACHE_TTL_MS : FALLBACK_TTL_MS;
    return Date.now() - entry.timestamp < ttl;
}

function writeCache(key: string, entry: CachedEntry) {
    try {
        window.localStorage.setItem(
            CACHE_PREFIX + key,
            JSON.stringify(entry)
        );
    } catch {
        // localStorage can be unavailable in private mode.
    }
}

function readQuotaUntil(): number {
    try {
        const raw = window.localStorage.getItem(QUOTA_KEY);
        const value = raw ? Number(raw) : 0;
        return Number.isFinite(value) ? value : 0;
    } catch {
        return 0;
    }
}

function writeQuotaUntil(value: number) {
    try {
        window.localStorage.setItem(QUOTA_KEY, String(value));
    } catch {
        // Ignore storage errors.
    }
}

/**
 * Resolves a real photo for a hotel/place:
 *   1. Google Places (exact photo, when billing/quota allows it)
 *   2. Wikipedia / Wikimedia Commons (free fallback)
 *   3. The image URL returned by the AI, if it points to a trusted host
 *
 * Results are cached in localStorage so the Google free-tier quota is not
 * consumed again on every render.
 */
export function usePlaceDetails(
    placeName: string,
    options: PlaceDetailsOptions = {}
) {
    const { fallbackImage, context = "", destination = "", type = "place" } =
        options;

    const [photoUrl, setPhotoUrl] = useState<string>(() =>
        getSafeImageUrl(fallbackImage)
    );
    const [place, setPlace] = useState<PlaceInfo | null>(null);
    const [photoSource, setPhotoSource] = useState<PhotoSource>(null);
    const [photoScope, setPhotoScope] = useState<PhotoScope>(null);
    const [photoCreditUrl, setPhotoCreditUrl] = useState<string | null>(null);
    const [photoCreditTitle, setPhotoCreditTitle] = useState<string | null>(
        null
    );
    const [quotaExceeded, setQuotaExceeded] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const query = placeName.trim();
        if (!query) return;

        const trimmedContext = context.trim();
        // Google gets the fullest description (name + address); the free
        // Wikimedia fallback gets the bare name plus the address as context.
        const googleQuery = trimmedContext
            ? `${query}, ${trimmedContext}`
            : query;

        const cacheKey =
            `${type}:${query}:${context}:${destination}`.toLowerCase();
        const cached = readCache(cacheKey);

        if (cached && isCacheFresh(cached)) {
            if (cached.data) setPlace(cached.data);
            if (cached.photoUrl) {
                setPhotoUrl(getSafeImageUrl(cached.photoUrl));
            }
            setPhotoSource(cached.photoSource);
            setPhotoScope(cached.photoScope);
            setPhotoCreditUrl(cached.photoCreditUrl ?? null);
            setPhotoCreditTitle(cached.photoCreditTitle ?? null);
            return;
        }

        let cancelled = false;
        setLoading(true);

        const resolve = async () => {
            let googlePlace: PlaceInfo | null = null;
            let displayPhoto: string | null = null;
            let source: PhotoSource = null;
            let scope: PhotoScope = null;
            let creditUrl: string | null = null;
            let creditTitle: string | null = null;

            let quotaBlocked = Date.now() < readQuotaUntil();

            if (quotaBlocked) {
                setQuotaExceeded(true);
            } else {
                try {
                    const { data } = await axios.post(
                        "/api/google-place-detail",
                        { placeName: googleQuery }
                    );

                    if (cancelled) return;

                    if (data?.quotaExceeded) {
                        const retryAt =
                            Number(data.retryAt) ||
                            Date.now() + 60 * 60 * 1000;
                        writeQuotaUntil(retryAt);
                        quotaBlocked = true;
                        setQuotaExceeded(true);
                    } else {
                        googlePlace = data?.place ?? null;

                        const rawPhotoUrl =
                            data?.photoUrl ??
                            googlePlace?.photoUrl ??
                            null;

                        if (rawPhotoUrl) {
                            displayPhoto = getSafeImageUrl(rawPhotoUrl);
                            source = "google";
                            scope = "exact";
                        }
                    }
                } catch {
                    // Fall through to the free image fallback.
                }
            }

            if (!displayPhoto) {
                try {
                    const { data } = await axios.post("/api/place-photo", {
                        name: query,
                        context,
                        destination,
                        type,
                    });

                    if (cancelled) return;

                    if (data?.photoUrl) {
                        displayPhoto = getSafeImageUrl(data.photoUrl);
                        source = data.source ?? "wikimedia";
                        scope = data.scope ?? "exact";
                        creditUrl = data.descriptionUrl ?? null;
                        creditTitle = data.title ?? null;
                    }
                } catch {
                    // Keep the AI-provided fallback image.
                }
            }

            if (cancelled) return;

            // No real photo was found: if an AI-provided image is still shown,
            // be honest that it only represents the destination.
            if (
                !displayPhoto &&
                fallbackImage &&
                fallbackImage !== FALLBACK_IMAGE
            ) {
                scope = "destination";
            }

            if (googlePlace) setPlace(googlePlace);
            if (displayPhoto) setPhotoUrl(displayPhoto);

            setPhotoSource(source);
            setPhotoScope(scope);
            setPhotoCreditUrl(creditUrl);
            setPhotoCreditTitle(creditTitle);
            setQuotaExceeded((previous) => previous || quotaBlocked);
            setLoading(false);

            // Only remember successful lookups. Caching "no photo" would hide
            // a transient network failure for a whole day.
            if (displayPhoto || googlePlace) {
                writeCache(cacheKey, {
                    data: googlePlace,
                    photoUrl: displayPhoto,
                    photoSource: source,
                    photoScope: scope,
                    photoCreditUrl: creditUrl,
                    photoCreditTitle: creditTitle,
                    timestamp: Date.now(),
                });
            }
        };

        resolve();

        return () => {
            cancelled = true;
        };
    }, [placeName, context, destination, type, fallbackImage]);

    return {
        photoUrl,
        place,
        photoSource,
        photoScope,
        photoCreditUrl,
        photoCreditTitle,
        quotaExceeded,
        loading,
        setPhotoUrl,
    };
}
