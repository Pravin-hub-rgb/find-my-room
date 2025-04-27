// components/RecentRooms.tsx

'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import RoomCard from './RoomCard'

export default function RecentRooms() {
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchRecentRooms = async () => {
      setLoading(true)

      const { data, error } = await supabase
        .from('rooms')
        .select('*, profiles(name), reviews(rating)') // <-- Fetch reviews' ratings
        .order('created_at', { ascending: false })
        .limit(6)

      if (error) {
        console.error('Error fetching recent rooms:', error.message)
      } else {
        setRooms(
          (data || []).map((room) => ({
            ...room,
            image_urls: Array.isArray(room.image_urls) ? room.image_urls : [],
          }))
        )
      }

      setLoading(false)
    }

    fetchRecentRooms()
  }, [])

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Recently Posted Rooms</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      )}
    </div>
  )
}
