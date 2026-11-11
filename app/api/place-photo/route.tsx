import { NextRequest, NextResponse } from "next/server";
import {
    isBlockedTitle,
    isCandidateRelevant,
    scoreCandidate,
    tokenize,
    type CandidateScore,
    type PhotoScope,
} from "./selection";

// Wikimedia classifies anonymous traffic with only a bare User-Agent as
// "unidentified" (10 req/min). A compliant UA with a project URL gets the
// normal 200 req/min limit. See:
// https://www.mediawiki.org/wiki/Wikimedia_APIs/Rate_limits
const USER_AGENT =
    "AI-Trip-Planner/1.0 " +
    "(https://github.com/Abdullah-al-Numan-dev/AI-Trip-Planner)";

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
// A "no photo found" answer may just mean the API was rate limited, so retry
// much sooner than a successful lookup.
const NEGATIVE_CACHE_TTL_MS = 60 * 60 * 1000;

// Wikimedia asks clients not to send parallel requests. One long-lived queue
// keeps the whole route polite and avoids 429 bursts when several cards mount
// at once.
const WIKIMEDIA_MIN_INTERVAL_MS = 350;
const sleep = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

let wikimediaQueue: Promise<unknown> = Promise.resolve();
let wikimediaBlockedUntil = 0;

function scheduleWikimedia<T>(task: () => Promise<T>): Promise<T | null> {
    const run = wikimediaQueue.then(async () => {
        if (Date.now() < wikimediaBlockedUntil) return null;

        await sleep(WIKIMEDIA_MIN_INTERVAL_MS);

        if (Date.now() < wikimediaBlockedUntil) return null;

        try {
            return await task();
        } catch {
            return null;
        }
    });

    wikimediaQueue = run.then(
        () => undefined,
        () => undefined
    );

    return run;
}

type PhotoResult = {
    photoUrl: string;
    source: "wikipedia" | "wikimedia";
    scope: PhotoScope;
    title?: string;
    descriptionUrl?: string;
    artist?: string;
    license?: string;
};

type CacheEntry = {
    data: PhotoResult | null;
    timestamp: number;
};

type Candidate = CandidateScore & {
    result: Omit<PhotoResult, "scope">;
};

const cache = new Map<string, CacheEntry>();

// Commons search requires every word to match, so a full postal address
// ("Road, Area, City 403516, India") almost never finds anything. Reduce any
// address to a city/area label before using it as a search query.
function cleanDestination(value: string): string {
    const segments = value
        .split(",")
        .map((segment) =>
            segment
                .replace(/\b\d{4,6}\b/g, "")
                .replace(/\s+/g, " ")
                .trim()
        )
        .filter(Boolean)
        .filter(
            (segment) =>
                !/^(india|usa|u\.s\.a\.?|united states|uk|united kingdom|canada|australia)$/i.test(
                    segment
                )
        );

    if (segments.length === 0) return "";

    // Keep the most local two parts: "Calangute, Goa".
    return segments.slice(-2).join(", ");
}


// Generic "Goa hotel" / "Goa" photos are shared by every card in a trip, so
// resolve them once per destination instead of once per card.
const destinationCache = new Map<
    string,
    { data: Omit<PhotoResult, "scope"> | null; timestamp: number }
>();

async function fetchJson(url: string) {
    return scheduleWikimedia(async () => {
        const response = await fetch(url, {
            headers: { "User-Agent": USER_AGENT },
            signal: AbortSignal.timeout(8000),
            next: { revalidate: 24 * 60 * 60 },
        });

        if (response.status === 429) {
            const retryAfter = Number(response.headers.get("retry-after"));
            const waitMs =
                Number.isFinite(retryAfter) && retryAfter > 0
                    ? retryAfter * 1000
                    : 30 * 1000;

            // Stop calling Wikimedia until the window passes instead of
            // burning every remaining card on more 429s.
            wikimediaBlockedUntil = Date.now() + waitMs;
            return null;
        }

        if (!response.ok) return null;
        return response.json();
    });
}

async function getWikipediaPhoto(
    query: string
): Promise<Omit<PhotoResult, "scope"> | null> {
    const title = query.trim().replace(/\s+/g, "_");
    if (!title) return null;

    const params = new URLSearchParams({
        action: "query",
        titles: title,
        prop: "pageimages",
        pithumbsize: "800",
        redirects: "1",
        format: "json",
    });

    const data = await fetchJson(
        `https://en.wikipedia.org/w/api.php?${params.toString()}`
    );

    const pages = data?.query?.pages;
    if (!pages) return null;

    for (const page of Object.values(pages) as any[]) {
        const url = page?.thumbnail?.source;
        if (!url) continue;

        return {
            photoUrl: url,
            source: "wikipedia",
            title: page?.title,
            descriptionUrl: page?.title
                ? `https://en.wikipedia.org/wiki/${encodeURIComponent(
                      String(page.title).replace(/\s+/g, "_")
                  )}`
                : undefined,
        };
    }

    return null;
}

