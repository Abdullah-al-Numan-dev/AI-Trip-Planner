"use client";
import React, { useEffect } from 'react'
import Header from './_components/Header'
import { useMutation } from 'convex/react'
import { useUser } from '@clerk/nextjs'
import { api } from '@/convex/_generated/api';

function Provider({ children }: Readonly<{ children: React.ReactNode }>) {

  const CreateUser = useMutation(api.user.CreateNewUser)

  const { user } = useUser();

  useEffect(() => {
    user && CreateNewUser();
  }, [user])

  const CreateNewUser = async () => {
    // Save new user if not exists
    if (user) {
      const result = await CreateUser({

        email: user?.primaryEmailAddress?.emailAddress ?? '',
        imageUrl: user?.imageUrl,
        name: user?.fullName ?? ''
      });
    }
  }
  return (
    <div>
      <Header />
      {children}</div>
  )
}

export default Provider