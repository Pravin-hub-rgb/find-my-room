// Create a new file: components/MapWrapper.tsx
'use client';

import dynamic from 'next/dynamic';
import { Room } from '@/types/room';

// Define the props interface
interface RoomDetailMapProps {
  room: Room & { latitude: number; longitude: number };
}

// Dynamically import the map component with SSR disabled
const DynamicMap = dynamic(
  () => import('./RoomDetailMap'),
  { ssr: false }
);

export default function MapWrapper({ room }: RoomDetailMapProps) {
  return <DynamicMap room={room} />;
}