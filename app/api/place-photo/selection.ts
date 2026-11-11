export type PhotoScope = "exact" | "destination";

// Wikimedia Commons search matches any word in a file title, so a search for a
// hotel can surface news photos (attacks, fires, protests...). Skip those.
const BLOCKED_TITLE_PATTERN = new RegExp(
    "\\b(" +
        [
            "terror",
            "terrorist",
            "attack",
            "attacks",
            "bomb",
            "bombing",
            "burned",
            "burnt",
            "burning",
            "damage",
            "damaged",
            "riot",
            "riots",
            "fire",
            "flood",
            "floods",
            "war",
            "ruin",
            "ruins",
            "destroyed",
            "destruction",
            "earthquake",
            "collapse",
            "collapsed",
            "accident",
            "protest",
            "strike",
            "violence",
            "shooting",
            "blast",
            "construction",
            "renovation",
            "map",
            "maps",
            "logo",
            "logos",
            "diagram",
            "plan",
            "drawing",
            "sketch",
            "painting",
            "engraving",
            "lithograph",
            "poster",
            "stamp",
            "coin",
            "banknote",
            "manuscript",
            "document",
            "portrait",
            "grave",
            "cemetery",
            "memorial",
            "statue",
            "plaque",
        ].join("|") +
        ")\\b",
    "i"
);

// Words that do not identify a specific hotel/place, so they must not count as
// evidence that a photo is about the requested place.
const GENERIC_TOKENS = new Set([
    "the",
    "and",
    "for",
    "with",
    "from",
    "near",
    "hotel",
    "hotels",
    "resort",
    "resorts",
    "inn",
    "guesthouse",
    "guest",
    "house",
    "hostel",
    "lodge",
    "suites",
    "suite",
    "spa",
    "by",
    "at",
    "of",
    "in",
    "on",
    "new",
    "old",
    "grand",
    "royal",
]);

export type CandidateScore = {
    score: number;
    nameMatches: number;
    nameTokenCount: number;
    phraseMatch: boolean;
    contextMatches: number;
    hasContext: boolean;
};

export function isBlockedTitle(title: string): boolean {
    return BLOCKED_TITLE_PATTERN.test(title);
}

export function normalizeText(value: string): string {
    return value
        .toLowerCase()
        .replace(/^file:\s*/i, "")
        .replace(/\.[a-z0-9]{2,5}$/i, "")
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
}

export function tokenize(value: string): string[] {
    return normalizeText(value)
        .split(/\s+/)
        .filter((word) => word.length > 2 && !GENERIC_TOKENS.has(word));
}

export function scoreCandidate(
    title: string,
    name: string,
    context: string,
    type: "hotel" | "place"
): CandidateScore {
    const normalizedTitle = normalizeText(title);
    const normalizedName = normalizeText(name);
    const titleTokens = new Set(normalizedTitle.split(/\s+/));
    const contextTokens = tokenize(context);

    // A destination word inside the name ("Oberoi **Mumbai**") does not prove
    // the photo is of the specific hotel/place, so only match the distinctive
    // words against the title.
    const nameTokens = tokenize(name).filter(
        (token) => !contextTokens.includes(token)
    );

    let score = 0;

    // A full-name match is by far the strongest signal.
    const phraseMatch =
        normalizedName.length >= 4 && normalizedTitle.includes(normalizedName);

    if (phraseMatch) score += 100;

    let nameMatches = 0;
    for (const token of nameTokens) {
        if (titleTokens.has(token)) {
            nameMatches += 1;
            score += 20;
        }
    }

    if (nameTokens.length > 0 && nameMatches === nameTokens.length) {
        score += 30;
    }

    if (
        type === "hotel" &&
        /\b(hotel|resort|inn|guest|suite|hostel|lodge)\b/i.test(normalizedTitle)
    ) {
        score += 10;
    }

    let contextMatches = 0;
    for (const token of contextTokens) {
        if (titleTokens.has(token)) {
            contextMatches += 1;
            score += 8;
        }
    }

    return {
        score,
        nameMatches,
        nameTokenCount: nameTokens.length,
        phraseMatch,
        contextMatches,
        hasContext: contextTokens.length > 0,
    };
}

export function isCandidateRelevant(
    candidate: CandidateScore,
    scope: PhotoScope
): boolean {
    // Generic destination photos have no specific name to match; the title
    // blocklist above is enough here.
    if (scope === "destination") return true;

    if (candidate.phraseMatch) return true;

    // Short names ("Taj Mahal") need one meaningful word, longer names need at
    // least two so "Taj Tower Hotel" does not win for "Taj Mahal Palace Hotel".
    // Destination words are already excluded from nameTokenCount.
    const requiredMatches =
        candidate.nameTokenCount === 0
            ? 0
            : Math.min(candidate.nameTokenCount, 2);

    if (requiredMatches === 0) return false;
    if (candidate.nameMatches < requiredMatches) return false;

    // When the name boils down to one distinctive word ("Oberoi"), the photo
    // must also be in the requested city, otherwise "Oberoi Delhi" would pass
    // for "The Oberoi Mumbai".
    if (
        candidate.hasContext &&
        candidate.nameTokenCount === 1 &&
        candidate.contextMatches === 0
    ) {
        return false;
    }

    return true;
}
