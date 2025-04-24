// lib/getAllRooms.ts
import { createClient } from '@supabase/supabase-js';

// Define the Room type
interface Room {
  id: string | number;
  title: string;
  latitude: number;
  longitude: number;
  locality?: string;
  district?: string;
  state?: string;
}

// Access environment variables using process.env
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function getAllRooms(): Promise<Room[]> {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .select('*');
      
    if (error) {
      console.error('Error fetching rooms:', error.message);
      return [];
    }
    
    return data as Room[];
  } catch (err) {
    console.error('Unexpected error fetching rooms:', err);
    return [];
  }
}