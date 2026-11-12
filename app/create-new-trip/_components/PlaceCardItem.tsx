"use client"
import { Button } from '@/components/ui/button'
import { Clock, ExternalLink, MapPin, Star, Ticket } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import type { Activity } from './types'
import { FALLBACK_IMAGE } from './image'
import { usePlaceDetails } from './usePlaceDetails'

type Props = {
    activity: Activity
    destination?: string
}

function PlaceCardItem({ activity, destination }: Props) {
    const placeName = activity?.place_name || activity?.place_address || ''

    const {
        photoUrl,
        place,
        photoScope,
        photoCreditUrl,
        photoCreditTitle,
        setPhotoUrl,
    } = usePlaceDetails(placeName, {
        fallbackImage: activity?.place_image_url,
        context: activity?.place_address,
        destination,
        type: 'place',
    })

    const address = place?.address || activity?.place_address
    const mapsUrl =
        place?.googleMapsUri ||
        'https://www.google.com/maps/search/?api=1&query=' +
            encodeURIComponent(
                `${activity?.place_name || ''} ${activity?.place_address || ''}`
            )

    return (
        <div className='flex flex-col gap-1'>
            <div className='relative'>
                <Image
                    src={photoUrl}
                    width={400}
                    height={200}
                    alt={activity?.place_name || 'place-image'}
                    className='object-cover rounded-xl w-full h-[180px]'
                    onError={() => setPhotoUrl(FALLBACK_IMAGE)}
                    unoptimized
                />
                {photoScope === 'destination' ? (
                    <span className='absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white'>
                        Representative photo
                    </span>
                ) : photoUrl === FALLBACK_IMAGE ? (
                    <span className='absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white'>
                        Photo unavailable
                    </span>
                ) : null}
            </div>

            <h2 className='font-semibold text-lg line-clamp-1'>
                {activity?.place_name || place?.name}
            </h2>
            <p className='text-muted-foreground line-clamp-2 text-sm'>
                {activity?.place_details}
            </p>

            {address && (
                <p className='flex items-center gap-1 text-xs text-muted-foreground line-clamp-1'>
                    <MapPin className='w-3.5 h-3.5 shrink-0' /> {address}
                </p>
            )}

            {place?.rating != null && (
                <p className='flex items-center gap-1 text-sm text-yellow-500'>
                    <Star className='w-4 h-4' /> {place.rating}
                    {place.userRatingCount ? (
                        <span className='text-xs text-muted-foreground'>
                            ({place.userRatingCount})
                        </span>
                    ) : null}
                </p>
            )}

            <h2 className='flex items-center gap-2 text-blue-500 line-clamp-1 text-sm mt-1'>
                <Ticket className='w-4 h-4' /> {activity?.ticket_pricing}
            </h2>
            <p className='flex items-center text-orange-400 gap-2 line-clamp-1 text-sm'>
                <Clock className='w-4 h-4' /> {activity?.best_time_to_visit}
            </p>
            <Link href={mapsUrl} target='_blank'>
                <Button
                    size={'sm'}
                    variant={'outline'}
                    className='w-full mt-2 flex items-center gap-1'
                >
                    View <ExternalLink className='w-4 h-4' />
                </Button>
            </Link>

            {photoCreditUrl && (
                <a
                    href={photoCreditUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-[10px] text-muted-foreground line-clamp-1 hover:underline'
                >
                    Photo: {photoCreditTitle || 'Wikimedia Commons'}
                </a>
            )}
        </div>
    )
}

export default PlaceCardItem
