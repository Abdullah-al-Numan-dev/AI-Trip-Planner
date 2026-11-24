import arcjet, { tokenBucket } from "@arcjet/next";

/** Chat turns one complete trip needs: the 7 qualifying questions. */
export const CHAT_TURNS_PER_TRIP = 7;

/** A conversational question/answer turn. */
export const CHAT_TURN_COST = 1;

/** The final itinerary is a much larger completion, so it costs more. */
export const FINAL_TRIP_COST = 6;

/** Tokens one complete trip costs (7 chat turns + the final itinerary). */
export const TOKENS_PER_TRIP =
    CHAT_TURNS_PER_TRIP * CHAT_TURN_COST + FINAL_TRIP_COST;

/** Complete trip plans a free user gets per day. */
export const FREE_TRIPS_PER_DAY = 2;

/** Spare tokens left once those trips are done, for follow-up questions. */
export const FREE_EXTRA_TOKENS = 6;

/**
 * Free-tier AI allowance, in tokens per day.
 *
 * 2 full trips plus 6 extra chat turns is 32 tokens. Every signed-in user is on
 * the free tier today; when paid subscriptions are wired up, skip
 * `aj.protect` for users on a paid plan.
 */
export const FREE_TIER_DAILY_TOKENS =
    FREE_TRIPS_PER_DAY * TOKENS_PER_TRIP + FREE_EXTRA_TOKENS;

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
