import { NextRequest, NextResponse } from "next/server";

// Only allow photo resource names returned by the Places API, e.g.
// places/ChIJ.../photos/AeJ...
const PHOTO_REF_PATTERN = /^places\/[^/]+\/photos\/[^/]+$/;

export async function GET(req: NextRequest) {
    const ref = req.nextUrl.searchParams.get("ref");

    if (!ref || !PHOTO_REF_PATTERN.test(ref)) {
        return new NextResponse("Invalid photo reference", { status: 400 });
    }

    const apiKey = process.env.GOOGLE_PLACE_API_KEY;
    if (!apiKey) {
        return new NextResponse("Google Places is not configured", {
            status: 500,
        });
    }

    const photoUrl =
        `https://places.googleapis.com/v1/${ref}/media` +
        `?maxHeightPx=1000&maxWidthPx=1000&key=${apiKey}`;

    try {
        const response = await fetch(photoUrl, {
            redirect: "follow",
            cache: "no-store",
        });

        if (!response.ok || !response.body) {
            return new NextResponse("Photo unavailable", { status: 502 });
        }

        return new NextResponse(response.body, {
            headers: {
                "Content-Type":
                    response.headers.get("content-type") ?? "image/jpeg",
                "Cache-Control":
                    "public, max-age=86400, stale-while-revalidate=604800",
            },
        });
    } catch {
        return new NextResponse("Photo unavailable", { status: 502 });
    }
}
