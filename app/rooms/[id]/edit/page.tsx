import { EditRoomForm } from "./EditRoomPage";

interface PageProps {
  params: Promise<{ [key: string]: string }>;
}

export default async function EditRoomPage({ params }: PageProps) {
  const paramsValue = await params;
  return <EditRoomForm roomId={paramsValue.id} />;
}
