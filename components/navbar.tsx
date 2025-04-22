'use client'

import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function Navbar() {
  return (
    <nav className="w-full bg-white border-b px-6 py-4 flex items-center justify-between">
      <Link href="/" className="text-xl font-semibold text-blue-600">
        RoomRental
      </Link>

      <div className="flex items-center gap-4">
        <Link href="/rooms" className="text-sm hover:underline">
          Browse Rooms
        </Link>

        <Link href="/post-room" className="text-sm hover:underline">
          Post a Room
        </Link>

        <Link href="/login">
          <Button size="sm">Login</Button>
        </Link>
      </div>
    </nav>
  )
}
