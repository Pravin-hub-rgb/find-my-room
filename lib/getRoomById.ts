// lib/getRoomById.ts
import { supabase } from './supabaseClient';

export async function getRoomById(id: string) {
  const { data, error } = await supabase
    .from('rooms')
    .select('*, profiles(name)')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching room:', error.message);
    return null;
  }

  return data;
}
