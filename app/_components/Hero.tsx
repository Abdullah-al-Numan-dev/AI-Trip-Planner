import { Button } from '@/components/ui/button'
import { HeroVideoDialog } from '@/components/ui/hero-video-dialog'
import { Textarea } from '@/components/ui/textarea'
import { ArrowDown, Globe2, Landmark, Plane, Send } from 'lucide-react'
import React from 'react'

const suggestions = [
    {
        title: 'Create New Trip',
        icon: <Globe2 className='text-blue-400 h-5 w-5' />
    },
    {
        title: 'Inspire me where to go',
        icon: <Plane className='text-green-500 h-5 w-5' />
    },
    {
        title: 'Discover Hidden gems',
        icon: <Landmark className='text-orange-500 h-5 w-5' />
    },
    {
        title: 'Adventure Destination',
        icon: <Globe2 className='text-yellow-600 h-5 w-5' />
    },
]

function Hero() {
    return (
        <div className='mt-24 w-full flex flex-col items-center'>

            {/* Content  */}
            <div className='max-w-3xl w-full text-center space-y-6'>
                <h1 className='text-xl md:text-5xl font-bold'>Hey, I'm your personal <span className='text-primary'>Trip Planner</span></h1>
                <p className='text-lg'>Tell me what you want, and I'll handle the rest: Flights, Hotels, trip planner - all in seconds</p>
            </div>

            {/* Input Box  */}
            <div className='max-w-3xl w-full mt-10'>
                <div className='border rounded-2xl p-5 relative shadow-sm bg-background'>
                    <Textarea placeholder='Create a trip for Parise from New york' className='w-full min-h-32 bg-transparent border-none focus-visible:ring-0 shadow-none resize-none text-base pr-14' />
                    <Button size={'icon'} className='absolute bottom-5 right-5 rounded-full'>
                        <Send className='h-4 w-4' />
                    </Button>
                </div>
            </div>

            {/* Suggestion list  */}
            <div className='max-w-4xl w-full mt-6 flex flex-wrap justify-center gap-3'>
                {suggestions.map((suggestion, index) => (
                    <div
                        key={index}
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

            <div className='mt-14 mb-7 flex items-center justify-center gap-2 text-muted-foreground'>
                <h2>
                    Not sure where to start?
                </h2>

                <strong className='text-foreground'>
                    See how it works
                </strong>

                <ArrowDown className='h-4 w-4' />
            </div>

            {/* Video Section  */}
            <div className="max-w-4xl w-full relative overflow-hidden rounded-2xl">
                <HeroVideoDialog
                    className="block dark:hidden"
                    animationStyle="from-center"
                    videoSrc="https://www.youtube.com/embed/qh3NGpYRG3I?si=4rb-zSdDkVK9qxxb"
                    thumbnailSrc="https://startup-template-sage.vercel.app/hero-light.png"
                    thumbnailAlt="Hero Video"
                />
            </div>

        </div>
    )
}

export default Hero