async function getCommonsPhoto(
    query: string,
    options: {
        name: string;
        context: string;
        type: "hotel" | "place";
        scope: PhotoScope;
    }
): Promise<Omit<PhotoResult, "scope"> | null> {
    const trimmed = query.trim();
    if (!trimmed) return null;

    const params = new URLSearchParams({
        action: "query",
        generator: "search",
        gsrsearch: trimmed,
        gsrnamespace: "6",
        gsrlimit: "10",
        prop: "imageinfo",
        iiprop: "url|extmetadata",
        iiextmetadatafilter: "Artist|LicenseShortName|LicenseUrl",
        iiurlwidth: "800",
        format: "json",
    });

    const data = await fetchJson(
        `https://commons.wikimedia.org/w/api.php?${params.toString()}`
    );

    const pages = data?.query?.pages;
    if (!pages) return null;

    const ordered = (Object.values(pages) as any[]).sort(
        (a, b) => (a?.index ?? 999) - (b?.index ?? 999)
    );

    const candidates: Candidate[] = [];

    for (const page of ordered) {
        const info = page?.imageinfo?.[0];
        const url = info?.thumburl || info?.url;
        const title = typeof page?.title === "string" ? page.title : "";

        if (!url || !title) continue;

        // Prefer photographs over diagrams/SVGs/PDFs.
        if (!/\.(jpe?g|png|webp)(\?|$)/i.test(url)) continue;

        if (isBlockedTitle(title)) continue;

        const scored = scoreCandidate(
            title,
            options.name,
            options.context,
            options.type
        );

        if (!isCandidateRelevant(scored, options.scope)) continue;

        candidates.push({
            ...scored,
            result: {
                photoUrl: url,
                source: "wikimedia",
                title,
                descriptionUrl: info?.descriptionurl,
                artist: info?.extmetadata?.Artist?.value,
                license: info?.extmetadata?.LicenseShortName?.value,
            },
        });
    }

    candidates.sort((a, b) => b.score - a.score);

    return candidates[0]?.result ?? null;
}

async function resolvePhoto(
    name: string,
    context: string,
    destination: string,
    type: "hotel" | "place"
): Promise<PhotoResult | null> {
    const destinationLabel =
        cleanDestination(destination) || cleanDestination(context);
    // Use the clean city label for relevance checks too: a file title is far
    // more likely to contain "Goa" than the street or postal code.
    const commonsOptions = {
        name,
        context: destinationLabel || context,
        type,
    };

    // 1. Wikipedia article image for the exact name.
    if (type === "place" || /hotel|palace|resort|inn/i.test(name)) {
        const wikipedia = await getWikipediaPhoto(name);
        if (wikipedia) return { ...wikipedia, scope: "exact" };
    }

    if (Date.now() < wikimediaBlockedUntil) return null;

    // 2. Exact hotel/place name on Commons.
    const exact = await getCommonsPhoto(name, {
        ...commonsOptions,
        scope: "exact",
    });
    if (exact) return { ...exact, scope: "exact" };

    if (Date.now() < wikimediaBlockedUntil) return null;

    // 3. Add the destination only when it is not already part of the name
    // ("Baga Beach" + "Goa"). Hotels are skipped here: the address usually
    // makes the query too specific and returns nothing.
    const contextTokens = tokenize(destinationLabel);
    const nameTokens = new Set(tokenize(name));
    const sharesContext = contextTokens.some((token) =>
        nameTokens.has(token)
    );

    if (type === "place" && destinationLabel && !sharesContext) {
        const withContext = await getCommonsPhoto(
            `${name} ${destinationLabel}`,
            {
                ...commonsOptions,
                scope: "exact",
            }
        );
        if (withContext) return { ...withContext, scope: "exact" };
    }

    if (Date.now() < wikimediaBlockedUntil) return null;

    // 4. Generic destination photos, clearly marked as representative. This is
    // cached per destination because every card in the trip shares it.
    if (destinationLabel) {
        const destinationKey = `${type}:${destinationLabel}`.toLowerCase();
        const cachedDestination = destinationCache.get(destinationKey);

        if (
            cachedDestination &&
            Date.now() - cachedDestination.timestamp < CACHE_TTL_MS
        ) {
            return cachedDestination.data
                ? { ...cachedDestination.data, scope: "destination" }
                : null;
        }

        const destinationQueries =
            type === "hotel"
                ? [`${destinationLabel} hotel`, destinationLabel]
                : [destinationLabel];
        const destinationOptions = { ...commonsOptions, name: "" };

        for (const destinationQuery of destinationQueries) {
            const destination = await getCommonsPhoto(destinationQuery, {
                ...destinationOptions,
                scope: "destination",
            });

            if (destination) {
                destinationCache.set(destinationKey, {
                    data: destination,
                    timestamp: Date.now(),
                });

                return { ...destination, scope: "destination" };
            }

            if (Date.now() < wikimediaBlockedUntil) return null;
        }
    }

    return null;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const name = typeof body?.name === "string" ? body.name.trim() : "";
        const context =
            typeof body?.context === "string" ? body.context.trim() : "";
        const destination =
            typeof body?.destination === "string"
                ? body.destination.trim()
                : "";
        const type = body?.type === "hotel" ? "hotel" : "place";

        if (!name) {
            return NextResponse.json(
                { photoUrl: null, error: "name is required" },
                { status: 400 }
            );
        }

        const cacheKey =
            `${type}:${name}:${context}:${destination}`.toLowerCase();
        const now = Date.now();
        const cached = cache.get(cacheKey);
        const cachedTtl = cached?.data
            ? CACHE_TTL_MS
            : NEGATIVE_CACHE_TTL_MS;

        if (cached && now - cached.timestamp < cachedTtl) {
            return NextResponse.json({
                ...(cached.data ?? { photoUrl: null }),
                cached: true,
            });
        }

        const result = await resolvePhoto(
            name,
            context,
            destination,
            type
        );

        // Do not remember a failure caused by rate limiting: retry as soon as
        // the block clears.
        if (result || Date.now() >= wikimediaBlockedUntil) {
            cache.set(cacheKey, { data: result, timestamp: now });
        }

        return NextResponse.json(result ?? { photoUrl: null });
    } catch (error: unknown) {
        console.warn(
            "[place-photo] Falling back to no photo:",
            error instanceof Error ? error.message : error
        );

        return NextResponse.json({ photoUrl: null });
    }
}
