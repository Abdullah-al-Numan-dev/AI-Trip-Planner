import { PricingTable } from '@clerk/nextjs'
import React from 'react'

function Pricing() {
    return (
        <div className='mt-20'>
            <h2 className='font-bold text-3xl my-5 text-center'>AI-Powered Trip Planning</h2>
            <p className='mb-6 text-center text-sm text-muted-foreground'>
                Start for free. Upgrade to Pro for unlimited trip plans.
            </p>
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem' }}>
                <PricingTable />
            </div>
        </div>
    )
}

export default Pricing