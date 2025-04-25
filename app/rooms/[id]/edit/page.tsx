// app/rooms/[id]/edit/page.tsx
import { EditRoomForm } from "./EditRoomPage";// Import from separate file

interface EditRoomPageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function EditRoomPage({ params }: EditRoomPageProps) {
  // Await the params object before accessing its properties
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  // Pass the resolved ID to the client component
  return <EditRoomForm roomId={id} />;
}