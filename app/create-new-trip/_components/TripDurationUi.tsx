"use client";

import React, { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
    onSelectOption: (value: string) => void;
};

const MIN_DAYS = 1;
const MAX_DAYS = 30;

function TripDurationUi({ onSelectOption }: Props) {
    const [days, setDays] = useState(7);

    return (
        <div className="mt-2 flex flex-col items-center gap-4 rounded-2xl border bg-white p-4">
            <h2 className="text-center font-semibold text-foreground">
                How many days do you want to travel?
            </h2>

            <div className="flex items-center gap-4">
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="rounded-full hover:border-primary hover:text-primary"
                    onClick={() => setDays((d) => Math.max(MIN_DAYS, d - 1))}
                    disabled={days <= MIN_DAYS}
                    aria-label="Decrease days"
                >
                    <Minus className="h-4 w-4" />
                </Button>

                <span className="min-w-20 text-center text-2xl font-bold text-foreground">
                    {days} {days === 1 ? "Day" : "Days"}
                </span>

                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="rounded-full hover:border-primary hover:text-primary"
                    onClick={() => setDays((d) => Math.min(MAX_DAYS, d + 1))}
                    disabled={days >= MAX_DAYS}
                    aria-label="Increase days"
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>

            <Button
                type="button"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() =>
                    onSelectOption(`${days} ${days === 1 ? "Day" : "Days"}`)
                }
            >
                Confirm
            </Button>
        </div>
    );
}

export default TripDurationUi;