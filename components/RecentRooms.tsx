'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import Image from 'next/image'
import Link from 'next/link'
import StarRating from './StarRating'

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
          {rooms.map((room) => {
            
            return (
              <div
                key={room.id}
                className="border rounded p-3 shadow-sm hover:shadow-md transition text-sm"
              >
                <div className="relative w-full">
                  <Carousel className="w-full">
                    <CarouselContent>
                      {room.image_urls.map((url: string, index: number) => (
                        <CarouselItem key={index}>
                          <div className="relative h-48 w-full">
                            <Image
                              src={url}
                              alt={`Image ${index + 1}`}
                              fill
                              className="object-cover rounded"
                            />
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="absolute left-2 h-8 w-8" />
                    <CarouselNext className="absolute right-2 h-8 w-8" />
                  </Carousel>
                </div>

                <p className="text-xs text-gray-600">{room.district}, {room.state}</p>
                <p className="mt-1 font-medium">₹{room.price}</p>
                <p className="text-xs italic">{room.bhk_type}</p>

                {/* Average Rating */}
                <StarRating roomId={room.id} />

                <div className="mt-2 text-xs text-gray-500">
                  <p>Posted on: {new Date(room.created_at).toLocaleDateString()}</p>
                  <p>Posted by: {room.profiles?.name || 'Unknown User'}</p>
                </div>

                <Button asChild className="mt-3 w-full text-sm py-2">
                  <Link href={`/rooms/${room.id}`}>View Details</Link>
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
