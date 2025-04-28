'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import RoomCard from './RoomCard'
import Image from 'next/image'

interface Review {
  rating: number;
}

interface RoomWithRelations {
  id: string;
  image_urls: string[];
  district: string;
  state: string;
  price: number;
  bhk_type: string;
  created_at: string;
  profiles?: {
    name: string;
  };
  reviews?: Review[];
  // Add other room properties as needed
  title?: string;
  locality: string;
  room_type?: string;
}

export default function RecentRooms() {
  const [rooms, setRooms] = useState<RoomWithRelations[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchRecentRooms = async () => {
      setLoading(true)

      const { data, error } = await supabase
        .from('rooms')
        .select('*, profiles(name), reviews(rating)')
        .order('created_at', { ascending: false })
        .limit(6)

      if (error) {
        console.error('Error fetching recent rooms:', error.message)
      } else {
        setRooms(
          (data || []).map((room) => ({
            ...room,
            image_urls: Array.isArray(room.image_urls) ? room.image_urls : [],
            bhk_type: room.bhk_type || '', // Ensure bhk_type exists
            locality: room.locality || 'Not specified'
          }))
        )
      }

      setLoading(false)
    }

    fetchRecentRooms()
  }, [])

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">Recently Posted Rooms <Image
        src="/mainxx.png"
        alt="Logo"
        width={50}
        height={50}
      /> </h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 md:grid-cols-3 md:gap-3 lg:grid-cols-4 lg:gap-4 mt-4">
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      )}
    </div>
  )
}