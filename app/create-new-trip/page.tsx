"use client";

import React, { useState } from "react";
import { Globe2, List, Menu, MessageSquare, Plus } from "lucide-react";
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

type MainView = "chat" | "itinerary";
type SideTab = "chat" | "map";
type MobileView = "chat" | "itinerary" | "map";

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
    const [mainView, setMainView] = useState<MainView>("chat");
    const [sideTab, setSideTab] = useState<SideTab>("map");
    const [mobileView, setMobileView] = useState<MobileView>("chat");
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
        setMainView("chat");
        setSideTab("map");
        setMobileView("chat");
        setSidebarOpen(false);
        setMapLocation({});
    };

    const openSavedTrip = (trip: SavedTrip) => {
        setTripDetail(trip.tripDetail);
        setActiveTripId(trip.tripId);
        setMainView("itinerary");
        setSideTab("chat");
        setMobileView("itinerary");
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
        setMainView("itinerary");
        setSideTab("chat");
        setMobileView("itinerary");
    };

    const handleLocationDetected = (location: {
        source?: string;
        destination?: string;
    }) => {
        setMapLocation((current) => ({ ...current, ...location }));
    };

    // Kept as a single mounted instance so switching its column on "View Trip"
    // never resets the conversation.
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

    const tabClass = (active: boolean) =>
        `flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
            active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
        }`;

    const itineraryPanel = (
        <div className='flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border bg-card shadow-sm'>
            <div className='flex shrink-0 items-end justify-between gap-3 border-b px-4 py-3'>
                <div className='min-w-0'>
                    <p className='text-xs font-medium uppercase tracking-wide text-muted-foreground'>
                        Your itinerary
                    </p>
                    <h2 className='truncate text-xl font-semibold'>
                        {tripDetail?.destination || "Your trip"}
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

            <div className='min-h-0 flex-1 overflow-y-auto p-3'>
                <Itinerary key={activeTripId ?? "trip"} tripData={tripDetail} />
            </div>
        </div>
    );

    const mapPanel = (
        <div className='h-full w-full overflow-hidden rounded-b-2xl border border-t-0 bg-slate-950 shadow-sm'>
            <GlobalMap
                source={mapLocation.source}
                destination={mapLocation.destination}
                interactive
            />
        </div>
    );

    const mobileTabs = [
        { value: "chat", label: "Chat", Icon: MessageSquare },
        { value: "itinerary", label: "Trip", Icon: List },
        { value: "map", label: "Map", Icon: Globe2 },
    ] as const;

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
                {/* Mobile tab bar */}
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

                    <div className='flex min-w-0 flex-1 items-center gap-1 rounded-lg bg-muted p-1'>
                        {mobileTabs.map(({ value, label, Icon }) => (
                            <button
                                key={value}
                                type='button'
                                disabled={value === "itinerary" && !tripDetail}
                                onClick={() => setMobileView(value)}
                                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${tabClass(
                                    mobileView === value
                                )}`}
                            >
                                <Icon className='h-3.5 w-3.5' />
                                {label}
                            </button>
                        ))}
                    </div>

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

                {/* All views stay mounted; CSS decides what is visible and
                    where, so switching tabs never loses the conversation. */}
                <div className='grid min-h-0 flex-1 grid-cols-1 grid-rows-[auto_minmax(0,1fr)] overflow-hidden lg:grid-cols-[52%_48%]'>
                    {/* Chat */}
                    <div
                        className={`col-start-1 row-start-1 row-span-2 min-h-0 min-w-0 p-3 sm:p-4 ${
                            mainView === "chat"
                                ? "lg:col-start-1 lg:row-start-1 lg:row-span-2 lg:border-r"
                                : "lg:col-start-2 lg:row-start-2 lg:row-span-1"
                        } ${mobileView === "chat" ? "" : "hidden lg:block"} ${
                            mainView === "chat" || sideTab === "chat"
                                ? "lg:block"
                                : "lg:hidden"
                        }`}
                    >
                        {chat}
                    </div>

                    {/* Itinerary */}
                    <div
                        className={`col-start-1 row-start-1 row-span-2 min-h-0 min-w-0 p-3 sm:p-4 lg:col-start-1 lg:row-start-1 lg:row-span-2 lg:border-r ${
                            mobileView === "itinerary" ? "" : "hidden lg:block"
                        } ${mainView === "itinerary" ? "lg:block" : "lg:hidden"}`}
                    >
                        {itineraryPanel}
                    </div>

                    {/* Right column header: Chat / Map once a trip exists. */}
                    <div
                        className={`hidden px-3 pt-3 sm:px-4 sm:pt-4 lg:col-start-2 lg:row-start-1 lg:block lg:pb-0 ${
                            mobileView === "map" ? "pt-3 sm:pt-4" : ""
                        }`}
                    >
                        <div className='flex items-center justify-between gap-2 rounded-t-2xl border border-b-0 bg-card px-3 py-2'>
                            {mainView === "itinerary" ? (
                                <div className='flex items-center gap-1 rounded-lg bg-muted p-1'>
                                    <button
                                        type='button'
                                        onClick={() => setSideTab("chat")}
                                        className={tabClass(sideTab === "chat")}
                                    >
                                        <MessageSquare className='h-3.5 w-3.5' />
                                        Chat
                                    </button>
                                    <button
                                        type='button'
                                        onClick={() => setSideTab("map")}
                                        className={tabClass(sideTab === "map")}
                                    >
                                        <Globe2 className='h-3.5 w-3.5' />
                                        Map
                                    </button>
                                </div>
                            ) : (
                                <span className='text-xs font-medium'>Trip map</span>
                            )}

                            <span className='min-w-0 truncate text-xs text-muted-foreground'>
                                {mapLocation.destination || "Explore the globe"}
                            </span>
                        </div>
                    </div>

                    {/* Globe */}
                    <div
                        className={`col-start-1 row-start-1 row-span-2 min-h-0 min-w-0 px-3 pb-3 pt-3 sm:px-4 sm:pb-4 sm:pt-4 lg:col-start-2 lg:row-start-2 lg:row-span-1 lg:pt-0 ${
                            mobileView === "map" ? "" : "hidden lg:block"
                        } ${
                            mainView === "chat" || sideTab === "map"
                                ? "lg:block"
                                : "lg:hidden"
                        }`}
                    >
                        {mapPanel}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreateNewTrip;
