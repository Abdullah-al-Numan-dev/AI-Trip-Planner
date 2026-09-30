
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const menuOption=[
    {
        name:'Home',
        path:'/'
    },
    {
        name:'Pricing',
        path:'/pricing'
    },
    {
        name:'Contact us',
        path:'/contact'
    }
]

function Header() {
  return (
    <div className='flex justify-between items-center p-5'>

        {/* Logo */}
        <div className='flex gap-2 items-center'>

            <Image src={'/logo.svg'} alt='logo' width={30} height={30} />
            <h3 className='font-bold text-2xl'>AI Trip Planner</h3>

        </div>
        
        {/* Menu Option */}
        <div className='flex gap-8 items-center'>
            {menuOption.map((menu, index) =>(
                <Link href={menu.path}>
                    <h2 className='text-lg hover:scale-105 transition-all hover:text-primary '>{menu.name}</h2>
                </Link>
            ))}
        </div>
        {/* Get Started Button */}
        <Button>Get Started</Button>


    </div>
  )
}

export default Header