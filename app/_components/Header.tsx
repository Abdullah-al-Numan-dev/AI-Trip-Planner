"use client"
import { Button } from '@/components/ui/button'
import { SignInButton, useUser } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import ThemeToggle from './ThemeToggle'

const menuOption = [
    {
        name: 'Home',
        path: '/'
    },
    {
        name: 'Pricing',
        path: '/pricing'
    },
    {
        name: 'Contact us',
        path: '/contact'
    }
]

function Header() {

    const { user } = useUser();

    return (
        <div className='flex shrink-0 items-center justify-between gap-3 p-4 md:p-5'>

            {/* Logo */}
            <div className='flex min-w-0 gap-2 items-center'>

                <Image src={'/logo.svg'} alt='logo' width={30} height={30} className='h-7 w-7 md:h-[30px] md:w-[30px]' />
                <h3 className='truncate text-lg font-bold md:text-2xl'>AI Trip Planner</h3>

            </div>

            {/* Menu Option */}
            <div className='hidden gap-8 items-center md:flex'>
                {menuOption.map((menu) => (
                    <Link key={menu.path} href={menu.path}>
                        <h2 className='text-lg hover:scale-105 transition-all hover:text-primary '>{menu.name}</h2>
                    </Link>
                ))}
            </div>
            {/* Theme + Get Started */}
            <div className='flex shrink-0 items-center gap-2'>
                <ThemeToggle />

                {!user ? <SignInButton mode='modal'>
                    <Button className='whitespace-nowrap'>Get Started</Button>
                </SignInButton> :
                    <Link href={'/create-new-trip'}>
                        <Button className='whitespace-nowrap'>Create New Trip</Button>
                    </Link>
                }
            </div>


        </div>
    )
}

export default Header