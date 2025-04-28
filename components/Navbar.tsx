'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Button } from "@/components/ui/button"
import type { User } from '@supabase/supabase-js'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<{ name: string; state: string; district: string }>({
    name: '',
    state: '',
    district: '',
  })
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (data?.user) {
        setUser(data.user)

        // Fetch updated profile fields: name, state, district
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('name, state, district')
          .eq('id', data.user.id)
          .single()

        if (profileData) {
          setProfile(profileData)
        } else {
          console.error('Error fetching profile:', error?.message)
        }
      } else {
        setUser(null)
      }
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
    <nav className="w-full bg-white border-b px-3 py-1 flex items-center justify-between sticky top-0 z-50 shadow-md">
      <Link href="/" className="flex items-center space-x-2 text-xl font-semibold text-blue-600">
        <Image
          src="/mainxx.png"
          alt="Logo"
          width={32}
          height={32}
        />
        <span>Find My Room</span>
      </Link>

      <div className="flex items-center gap-4 lg:flex hidden">
        <Link href="/rooms" className="text-sm hover:underline">
          Browse Rooms
        </Link>

        <Link href="/post-room" className="text-sm hover:underline">
          Post a Room
        </Link>

        {user ? (
          <>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => router.push('/profile')}
            >
              {profile?.name || user.email?.split('@')[0]}
            </Button>

            <Button size="sm" variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          </>
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

      {/* Hamburger Menu for mobile */}
      <div className="lg:hidden flex items-center">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
          className="relative z-50 p-2 flex flex-col justify-center items-center h-10 w-10"
        >
          <div className="flex flex-col justify-between h-6 w-8">
            <div className={`w-9 h-1 bg-black rounded-full transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-45 translate-y-2.5' : ''}`} />
            <div className={`w-9 h-1 bg-black rounded-full transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-0' : ''}`} />
            <div className={`w-9 h-1 bg-black rounded-full transition-transform duration-300 ease-in-out ${isOpen ? '-rotate-45 -translate-y-2.5' : ''}`} />
          </div>
        </Button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden absolute top-16 right-6 bg-white p-4 shadow-md rounded-md w-38 z-40">
          <div className="flex flex-col gap-2">
            <Link href="/rooms" className="block text-sm hover:underline">
              Browse Rooms
            </Link>
            <Link href="/post-room" className="block text-sm hover:underline">
              Post a Room
            </Link>

            {user ? (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => router.push('/profile')}
                  className="w-full text-left"
                >
                  {profile?.name || user.email?.split('@')[0]}
                </Button>

                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleLogout}
                  className="w-full text-left"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button size="sm" className="w-full text-left">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button variant="secondary" size="sm" className="w-full text-left">
                    Signup
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}

    </nav>
  )
}