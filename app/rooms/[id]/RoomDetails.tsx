'use client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Image from 'next/image';

// Define a proper type for the room object
interface Room {
  title?: string;
  description: string;
  room_type?: string;
  price: number | string;
  locality: string;
  district: string;
  state: string;
  image_urls?: string[];
  image_url?: string;
}

export default function RoomDetails({ room }: { room: Room }) {
  // Make sure we have an array of strings with no undefined values
  const images: string[] = room.image_urls || (room.image_url ? [room.image_url] : []);
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{room.title}</h1>
      <p className="text-gray-700 mb-4">{room.description}</p>
      <p><strong>Type:</strong> {room.room_type}</p>
      <p><strong>Price:</strong> ₹{room.price}</p>
      <p><strong>Location:</strong> {room.locality}, {room.district}, {room.state}</p>
      {images.length > 0 && (
        <Tabs defaultValue="0" className="mt-6 w-full">
          {images.map((url: string, index: number) => (
            <TabsContent
              key={index}
              value={String(index)}
              className="relative h-[400px] rounded-lg overflow-hidden"
            >
              <Image
                src={url}
                alt={`Image ${index + 1}`}
                fill
                className="object-cover"
              />
            </TabsContent>
          ))}
          <TabsList className="mt-4 flex justify-center gap-2">
            {images.map((_, index: number) => (
              <TabsTrigger
                key={index}
                value={String(index)}
                className="w-3 h-3 rounded-full bg-muted data-[state=active]:bg-primary transition-colors"
              />
            ))}
          </TabsList>
        </Tabs>
      )}
    </div>
  );
}