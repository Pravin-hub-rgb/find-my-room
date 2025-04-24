// app/rooms/[id]/page.tsx
import { getRoomById } from '@/lib/getRoomById';
import Image from 'next/image';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import RoomMap from '@/components/RoomMap'; // Import the new map component
import RoomDetailMap from '@/components/RoomDetailMap';
import MapWrapper from '@/components/MapWrapper';

interface RoomPageProps {
    params: { id: string };
}

export default async function RoomPage({ params }: RoomPageProps) {
    // Fetching room data from the server
    const room = await getRoomById(params.id);

    if (!room) {
        return <div className="p-6">Room not found</div>;
    }

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-8">
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
                <h1 className="text-3xl font-bold mb-2">{room.title}</h1>
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
