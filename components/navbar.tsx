'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Button } from "@/components/ui/button"
import type { User } from '@supabase/supabase-js';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data?.user) setUser(data.user)
      else setUser(null)
    }

    getUser()

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      getUser()
    })

    return () => {
      listener?.subscription.unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
  }

  return (
    <nav className="w-full bg-white border-b px-6 py-4 flex items-center justify-between">
      <Link href="/" className="text-xl font-semibold text-blue-600">
        Find My Room
      </Link>

      <div className="flex items-center gap-4">
        <Link href="/rooms" className="text-sm hover:underline">
          Browse Rooms
        </Link>

        <Link href="/post-room" className="text-sm hover:underline">
          Post a Room
        </Link>

        {user ? (
          <Button size="sm" variant="destructive" onClick={handleLogout}>
            Logout
          </Button>
        ) : (
          <>
            <Link href="/auth/login">
              <Button size="sm">Login</Button>
            </Link>
            <Link href="/auth/signup">
              <Button variant="secondary" size="sm">Signup</Button>
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
