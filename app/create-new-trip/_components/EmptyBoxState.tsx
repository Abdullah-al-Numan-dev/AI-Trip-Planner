import { suggestions } from '@/app/_components/Hero'
import React from 'react'

function EmptyBoxState({onSelectOption}: any) {
    return (
        <div className='w-full'>
            <h2 className='text-center text-2xl font-bold sm:text-3xl'>Start Planning your <strong className='text-primary'>Trip</strong> using AI</h2>
            <p className='mt-2 text-center text-sm text-muted-foreground sm:text-base'>Discover personalized travel itineraries, find the best destinations, and plan your dream vacation effortlessly with the power of AI. Let our smart assistant do the hard work while you enjoy the journey.</p>
            
            <div className='mt-6 flex w-full max-w-4xl flex-wrap justify-center gap-2 sm:gap-3'>
                {suggestions.map((suggestion, index) => (
                    <button
                        key={index}
                        type='button'
                        onClick={() => onSelectOption(suggestion.title)}
                        className='flex items-center gap-2 rounded-full border px-4 py-2.5 text-left transition-colors hover:border-primary/40 hover:bg-primary/10'
                    >
                        <span className='text-primary'>
                            {suggestion.icon}
                        </span>

                        <span className='text-sm font-medium'>
                            {suggestion.title}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    )
}

export default EmptyBoxState