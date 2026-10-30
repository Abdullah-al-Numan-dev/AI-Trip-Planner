"use client";

import React from "react";
import { Globe2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
    onViewTrip?: () => void;
    disabled?: boolean;
};

function FinalUi({ onViewTrip, disabled }: Props) {
    return (
        <div className="mt-3 flex flex-col items-center rounded-2xl border bg-white p-5 text-center">
            <Globe2 className="h-8 w-8 animate-pulse text-primary" />

            <h2 className="mt-2 text-lg font-semibold text-primary">
                ✈️ Planning your dream trip...
            </h2>

            <p className="mt-1 text-sm text-gray-500">
                Gathering best destinations, activities, and travel details for you.
            </p>

            <Button
                type="button"
                className="mt-4 w-full bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={onViewTrip}
                disabled={disabled}
            >
                View Trip
            </Button>
        </div>
    );
}

export default FinalUi;