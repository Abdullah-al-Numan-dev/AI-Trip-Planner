"use client";

import React from "react";
import {
    Globe2,
    CheckCircle2,
    LoaderCircle,
    AlertCircle,
    RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TripPlan } from "./types";

type Props = {
    onViewTrip?: () => void;
    disabled?: boolean;
    tripDetail?: TripPlan | null;
    loading?: boolean;
    error?: string | null;
    onRetry?: () => void;
};

function FinalUi({
    onViewTrip,
    disabled,
    tripDetail,
    loading,
    error,
    onRetry,
}: Props) {
    const isReady = Boolean(tripDetail);

    if (error && !isReady) {
        return (
            <div className="mt-3 flex flex-col items-center rounded-2xl border border-red-200 bg-card p-5 text-center shadow-sm dark:border-red-900/60">
                <div className="rounded-full bg-red-50 p-3 text-red-600 dark:bg-red-950/50 dark:text-red-400">
                    <AlertCircle className="h-8 w-8" />
                </div>

                <h2 className="mt-3 text-lg font-semibold text-foreground">
                    We couldn&apos;t generate your trip plan
                </h2>

                <p className="mt-1 max-w-sm text-sm text-muted-foreground">{error}</p>

                <Button
                    type="button"
                    className="mt-4 w-full bg-primary font-medium text-primary-foreground transition-all hover:bg-primary/90"
                    onClick={onRetry}
                    disabled={loading || !onRetry}
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                            Retrying...
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            <RefreshCw className="h-4 w-4" />
                            Try Again
                        </span>
                    )}
                </Button>
            </div>
        );
    }

    return (
        <div className="mt-3 flex flex-col items-center rounded-2xl border bg-card p-5 text-center shadow-sm">
            {isReady ? (
                <div className="rounded-full bg-green-50 p-3 text-green-600 dark:bg-green-950/50 dark:text-green-400">
                    <CheckCircle2 className="h-8 w-8" />
                </div>
            ) : (
                <div className="rounded-full bg-primary/10 p-3 text-primary">
                    <Globe2 className="h-8 w-8 animate-pulse" />
                </div>
            )}

            <h2 className="mt-3 text-lg font-semibold text-foreground">
                {isReady
                    ? "🎉 Your Trip Plan is Ready!"
                    : "✈️ Planning your dream trip..."}
            </h2>

            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                {isReady
                    ? `Hotels, activities, and daily itineraries for ${
                          tripDetail?.destination || "your destination"
                      } have been created.`
                    : "Gathering best destinations, activities, and travel details for you."}
            </p>

            <Button
                type="button"
                className="mt-4 w-full bg-primary font-medium text-primary-foreground transition-all hover:bg-primary/90"
                onClick={onViewTrip}
                disabled={disabled || !isReady || loading}
            >
                {loading && !isReady ? (
                    <span className="flex items-center gap-2">
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        Generating Plan...
                    </span>
                ) : (
                    "View Trip"
                )}
            </Button>
        </div>
    );
}

export default FinalUi;
