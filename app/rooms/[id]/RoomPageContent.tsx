// app/rooms/[id]/RoomPageContent.tsx
'use client';

import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import MapWrapper from '@/components/MapWrapper';
import { PencilIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function RoomPageContent({ room, id }: { room: any, id: string }) {
  const [isOwner, setIsOwner] = useState(false);
  
  useEffect(() => {
    async function checkOwnership() {
      // Get current logged in user
      const { data } = await supabase.auth.getUser();
      // Check if current user is the owner of the room
      setIsOwner(data.user?.id === room.user_id);
    }
    
    checkOwnership();
  }, [room.user_id]);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header with title and edit button */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{room.title || "Room Details"}</h1>
        {isOwner && (
          <Link href={`/rooms/${id}/edit`}>
            <Button variant="outline" className="flex items-center gap-2">
              <PencilIcon size={16} />
              Edit Room
            </Button>
          </Link>
        )}
      </div>
      
      {/* Carousel */}
      {Array.isArray(room.image_urls) && room.image_urls.length > 0 && (
        <div className="relative w-full">
          <Carousel className="w-full">
            <CarouselContent>
              {room.image_urls.map((url: string, index: number) => (
                <CarouselItem key={index}>
                  <div className="relative h-[400px] w-full">
                    <Image
                      src={url}
                      alt={`Room image ${index + 1}`}
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
      )}
      
      {/* Room Info */}
      <div>
        <p className="text-gray-700 mb-4 text-lg">{room.description}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p><strong>Room Type:</strong> {room.room_type}</p>
            <p><strong>Price:</strong> ₹{room.price}</p>
            <p><strong>Available At:</strong> {room.locality}, {room.district}, {room.state}</p>
          </div>
          <div>
            <p><strong>Posted on:</strong> {new Date(room.created_at).toLocaleDateString()}</p>
            <p><strong>Posted by:</strong> {room.profiles?.name || 'Unknown User'}</p>
          </div>
          <div>
            <p><strong>Description: </strong>{room.description}</p>
          </div>
        </div>
      </div>
      
      {/* RoomDetailMap for showing a single pin */}
      {room.latitude && room.longitude ? (
        <div className="h-[400px] w-full">
          <MapWrapper room={room} />
        </div>
      ) : (
        <p>No location data available</p>
      )}
    </div>
  );
}