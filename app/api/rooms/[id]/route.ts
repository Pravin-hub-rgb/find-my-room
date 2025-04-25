// app/api/rooms/[id]/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  // Extract the ID using destructuring after awaiting context
  const { id } = await Promise.resolve(context.params);
  
  // Get authorization token from request header
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized: Missing or invalid authorization header' }, { status: 401 });
  }
  
  const token = authHeader.split(' ')[1];
  
  // Create Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Verify token and get user
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !user) {
    console.error('Auth error:', authError);
    return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
  }
  
  // Check if the room belongs to the authenticated user
  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('user_id')
    .eq('id', id)
    .single();
    
  if (roomError || !room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  }
  
  if (room.user_id !== user.id) {
    return NextResponse.json({ error: 'Unauthorized: You can only delete your own rooms' }, { status: 403 });
  }
  
  // Delete the room
  const { error: deleteError } = await supabase
    .from('rooms')
    .delete()
    .eq('id', id);
    
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }
  
  return NextResponse.json({ success: true, message: 'Room deleted successfully' });
}