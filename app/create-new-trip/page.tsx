"use client";

import React, { useState } from "react";
import { Globe2, List, Menu, Plus } from "lucide-react";
import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import ChatBox from "./_components/ChatBox";
import Itinerary from "./_components/Itinerary";
import TripSidebar from "./_components/TripSidebar";
import { Button } from "@/components/ui/button";
import { useUserDetail } from "@/app/provider";
import dynamic from "next/dynamic";
import type { SavedTrip, TripPlan } from "./_components/types";

const GlobalMap = dynamic(() => import("./_components/GlobalMap"), {
    ssr: false,
});

type MobilePanel = "chat" | "panel";
type RightTab = "map" | "itinerary";

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
    const [rightTab, setRightTab] = useState<RightTab>("map");
    const [mobilePanel, setMobilePanel] = useState<MobilePanel>("chat");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [mapLocation, setMapLocation] = useState<{
        source?: string;
        destination?: string;
    }>({});

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
        setRightTab("map");
        setMobilePanel("chat");
        setSidebarOpen(false);
        setMapLocation({});
    };

    const openSavedTrip = (trip: SavedTrip) => {
        setTripDetail(trip.tripDetail);
        setActiveTripId(trip.tripId);
        setRightTab("itinerary");
        setMobilePanel("panel");
        setSidebarOpen(false);
        setMapLocation({
            source: trip.tripDetail?.origin,
            destination: trip.tripDetail?.destination,
        });
    };

    const handleTripGenerated = (trip: TripPlan, tripId: string) => {
        setTripDetail(trip);
        setActiveTripId(tripId);
    };

    const handleViewTrip = () => {
        setRightTab("itinerary");
        setMobilePanel("panel");
    };

    const handleLocationDetected = (location: {
        source?: string;
        destination?: string;
    }) => {
        setMapLocation((current) => ({ ...current, ...location }));
    };

    const chat = (
        <ChatBox
            key={chatKey}
            onTripGenerated={handleTripGenerated}
            onViewTrip={handleViewTrip}
            onLocationDetected={handleLocationDetected}
        />
    );

    const sidebarProps = {
        trips,
        activeTripId,
        loading: tripsLoading,
        onNewChat: startNewChat,
        onSelectTrip: openSavedTrip,
    };

    const rightPanel = (
        <div className='flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border bg-card shadow-sm'>
            <div className='flex shrink-0 items-center justify-between gap-2 border-b px-3 py-2'>
                <div className='flex items-center gap-1 rounded-lg bg-muted p-1'>
                    <button
                        type='button'
                        onClick={() => setRightTab("map")}
                        className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                            rightTab === "map"
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <Globe2 className='h-3.5 w-3.5' />
                        Map
                    </button>
                    <button
                        type='button'
                        onClick={() => setRightTab("itinerary")}
                        disabled={!tripDetail}
                        className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                            rightTab === "itinerary"
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                        <List className='h-3.5 w-3.5' />
                        Itinerary
                    </button>
                </div>

                <span className='min-w-0 truncate text-xs text-muted-foreground'>
                    {mapLocation.destination || "Explore the globe"}
                </span>
            </div>

            <div className='min-h-0 flex-1'>
                {rightTab === "map" ? (
                    <div className='h-full w-full bg-slate-950'>
                        <GlobalMap
                            source={mapLocation.source}
                            destination={mapLocation.destination}
                            interactive
                        />
                    </div>
                ) : (
                    <div className='h-full overflow-y-auto p-3'>
                        <Itinerary
                            key={activeTripId ?? "trip"}
                            tripData={tripDetail}
                        />
                    </div>
                )}
            </div>
        </div>
    );

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
                            {mobilePanel === "panel"
                                ? rightTab === "map"
                                    ? "Trip map"
                                    : tripDetail?.destination || "Your trip"
                                : "New trip"}
                        </p>
                    </div>

                    <Button
                        type='button'
                        variant='ghost'
                        size='icon'
                        aria-label='View globe'
                        onClick={() => {
                            setRightTab("map");
                            setMobilePanel("panel");
                        }}
                    >
                        <Globe2 className='h-4 w-4' />
                    </Button>

                    {tripDetail && (
                        <Button
                            type='button'
                            variant='outline'
                            size='sm'
                            onClick={() =>
                                setMobilePanel((panel) =>
                                    panel === "chat" ? "panel" : "chat"
                                )
                            }
                        >
                            {mobilePanel === "chat"
                                ? rightTab === "map"
                                    ? "View map"
                                    : "View trip"
                                : "Chat"}
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
                        className={`min-h-0 w-full flex-col py-3 sm:py-4 lg:flex lg:w-[52%] lg:border-r ${
                            mobilePanel === "panel" ? "hidden lg:flex" : "flex"
                        }`}
                    >
                        <div className='min-h-0 flex-1 px-3 sm:px-5'>{chat}</div>
                    </div>

                    {/* Globe / itinerary panel */}
                    <div
                        className={`min-h-0 w-full flex-1 p-3 sm:p-4 lg:block ${
                            mobilePanel === "panel" ? "block" : "hidden"
                        }`}
                    >
                        {rightPanel}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreateNewTrip;
