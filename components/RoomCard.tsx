// components/RoomCard.tsx

'use client'

import { FC } from 'react'
import { Button } from '@/components/ui/button'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import Image from 'next/image'
import Link from 'next/link'
import StarRating from './StarRating'

interface RoomCardProps {
  room: {
    id: string
    image_urls: string[]
    district: string
    state: string
    price: number
    bhk_type: string
    created_at: string
    profiles?: { name: string }
  }
}

const RoomCard: FC<RoomCardProps> = ({ room }) => {
  return (
    <div
      key={room.id}
      className="border rounded p-3 shadow-sm hover:shadow-md transition text-sm"
    >
      <div className="relative w-full">
        <Carousel className="w-full">
          <CarouselContent>
            {room.image_urls.map((url, index) => (
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
}

export default RoomCard
