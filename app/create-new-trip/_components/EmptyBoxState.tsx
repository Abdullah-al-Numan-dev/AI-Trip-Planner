import { suggestions } from '@/app/_components/Hero'
import React from 'react'

function EmptyBoxState({onSelectOption}: any) {
    return (
        <div className='mt-9'>
            <h2 className='font-bold text-3xl text-center'>Start Planning your <strong className='text-primary'>Trip</strong> using AI</h2>
            <p className='text-center text-gray-400 mt-2'>Discover personalized travel itineraries, find the best destinations, and plan your dream vacation effortlessly with the power of AI. Let our smart assistant do the hard work while you enjoy the journey.</p>
            
            <div className='max-w-4xl w-full mt-6 flex flex-wrap justify-center gap-3'>
                {suggestions.map((suggestion, index) => (
                    <div
                        key={index}
                        onClick={() => onSelectOption(suggestion.title)}
                        className='flex items-center gap-2 border rounded-full px-4 py-2.5 cursor-pointer hover:bg-primary/10 hover:border-primary/40 transition-colors'
                    >
                        <div className='text-primary'>
                            {suggestion.icon}
                        </div>

                        <h2 className='text-sm font-medium'>
                            {suggestion.title}
                        </h2>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default EmptyBoxState