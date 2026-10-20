"use client"
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send } from 'lucide-react'
import React, { useState } from 'react'
import axios from 'axios'

type Message = {
    role: string,
    content: string
}

function ChatBox() {

    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState<string>();

    const onSend = async() => {

        if(!userInput?.trim()) return;

        setUserInput('');
        const newMsg: Message={
            role: 'user',
            content: userInput
        }

        setMessages((prev:Message[]) => [...prev, newMsg]);

        const result = await axios.post('/api/aimodel',{
            messages:[...messages,newMsg]
        })
    }
    return (
        <div className='h-[100vh] flex flex-col '>
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
                    <Textarea id="trip-planner-input" placeholder='Create a trip for Paris from New York' className='w-full min-h-32 bg-transparent border-none focus-visible:ring-0 shadow-none resize-none text-base pr-14'
                        onChange={(event)=>setUserInput(event.target.value ?? '')}
                        value={userInput}
                     />
                    <Button size={'icon'} className='absolute bottom-5 right-5 rounded-full' onClick={() => onSend()}>
                        <Send className='h-4 w-4' />
                    </Button>
                </div>

            </section>
        </div>
    )
}

export default ChatBox