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
    locality: string
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
      className="border rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition duration-300 text-sm flex flex-col h-full"
    >
      <div className="relative w-full">
        <Carousel className="w-full">
          <CarouselContent>
            {room.image_urls.map((url, index) => (
              <CarouselItem key={index}>
                <div className="relative h-56 w-full">
                  <Image
                    src={url}
                    alt={`Room image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {room.image_urls.length > 1 && (
            <>
              <CarouselPrevious className="absolute left-2 h-8 w-8 bg-white/70 hover:bg-white" />
              <CarouselNext className="absolute right-2 h-8 w-8 bg-white/70 hover:bg-white" />
            </>
          )}
        </Carousel>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        {/* Top Row: Price and BHK Type */}
        <div className="flex justify-between items-center mb-2">
          <div className="whitespace-nowrap">
            <span className="font-bold text-lg">₹{room.price}</span>
            <span className="text-sm font-normal text-gray-600">/month</span>
          </div>
          <p className="font-medium text-gray-800">{room.bhk_type}</p>
        </div>

        {/* Rating Row */}
        <div className="flex justify-end mb-2">
          <StarRating roomId={room.id} />
        </div>

        {/* Location */}
        <p className="text-xs text-gray-600 mb-3">
          {room.locality && room.locality.toLowerCase() !== room.district.toLowerCase()
            ? room.locality + ' '
            : ''}
          {room.district}, {room.state}
        </p>

        {/* Bottom Info Section */}
        <div className="text-xs text-gray-500 mt-auto mb-2">
          <div className="flex items-center justify-between">
            <p>Posted: {new Date(room.created_at).toLocaleDateString()}</p>
            <p>By: {room.profiles?.name || 'Unknown'}</p>
          </div>
        </div>

        <Button asChild className="w-full py-2 mt-2 bg-gray-700 hover:bg-gray-800 text-white font-medium">
          <Link href={`/rooms/${room.id}`}>View Details</Link>
        </Button>
      </div>
    </div>
  )
}

export default RoomCard
