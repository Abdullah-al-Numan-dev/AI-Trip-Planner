"use client";

import React, { useState } from 'react'
import ChatBox from './_components/ChatBox'
import Itinerary from './_components/Itinerary'
import type { TripPlan } from './_components/types'

function CreateNewTrip() {
    const [tripDetail, setTripDetail] = useState<TripPlan | null>(null)

    const handleViewTrip = () => {
        document
            .getElementById('trip-itinerary')
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    return (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-5 p-10'>
            <div>
                <ChatBox
                    onTripGenerated={setTripDetail}
                    onViewTrip={handleViewTrip}
                />
            </div>
            <div id='trip-itinerary'>
                <Itinerary tripData={tripDetail} />
            </div>
        </div>
    )
}

export default CreateNewTrip
