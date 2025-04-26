import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rating, comment, room_id } = body;
    
    // Get the Authorization token from the request header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Missing or invalid authorization header' }, { status: 401 });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Create a Supabase client with the user's JWT token
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    
    const supabaseClient = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });
    
    // Verify token and get user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json({ error: authError?.message || 'User not found' }, { status: 401 });
    }
    
    // Insert the review using the authenticated client
    const { error } = await supabaseClient.from('reviews').insert({
      user_id: user.id,
      room_id,
      rating,
      comment
    });
    
    if (error) {
      console.error('Database error:', error);
      
      // Check for the specific duplicate key error
      if (error.code === '23505' && error.message.includes('reviews_room_id_user_id_key')) {
        return NextResponse.json(
          { error: 'You have already reviewed this room. You can only submit one review per room.' }, 
          { status: 409 } // 409 Conflict is appropriate for duplicate resources
        );
      }
      
      return NextResponse.json({ error: `Database error: ${error.message}` }, { status: 500 });
    }
    
    return NextResponse.json({ message: 'Review created successfully' }, { status: 201 });
  } catch (err) {
    console.error('Unexpected error in reviews API:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const room_id = searchParams.get('room_id');
  
  if (!room_id) {
    return NextResponse.json({ error: 'Room ID is required' }, { status: 400 });
  }
  
  // Create a Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabaseClient = createClient(supabaseUrl, supabaseKey);
  
  const { data, error } = await supabaseClient
    .from('reviews')
    .select('*, profiles(name)')
    .eq('room_id', room_id)
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
  
  return NextResponse.json(data);
}