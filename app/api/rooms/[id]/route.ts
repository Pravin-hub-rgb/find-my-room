import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  const { id } = await Promise.resolve(context.params);
  
  // Regular authentication checks using the normal client...
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized: Missing or invalid authorization header' }, { status: 401 });
  }
  
  const token = authHeader.split(' ')[1];
  
  // Regular client for user authentication
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Verify token and get user
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !user) {
    console.error('Auth error:', authError);
    return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
  }
  
  // Create admin client for privileged operations
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role key
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
  
  // Get the room with image_urls
  const { data: room, error: roomError } = await supabaseAdmin
    .from('rooms')
    .select('user_id, image_urls')
    .eq('id', id)
    .single();
    
  if (roomError || !room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  }
  
  if (room.user_id !== user.id) {
    return NextResponse.json({ error: 'Unauthorized: You can only delete your own rooms' }, { status: 403 });
  }
  
  // Delete images from storage if they exist
  if (room.image_urls && Array.isArray(room.image_urls) && room.image_urls.length > 0) {
    const filesToDelete = room.image_urls.map(imageUrl => {
      // Extract the filename from the URL
      const parts = imageUrl.split('/');
      return parts[parts.length - 1];
    });
    
    console.log("Files to delete:", filesToDelete);
    
    // Use admin client for storage operations
    const { data, error: storageError } = await supabaseAdmin
      .storage
      .from('room-images')
      .remove(filesToDelete);
      
    if (storageError) {
      console.error('Failed to delete images:', storageError);
    } else {
      console.log('Successfully deleted images:', data);
    }
  }
  
  // Delete the room record (also use admin client here)
  const { error: deleteError } = await supabaseAdmin
    .from('rooms')
    .delete()
    .eq('id', id);
    
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }
  
  return NextResponse.json({ success: true, message: 'Room and associated images deleted successfully' });
}