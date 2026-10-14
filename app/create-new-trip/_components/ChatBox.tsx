"use client"
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send } from 'lucide-react'
import React from 'react'

function ChatBox() {

    const onSend = () => {

    }
    return (
        <div className='h-[85vh] flex flex-col '>
            <section className='flex-1 overflow-y-auto p-4'>

                <div className='flex justify-end mt-2'>
                    <div className='max-w-lg bg-primary text-white px-4 py-2 rounded-lg'>

                        User Messages

                    </div>
                </div>
                <div className='flex justify-start mt-2'>
                    <div className='max-w-lg bg-gray-100 text-black px-4 py-2 rounded-lg'>

                        AI Agent Messages

                    </div>
                </div>

            </section>
            {/* Users Input  */}
            <section>

                <div className='border rounded-2xl p-5 relative shadow-sm bg-background'>
                    <Textarea id="trip-planner-input" placeholder='Create a trip for Paris from New York' className='w-full min-h-32 bg-transparent border-none focus-visible:ring-0 shadow-none resize-none text-base pr-14' />
                    <Button size={'icon'} className='absolute bottom-5 right-5 rounded-full' onClick={() => onSend()}>
                        <Send className='h-4 w-4' />
                    </Button>
                </div>

            </section>
        </div>
    )
}

export default ChatBox