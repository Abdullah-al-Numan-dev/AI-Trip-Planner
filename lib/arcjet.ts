import arcjet, { tokenBucket } from "@arcjet/next";

/**
 * Free-tier AI allowance, in tokens per day.
 *
 * Every signed-in user is on the free tier today. When paid subscriptions are
 * wired up, skip `aj.protect` for users on a paid plan.
 *
 * One full trip plan costs roughly 13 tokens (7-8 chat turns + the final
 * itinerary), so 45 tokens is about three trips per day.
 */
export const FREE_TIER_DAILY_TOKENS = 45;

/** A conversational question/answer turn. */
export const CHAT_TURN_COST = 1;

/** The final itinerary is a much larger completion, so it costs more. */
export const FINAL_TRIP_COST = 6;

export const aj = arcjet({
    key: process.env.ARCJET_KEY!,
    rules: [
        tokenBucket({
            mode: "LIVE",
            // Limit free usage per account rather than per IP, so people on a
            // shared network do not use up each other's allowance.
            characteristics: ["userId"],
            refillRate: FREE_TIER_DAILY_TOKENS,
            interval: "1d",
            capacity: FREE_TIER_DAILY_TOKENS,
        }),
    ],
});
