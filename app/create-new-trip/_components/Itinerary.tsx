"use client";

import React, { useRef } from 'react'
import { Timeline } from "@/components/ui/timeline";
import HotelCardItem from './HotelCardItem';
import PlaceCardItem from './PlaceCardItem';
import type { TripPlan } from './types';

type Props = {
    tripData?: TripPlan | null;
};

function Itinerary({ tripData }: Props) {
    const scrollRef = useRef<HTMLDivElement>(null);

    if (!tripData) {
        return (
            <div className='flex h-full min-h-0 items-center justify-center rounded-2xl border border-dashed p-8 text-center'>
                <div>
                    <h2 className='text-lg font-semibold text-foreground'>
                        Your itinerary will appear here
                    </h2>
                    <p className='mt-1 text-sm text-muted-foreground'>
                        Answer the questions in the chat and we&apos;ll show
                        hotels and a day-by-day plan for your trip.
                    </p>
                </div>
            </div>
        );
    }

    const hotels = Array.isArray(tripData.hotels) ? tripData.hotels : [];
    const itinerary = Array.isArray(tripData.itinerary)
        ? tripData.itinerary
        : [];

    const data = [
        {
            title: "Recommended Hotels",
            content:
                hotels.length > 0 ? (
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
                        {hotels.map((hotel, index) => (
                            <HotelCardItem
                                key={`${hotel?.hotel_name ?? 'hotel'}-${index}`}
                                hotel={hotel}
                                destination={tripData.destination}
                            />
                        ))}
                    </div>
                ) : (
                    <p className='text-sm text-muted-foreground'>
                        No hotels were returned for this trip.
                    </p>
                ),
        },
        ...itinerary.map((dayData, dayIndex) => ({
            title: `Day ${dayData?.day ?? dayIndex + 1}`,
            content: (
                <div key={`day-${dayData?.day ?? dayIndex}`}>
                    {dayData?.day_plan && (
                        <p className='text-sm text-foreground'>
                            {dayData.day_plan}
                        </p>
                    )}

                    {dayData?.best_time_to_visit_day && (
                        <p className='mt-1 text-sm text-muted-foreground'>
                            Best Time: {dayData.best_time_to_visit_day}
                        </p>
                    )}

                    <div className='mt-3 grid grid-cols-1 md:grid-cols-2 gap-4'>
                        {(dayData?.activities ?? []).map(
                            (activity, activityIndex) => (
                                <PlaceCardItem
                                    key={`${dayIndex}-${activityIndex}-${activity?.place_name ?? 'place'}`}
                                    activity={activity}
                                    destination={tripData.destination}
                                />
                            )
                        )}
                    </div>
                </div>
            ),
        })),
    ];

    return (
        <div
            ref={scrollRef}
            className='relative h-full min-h-0 w-full overflow-auto'
        >
            <Timeline
                data={data}
                tripData={tripData}
                scrollContainer={scrollRef}
            />
        </div>
    );
}

export default Itinerary;
