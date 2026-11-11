"use client"

import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import { Star, Wallet } from 'lucide-react'
import type { Hotel } from './types'
import { FALLBACK_IMAGE } from './image'
import { usePlaceDetails } from './usePlaceDetails'

type Props = {
    hotel: Hotel
    destination?: string
}

function HotelCardItem({ hotel, destination }: Props) {
    const placeName = hotel?.hotel_name || hotel?.hotel_address || ''

    const {
        photoUrl,
        place,
        photoScope,
        photoCreditUrl,
        photoCreditTitle,
        setPhotoUrl,
    } = usePlaceDetails(placeName, {
        fallbackImage: hotel?.hotel_image_url,
        context: hotel?.hotel_address,
        destination,
        type: 'hotel',
    })

    const address = place?.address || hotel?.hotel_address
    const rating = place?.rating ?? hotel?.rating
    const mapsUrl =
        place?.googleMapsUri ||
        'https://www.google.com/maps/search/?api=1&query=' +
            encodeURIComponent(
                `${hotel?.hotel_name || ''} ${hotel?.hotel_address || ''}`
            )

    return (
        <div className='flex flex-col gap-1'>
            <div className='relative'>
                <Image
                    src={photoUrl}
                    alt={hotel?.hotel_name || 'hotel-image'}
                    width={400}
                    height={200}
                    className='w-full h-[180px] rounded-xl shadow object-cover mb-2'
                    onError={() => setPhotoUrl(FALLBACK_IMAGE)}
                    unoptimized
                />
                {photoScope === 'destination' ? (
                    <span className='absolute bottom-4 left-2 rounded bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white'>
                        Representative photo
                    </span>
                ) : photoUrl === FALLBACK_IMAGE ? (
                    <span className='absolute bottom-4 left-2 rounded bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white'>
                        Photo unavailable
                    </span>
                ) : null}
            </div>

            <h2 className='font-semibold text-lg'>{hotel?.hotel_name}</h2>
            <h2 className='text-gray-500 text-sm line-clamp-1'>{address}</h2>

            {hotel?.description && (
                <p className='text-xs text-gray-500 line-clamp-2'>
                    {hotel.description}
                </p>
            )}

            <div className='flex justify-between items-center my-1'>
                <p className='flex gap-1 items-center text-sm text-green-600'>
                    <Wallet className='w-4 h-4' /> {hotel?.price_per_night}
                </p>
                {rating != null && (
                    <p className='flex gap-1 items-center text-sm text-yellow-500'>
                        <Star className='w-4 h-4' /> {rating}
                        {place?.userRatingCount ? (
                            <span className='text-xs text-gray-400'>
                                ({place.userRatingCount})
                            </span>
                        ) : null}
                    </p>
                )}
            </div>

            <Link href={mapsUrl} target='_blank'>
                <Button variant={'outline'} className='mt-1 w-full'>
                    View Details
                </Button>
            </Link>

            {photoCreditUrl && (
                <a
                    href={photoCreditUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-[10px] text-gray-400 line-clamp-1 hover:underline'
                >
                    Photo: {photoCreditTitle || 'Wikimedia Commons'}
                </a>
            )}
        </div>
    )
}

export default HotelCardItem
