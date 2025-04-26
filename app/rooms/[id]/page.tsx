// app/rooms/[id]/page.tsx
import { getRoomById } from '@/lib/getRoomById';
import RoomPageContent from './RoomPageContent';
import ReviewsSection from '@/components/ReviewSection';
interface RoomPageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function RoomPage({ params }: RoomPageProps) {
  // Await the params object before accessing its properties
  const resolvedParams = await params;
  const id = resolvedParams.id;

  // Fetching room data from the server
  const room = await getRoomById(id);
  const reviews = room.reviews || [];
  if (!room) {
    return <div className="p-6">Room not found</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <RoomPageContent room={room} id={id} reviews={reviews} />
    </div>
  );
}
