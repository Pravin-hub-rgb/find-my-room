import { useEffect, useState } from 'react';
import { useSession } from '../lib/useSession'; // Assuming this is in the 'lib' folder
import { supabase } from '../lib/supabaseClient';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import RoomCard from './RoomCard';

interface Room {
    id: string;
    image_urls: string[];    // Array of image URLs
    district: string;        // District name
    state: string;           // State name
    price: number;           // Price of the room
    bhk_type: string;        // Type of the room (e.g., 1BHK, 2BHK, etc.)
    created_at: string;      // Timestamp of when the room was created
    profiles?: { name: string }; // Optional profile information
    locality: string
}

const UserDashboard = () => {
    const { session, loading } = useSession();
    const [rooms, setRooms] = useState<Room[]>([]);

    useEffect(() => {
        if (!session) return; // Exit if no session

        const fetchRooms = async () => {
            const { data, error } = await supabase
                .from('rooms')
                .select('*, profiles(name)')
                .eq('user_id', session.user.id); // Fetch rooms for the logged-in user

            if (error) {
                console.error('Error fetching rooms:', error.message);
            } else {
                setRooms(data); // Set rooms data to state
            }
        };

        fetchRooms();
    }, [session]); // Re-run when session changes

    if (loading) return <p>Loading...</p>;
    if (!session) return <p>You must be logged in to view your rooms.</p>;

    return (
        <div className="flex-1 lg:ml-6 bg-white p-8 rounded-lg shadow-lg mt-8">
            {/* Heading Section */}
            <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Your Posted Rooms</h2>
                <p className="text-sm text-gray-500">Here are the rooms you&apos;ve posted so far.</p>
            </div>

            {/* Room Cards */}
            {rooms.length === 0 ? (
                <div className="text-center mt-6">
                    <p className="text-lg text-gray-600 mb-4">No rooms posted yet.</p>
                    <Button asChild className="w-full max-w-xs mx-auto">
                        <Link href="/post-room" className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition">
                            No rooms posted yet. Want to post a room?
                        </Link>
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
                    {rooms.map((room) => (
                        <RoomCard key={room.id} room={room} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserDashboard;
