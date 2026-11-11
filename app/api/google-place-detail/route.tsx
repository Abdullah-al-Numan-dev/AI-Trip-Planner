import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import type { PlaceInfo } from "@/app/create-new-trip/_components/types";

const SEARCH_URL = "https://places.googleapis.com/v1/places:searchText";

const FIELD_MASK = [
    "places.id",
    "places.displayName",
    "places.formattedAddress",
    "places.rating",
    "places.userRatingCount",
    "places.priceLevel",
    "places.googleMapsUri",
    "places.websiteUri",
    "places.types",
    "places.photos",
].join(",");

type CacheEntry = {
    data: PlaceInfo | null;
    timestamp: number;
};

// Cache successful lookups for a week. This is the main protection against the
// small daily SearchText quota (100 requests/day on the free tier).
const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// When Google says the daily quota is exhausted, stop calling it until the
// quota window resets instead of hammering the API on every card render.
let quotaExceededUntil = 0;

function getQuotaResetTime(error: unknown): number {
    const details =
        axios.isAxiosError(error) &&
        Array.isArray(error.response?.data?.error?.details)
            ? error.response?.data?.error?.details
            : [];

    for (const detail of details) {
        const windowStart = Number(detail?.metadata?.window_start_time);
        if (Number.isFinite(windowStart) && windowStart > 0) {
            return (windowStart + 24 * 60 * 60) * 1000;
        }
    }

    return Date.now() + 60 * 60 * 1000;
}

function toPlaceInfo(place: any, photoUrl: string | null): PlaceInfo {
    return {
        id: place?.id,
        name: place?.displayName?.text,
        address: place?.formattedAddress,
        rating: place?.rating,
        userRatingCount: place?.userRatingCount,
        priceLevel: place?.priceLevel,
        googleMapsUri: place?.googleMapsUri,
        websiteUri: place?.websiteUri,
        types: place?.types,
        photoUrl,
    };
}

function buildPhotoProxyUrl(photoRefName: string): string {
    return `/api/google-place-photo?ref=${encodeURIComponent(photoRefName)}`;
}

export async function POST(req: NextRequest) {
    let placeName = "";

    try {
        const body = await req.json();
        placeName = typeof body?.placeName === "string" ? body.placeName : "";

        if (!placeName.trim()) {
            return NextResponse.json(
                { place: null, photoUrl: null, error: "placeName is required" },
                { status: 400 }
            );
        }

        const cacheKey = placeName.trim().toLowerCase();
        const now = Date.now();

        // Serve cached places even while the daily quota is exhausted.
        const cached = cache.get(cacheKey);
        if (cached && now - cached.timestamp < CACHE_TTL_MS) {
            return NextResponse.json({
                place: cached.data,
                photoUrl: cached.data?.photoUrl ?? null,
                cached: true,
            });
        }

        if (now < quotaExceededUntil) {
            return NextResponse.json({
                place: null,
                photoUrl: null,
                quotaExceeded: true,
                retryAt: quotaExceededUntil,
                error:
                    "Google Places daily quota is exhausted. Photos will return after the quota resets.",
            });
        }

        const apiKey = process.env.GOOGLE_PLACE_API_KEY;
        if (!apiKey) {
            return NextResponse.json({
                place: null,
                photoUrl: null,
                error: "GOOGLE_PLACE_API_KEY is not configured",
            });
        }

        const result = await axios.post(
            SEARCH_URL,
            { textQuery: placeName },
            {
                timeout: 10000,
                headers: {
                    "Content-Type": "application/json",
                    "X-Goog-Api-Key": apiKey,
                    "X-Goog-FieldMask": FIELD_MASK,
                },
            }
        );

        const place = result?.data?.places?.[0];

        if (!place) {
            cache.set(cacheKey, { data: null, timestamp: now });
            return NextResponse.json({ place: null, photoUrl: null });
        }

        const photoRefName = place?.photos?.[0]?.name;
        const photoUrl = photoRefName
            ? buildPhotoProxyUrl(photoRefName)
            : null;

        const placeInfo = toPlaceInfo(place, photoUrl);
        cache.set(cacheKey, { data: placeInfo, timestamp: now });

        return NextResponse.json({ place: placeInfo, photoUrl });
    } catch (error: unknown) {
        const statusCode = axios.isAxiosError(error)
            ? error.response?.status
            : undefined;
        const errorMessage = axios.isAxiosError(error)
            ? error.response?.data?.error?.message ||
              error.message
            : error instanceof Error
              ? error.message
              : "Internal server error";

        console.warn(
            `[google-place-detail] Request failed for "${placeName}" (${statusCode ?? "unknown"}): ${errorMessage}`
        );

        if (statusCode === 429) {
            quotaExceededUntil = getQuotaResetTime(error);

            return NextResponse.json({
                place: null,
                photoUrl: null,
                quotaExceeded: true,
                retryAt: quotaExceededUntil,
                error:
                    "Google Places daily quota is exhausted. Photos will return after the quota resets.",
            });
        }

        return NextResponse.json({
            place: null,
            photoUrl: null,
            error: errorMessage,
        });
    }
}
