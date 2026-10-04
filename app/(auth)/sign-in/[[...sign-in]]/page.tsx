import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className='flex items-center justify-between h-screen'>
        <SignIn />
    </div>
  )
}