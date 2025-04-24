'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { supabase } from '@/lib/supabaseClient'; // Adjust path as needed
import { Room } from '@/types/room';

// Dynamically import the Map component with no SSR
const MapComponent = dynamic(
  () => import('./MapComponent'),
  { 
    ssr: false,
    loading: () => <div className="h-[500px] w-full bg-gray-100 flex items-center justify-center">Loading map...</div>
  }
);

export default function RoomMap() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchRooms() {
      try {
        const { data, error } = await supabase
          .from('rooms')
          .select('*');
          
        if (error) {
          console.error('Error fetching rooms:', error);
          return;
        }
        
        setRooms(data || []);
      } catch (err) {
        console.error('Unexpected error:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchRooms();
  }, []);

  if (loading) {
    return <div className="h-[500px] w-full bg-gray-100 flex items-center justify-center">Loading rooms data...</div>;
  }
  
  // Filter out rooms without lat/lng
  const roomsWithLocation = rooms.filter(
    (room): room is Room & { latitude: number; longitude: number } => 
      room.latitude !== null && 
      room.longitude !== null &&
      typeof room.latitude === 'number' &&
      typeof room.longitude === 'number'
  );
  
  return (
    <div className="h-[500px] w-full">
      <MapComponent rooms={roomsWithLocation} />
    </div>
  );
}