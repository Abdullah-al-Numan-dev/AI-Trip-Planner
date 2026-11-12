"use client";

import React from "react";
import { MapPin, Plus, X } from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import type { SavedTrip } from "./types";

type Props = {
    trips: SavedTrip[];
    activeTripId?: string | null;
    loading?: boolean;
    onNewChat: () => void;
    onSelectTrip: (trip: SavedTrip) => void;
    onClose?: () => void;
};

function tripTitle(trip: SavedTrip) {
    return trip?.tripDetail?.destination?.trim() || "Untitled trip";
}

function tripSubtitle(trip: SavedTrip) {
    return [trip?.tripDetail?.duration, trip?.tripDetail?.group_size]
        .filter(Boolean)
        .join(" · ");
}

function tripDate(timestamp?: number) {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
    });
}

function TripSidebar({
    trips,
    activeTripId,
    loading,
    onNewChat,
    onSelectTrip,
    onClose,
}: Props) {
    const { user } = useUser();

    return (
        <aside className='flex h-full w-72 max-w-[85vw] shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground'>
            <div className='flex items-center gap-2 p-3'>
                <Button
                    type='button'
                    variant='outline'
                    className='flex-1 justify-start gap-2 bg-background'
                    onClick={onNewChat}
                >
                    <Plus className='h-4 w-4' />
                    New chat
                </Button>

                {onClose && (
                    <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        className='lg:hidden'
                        onClick={onClose}
                        aria-label='Close sidebar'
                    >
                        <X className='h-5 w-5' />
                    </Button>
                )}
            </div>

            <div className='px-4 pb-1 pt-2 text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                Recent trips
            </div>

            <div className='mt-1 flex-1 overflow-y-auto px-2 pb-4'>
                {loading && (
                    <p className='px-2 py-3 text-sm text-muted-foreground'>
                        Loading your trips...
                    </p>
                )}

                {!loading && trips.length === 0 && (
                    <div className='mx-1 mt-2 rounded-xl border border-dashed px-3 py-6 text-center'>
                        <MapPin className='mx-auto h-5 w-5 text-muted-foreground' />
                        <p className='mt-2 text-sm font-medium'>
                            No saved trips yet
                        </p>
                        <p className='mt-1 text-xs text-muted-foreground'>
                            Plan a trip and it will appear here.
                        </p>
                    </div>
                )}

                <div className='space-y-1'>
                    {trips.map((trip) => {
                        const isActive = trip.tripId === activeTripId;

                        return (
                            <button
                                key={trip._id ?? trip.tripId}
                                type='button'
                                onClick={() => onSelectTrip(trip)}
                                aria-current={isActive ? "true" : undefined}
                                className={`group flex w-full items-start gap-2 rounded-lg px-2 py-2 text-left transition-colors hover:bg-sidebar-accent ${
                                    isActive ? "bg-sidebar-accent" : ""
                                }`}
                            >
                                <span className='mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary'>
                                    <MapPin className='h-4 w-4' />
                                </span>

                                <span className='min-w-0 flex-1'>
                                    <span className='block truncate text-sm font-medium'>
                                        {tripTitle(trip)}
                                    </span>
                                    <span className='mt-0.5 block truncate text-xs text-muted-foreground'>
                                        {tripSubtitle(trip) ||
                                            "Saved itinerary"}
                                    </span>
                                </span>

                                <span className='mt-0.5 shrink-0 text-[10px] text-muted-foreground'>
                                    {tripDate(trip._creationTime)}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className='flex items-center gap-2 border-t p-3'>
                <UserButton />
                <div className='min-w-0'>
                    <p className='truncate text-sm font-medium'>
                        {user?.fullName || "Traveler"}
                    </p>
                    <p className='truncate text-xs text-muted-foreground'>
                        {user?.primaryEmailAddress?.emailAddress || ""}
                    </p>
                </div>
            </div>
        </aside>
    );
}

export default TripSidebar;
