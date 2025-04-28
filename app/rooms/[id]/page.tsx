// app/rooms/[id]/page.tsx
import { getRoomById } from '@/lib/getRoomById';
import RoomPageContent from './RoomPageContent';

type RoomPageProps = {
  params: Promise<{ id: string }>;
};

export default async function RoomPage({ params }: RoomPageProps) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const room = await getRoomById(id);
  const reviews = room?.reviews || [];

  if (!room) {
    return <div className="p-6">Room not found</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-1">
      <RoomPageContent room={room} id={id} reviews={reviews} />
    </div>
  );
}
