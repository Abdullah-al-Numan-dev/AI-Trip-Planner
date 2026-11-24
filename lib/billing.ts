/**
 * Clerk Billing plan slug for paid users.
 *
 * Keep this in sync with the plan slug in the Clerk Dashboard. Clerk prefixes
 * user plans with `user:` in session claims, and this Clerk version requires
 * that prefix when calling `has({ plan })`. If Billing is not enabled, `has()`
 * simply returns false and everyone remains on the free tier.
 */
export const PRO_PLAN = "user:pro" as const;
