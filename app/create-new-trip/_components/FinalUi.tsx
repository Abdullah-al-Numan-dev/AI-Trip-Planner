"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
    Globe2,
    CheckCircle2,
    LoaderCircle,
    AlertCircle,
    RefreshCw,
    X,
    MapPin,
    CalendarDays,
    Wallet,
    Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export type Hotel = {
    hotel_name?: string;
    hotel_address?: string;
    price_per_night?: string;
    hotel_image_url?: string;
    geo_coordinates?: {
        latitude?: number | string;
        longitude?: number | string;
    };
    rating?: number | string;
    description?: string;
};

export type Activity = {
    place_name?: string;
    place_details?: string;
    place_image_url?: string;
    geo_coordinates?: {
        latitude?: number | string;
        longitude?: number | string;
    };
    place_address?: string;
    ticket_pricing?: string;
    time_travel_each_location?: string;
    best_time_to_visit?: string;
};

export type ItineraryDay = {
    day?: number | string;
    day_plan?: string;
    best_time_to_visit_day?: string;
    activities?: Activity[];
};

export type TripPlan = {
    destination?: string;
    duration?: string;
    origin?: string;
    budget?: string;
    group_size?: string;
    hotels?: Hotel[];
    itinerary?: ItineraryDay[];
};

type Props = {
    onViewTrip?: () => void;
    disabled?: boolean;
    tripDetail?: TripPlan | null;
    loading?: boolean;
    error?: string | null;
    onRetry?: () => void;
};

function InfoBadge({
    icon,
    value,
}: {
    icon: React.ReactNode;
    value?: string;
}) {
    if (!value) return null;

    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">
            {icon}
            {value}
        </span>
    );
}

