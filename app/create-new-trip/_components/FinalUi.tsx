"use client";

import React from "react";
import { Globe2, CheckCircle2, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
    onViewTrip?: () => void;
    disabled?: boolean;
    tripDetail?: any;
    loading?: boolean;
};

function FinalUi({ onViewTrip, disabled, tripDetail, loading }: Props) {
    const isReady = Boolean(tripDetail);

    return (
        <div className="mt-3 flex flex-col items-center rounded-2xl border bg-white p-5 text-center shadow-sm">
            {isReady ? (
                <div className="rounded-full bg-green-50 p-3 text-green-600">
                    <CheckCircle2 className="h-8 w-8" />
                </div>
            ) : (
                <div className="rounded-full bg-primary/10 p-3 text-primary">
                    <Globe2 className="h-8 w-8 animate-pulse" />
                </div>
            )}

            <h2 className="mt-3 text-lg font-semibold text-foreground">
                {isReady
                    ? `🎉 Your Trip Plan is Ready!`
                    : "✈️ Planning your dream trip..."}
            </h2>

            <p className="mt-1 text-sm text-gray-500 max-w-sm">
                {isReady
                    ? `Hotels, activities, and daily itineraries for ${tripDetail?.destination || "your destination"} have been created.`
                    : "Gathering best destinations, activities, and travel details for you."}
            </p>

            <Button
                type="button"
                className="mt-4 w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-medium"
                onClick={onViewTrip}
                disabled={disabled || !isReady}
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
