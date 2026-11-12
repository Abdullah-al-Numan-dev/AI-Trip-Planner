"use client";

import React, { useState } from "react";
import { Menu, Plus } from "lucide-react";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import ChatBox from "./_components/ChatBox";
import Itinerary from "./_components/Itinerary";
import TripSidebar from "./_components/TripSidebar";
import { Button } from "@/components/ui/button";
import { useUserDetail } from "@/app/provider";
import type { SavedTrip, TripPlan } from "./_components/types";

type MobilePanel = "chat" | "itinerary";

function CreateNewTrip() {
    const { userDetail } = useUserDetail();
    const { isLoaded, isSignedIn } = useUser();

    const savedTrips = useQuery(
        api.tripDetail.ListTripDetails,
        userDetail?._id ? { uid: userDetail._id } : "skip"
    );

    const [chatKey, setChatKey] = useState(0);
    const [tripDetail, setTripDetail] = useState<TripPlan | null>(null);
    const [activeTripId, setActiveTripId] = useState<string | null>(null);
    const [showItinerary, setShowItinerary] = useState(false);
    const [mobilePanel, setMobilePanel] = useState<MobilePanel>("chat");
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const trips = (savedTrips ?? []) as SavedTrip[];

    // Clerk loads first, then CreateNewUser returns the Convex user id. Treat
    // both gaps as loading so the sidebar never flashes "No saved trips yet".
    const waitingForUser =
        !isLoaded || (Boolean(isSignedIn) && !userDetail?._id);
    const tripsLoading =
        waitingForUser ||
        (Boolean(userDetail?._id) && savedTrips === undefined);

    const startNewChat = () => {
        setChatKey((key) => key + 1);
        setTripDetail(null);
        setActiveTripId(null);
        setShowItinerary(false);
        setMobilePanel("chat");
        setSidebarOpen(false);
    };

    const openSavedTrip = (trip: SavedTrip) => {
        setTripDetail(trip.tripDetail);
        setActiveTripId(trip.tripId);
        setShowItinerary(true);
        setMobilePanel("itinerary");
        setSidebarOpen(false);
    };

    const handleTripGenerated = (trip: TripPlan, tripId: string) => {
        setTripDetail(trip);
        setActiveTripId(tripId);
    };

    const handleViewTrip = () => {
        setShowItinerary(true);
        setMobilePanel("itinerary");
    };

    const chat = (
        <ChatBox
            key={chatKey}
            onTripGenerated={handleTripGenerated}
            onViewTrip={handleViewTrip}
        />
    );

    const sidebarProps = {
        trips,
        activeTripId,
        loading: tripsLoading,
        onNewChat: startNewChat,
        onSelectTrip: openSavedTrip,
    };

    return (
        <div className='flex min-h-0 flex-1 overflow-hidden bg-background'>
            {/* Desktop sidebar */}
            <div key='desktop-sidebar' className='hidden lg:flex'>
                <TripSidebar {...sidebarProps} />
            </div>

            {/* Mobile sidebar drawer */}
            {sidebarOpen && (
                <div key='mobile-sidebar' className='fixed inset-0 z-50 lg:hidden'>
                    <button
                        type='button'
                        aria-label='Close sidebar'
                        className='absolute inset-0 bg-black/40'
                        onClick={() => setSidebarOpen(false)}
                    />
                    <div className='absolute inset-y-0 left-0 shadow-xl'>
                        <TripSidebar
                            {...sidebarProps}
                            onClose={() => setSidebarOpen(false)}
                        />
                    </div>
                </div>
            )}

            <div key='main' className='flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden'>
                {/* Mobile top bar */}
                <div className='flex items-center gap-2 border-b px-2 py-2 lg:hidden'>
                    <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        onClick={() => setSidebarOpen(true)}
                        aria-label='Open saved trips'
                    >
                        <Menu className='h-5 w-5' />
                    </Button>

                    <div className='min-w-0 flex-1'>
                        <p className='truncate text-sm font-medium'>
                            {showItinerary
                                ? tripDetail?.destination || "Your trip"
                                : "New trip"}
                        </p>
                    </div>

                    {showItinerary && (
                        <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            onClick={() =>
                                setMobilePanel((panel) =>
                                    panel === "chat"
                                        ? "itinerary"
                                        : "chat"
                                )
                            }
                        >
                            {mobilePanel === "chat" ? "View trip" : "Chat"}
                        </Button>
                    )}

                    <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        onClick={startNewChat}
                        aria-label='Start a new chat'
                    >
                        <Plus className='h-5 w-5' />
                    </Button>
                </div>

                <div className='flex min-h-0 flex-1 overflow-hidden'>
                    {/* Chat column */}
                    <div
                        className={`min-h-0 flex-col py-3 sm:py-4 ${
                            showItinerary
                                ? "w-full lg:w-[44%] lg:max-w-[560px] lg:min-w-[360px] lg:border-r"
                                : "mx-auto w-full max-w-3xl"
                        } ${
                            showItinerary && mobilePanel === "itinerary"
                                ? "hidden lg:flex"
                                : "flex"
                        }`}
                    >
                        <div className='min-h-0 flex-1 px-3 sm:px-5'>
                            {chat}
                        </div>
                    </div>

                    {/* Itinerary column */}
                    {showItinerary && (
                        <div
                            className={`min-h-0 flex-1 overflow-hidden p-3 sm:p-4 lg:block ${
                                mobilePanel === "itinerary"
                                    ? "block"
                                    : "hidden"
                            }`}
                        >
                            <div className='flex h-full min-h-0 flex-col'>
                                <div className='mb-3 hidden items-end justify-between gap-3 lg:flex'>
                                    <div className='min-w-0'>
                                        <p className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                                            {activeTripId
                                                ? "Your itinerary"
                                                : "Generated itinerary"}
                                        </p>
                                        <h2 className='truncate text-xl font-semibold'>
                                            {tripDetail?.destination ||
                                                "Your trip"}
                                        </h2>
                                        <p className='truncate text-sm text-muted-foreground'>
                                            {[
                                                tripDetail?.duration,
                                                tripDetail?.group_size,
                                                tripDetail?.budget,
                                            ]
                                                .filter(Boolean)
                                                .join(" · ")}
                                        </p>
                                    </div>

                                    <Button
                                        type='button'
                                        variant='outline'
                                        size='sm'
                                        className='shrink-0'
                                        onClick={startNewChat}
                                    >
                                        <Plus className='mr-1 h-4 w-4' />
                                        New chat
                                    </Button>
                                </div>

                                <div className='min-h-0 flex-1'>
                                    <Itinerary
                                        key={activeTripId ?? "trip"}
                                        tripData={tripDetail}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CreateNewTrip;