function TripPlanContent({ trip }: { trip: TripPlan }) {
    const hotels = Array.isArray(trip.hotels) ? trip.hotels : [];
    const itinerary = Array.isArray(trip.itinerary) ? trip.itinerary : [];

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
                <InfoBadge
                    icon={<MapPin className="h-3.5 w-3.5" />}
                    value={trip.destination}
                />
                <InfoBadge
                    icon={<CalendarDays className="h-3.5 w-3.5" />}
                    value={trip.duration}
                />
                <InfoBadge
                    icon={<Wallet className="h-3.5 w-3.5" />}
                    value={trip.budget}
                />
                <InfoBadge
                    icon={<Users className="h-3.5 w-3.5" />}
                    value={trip.group_size}
                />
                {trip.origin && (
                    <InfoBadge
                        icon={<Globe2 className="h-3.5 w-3.5" />}
                        value={`From ${trip.origin}`}
                    />
                )}
            </div>

            {hotels.length > 0 && (
                <section>
                    <h3 className="mb-3 text-base font-semibold text-foreground">
                        Hotels
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {hotels.map((hotel, index) => (
                            <div
                                key={index}
                                className="rounded-xl border p-3"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <h4 className="font-semibold text-foreground">
                                        {hotel.hotel_name || "Hotel"}
                                    </h4>
                                    {hotel.rating != null && (
                                        <span className="shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                                            ★ {hotel.rating}
                                        </span>
                                    )}
                                </div>

                                {hotel.hotel_address && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        {hotel.hotel_address}
                                    </p>
                                )}

                                {hotel.price_per_night && (
                                    <p className="mt-2 text-sm font-medium text-foreground">
                                        {hotel.price_per_night}
                                    </p>
                                )}

                                {hotel.description && (
                                    <p className="mt-1 text-sm text-gray-600">
                                        {hotel.description}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {itinerary.length > 0 && (
                <section>
                    <h3 className="mb-3 text-base font-semibold text-foreground">
                        Itinerary
                    </h3>
                    <div className="space-y-3">
                        {itinerary.map((day, index) => (
                            <div
                                key={index}
                                className="rounded-xl border p-3"
                            >
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                                        Day {day.day ?? index + 1}
                                    </span>
                                    {day.day_plan && (
                                        <h4 className="font-semibold text-foreground">
                                            {day.day_plan}
                                        </h4>
                                    )}
                                </div>

                                {day.best_time_to_visit_day && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        Best time to visit: {day.best_time_to_visit_day}
                                    </p>
                                )}

                                {Array.isArray(day.activities) &&
                                    day.activities.length > 0 && (
                                        <ul className="mt-3 space-y-2">
                                            {day.activities.map((activity, activityIndex) => (
                                                <li
                                                    key={activityIndex}
                                                    className="rounded-lg bg-muted/50 p-2.5"
                                                >
                                                    <p className="font-medium text-foreground">
                                                        {activity.place_name || "Activity"}
                                                    </p>

                                                    {activity.place_details && (
                                                        <p className="mt-0.5 text-sm text-gray-600">
                                                            {activity.place_details}
                                                        </p>
                                                    )}

                                                    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                                                        {activity.place_address && (
                                                            <span>{activity.place_address}</span>
                                                        )}
                                                        {activity.ticket_pricing && (
                                                            <span>
                                                                Ticket: {activity.ticket_pricing}
                                                            </span>
                                                        )}
                                                        {activity.best_time_to_visit && (
                                                            <span>
                                                                Best time: {activity.best_time_to_visit}
                                                            </span>
                                                        )}
                                                        {activity.time_travel_each_location && (
                                                            <span>
                                                                Travel: {activity.time_travel_each_location}
                                                            </span>
                                                        )}
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {hotels.length === 0 && itinerary.length === 0 && (
                <p className="text-sm text-gray-500">
                    No detailed hotels or itinerary were returned for this trip.
                </p>
            )}
        </div>
    );
}

function FinalUi({
    onViewTrip,
    disabled,
    tripDetail,
    loading,
    error,
    onRetry,
}: Props) {
    const [showPlan, setShowPlan] = useState(false);
    const isReady = Boolean(tripDetail);

    useEffect(() => {
        if (!showPlan) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setShowPlan(false);
        };

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [showPlan]);

    const handleViewTrip = () => {
        onViewTrip?.();
        setShowPlan(true);
    };

    if (error && !isReady) {
        return (
            <div className="mt-3 flex flex-col items-center rounded-2xl border border-red-200 bg-white p-5 text-center shadow-sm">
                <div className="rounded-full bg-red-50 p-3 text-red-600">
                    <AlertCircle className="h-8 w-8" />
                </div>

                <h2 className="mt-3 text-lg font-semibold text-foreground">
                    We couldn&apos;t generate your trip plan
                </h2>

                <p className="mt-1 max-w-sm text-sm text-gray-500">{error}</p>

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
        <>
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
                        ? "🎉 Your Trip Plan is Ready!"
                        : "✈️ Planning your dream trip..."}
                </h2>

                <p className="mt-1 max-w-sm text-sm text-gray-500">
                    {isReady
                        ? `Hotels, activities, and daily itineraries for ${
                              tripDetail?.destination || "your destination"
                          } have been created.`
                        : "Gathering best destinations, activities, and travel details for you."}
                </p>

                <Button
                    type="button"
                    className="mt-4 w-full bg-primary font-medium text-primary-foreground transition-all hover:bg-primary/90"
                    onClick={handleViewTrip}
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

            {showPlan &&
                isReady &&
                typeof document !== "undefined" &&
                createPortal(
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Your trip plan"
                        onClick={() => setShowPlan(false)}
                    >
                        <div
                            className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
                            onClick={(event) => event.stopPropagation()}
                        >
                            <div className="flex items-start justify-between gap-4 border-b p-4">
                                <div>
                                    <h2 className="text-lg font-bold text-foreground">
                                        {tripDetail?.destination || "Your Trip Plan"}
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        Your complete AI-generated travel plan
                                    </p>
                                </div>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setShowPlan(false)}
                                    aria-label="Close trip plan"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="overflow-y-auto p-4">
                                <TripPlanContent trip={tripDetail as TripPlan} />
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
        </>
    );
}

export default FinalUi;
