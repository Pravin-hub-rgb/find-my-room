import { useEffect, useState } from 'react';
import { useSession } from '../lib/useSession'; // Assuming this is in the 'lib' folder
import { supabase } from '../lib/supabaseClient';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Link from 'next/link';
import StarRating from './StarRating';

const UserDashboard = () => {
    const { session, loading } = useSession();
    const [rooms, setRooms] = useState<any[]>([]);

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
                <p className="text-sm text-gray-500">Here are the rooms you've posted so far.</p>
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
                        <div
                            key={room.id}
                            className="border rounded p-4 shadow-sm hover:shadow-md transition"
                        >
                            <div className="relative w-full">
                                <Carousel className="w-full">
                                    {Array.isArray(room.image_urls) &&
                                        room.image_urls.map((url: string, index: number) => (
                                            <div key={index}>
                                                <div className="relative h-64 w-full">
                                                    <Image
                                                        src={url}
                                                        alt={`Image ${index + 1}`}
                                                        layout="fill"
                                                        className="object-cover rounded"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                </Carousel>
                            </div>

                            <p className="text-sm text-gray-600 mt-2">
                                {room.district}, {room.state}
                            </p>

                            <p className="mt-1 font-medium">₹{room.price}</p>
                            <p className="text-sm italic">{room.bhk_type}</p>

                            {/* Assuming you have a StarRating component for frontend-calculated ratings */}
                            <StarRating roomId={room.id} />

                            <div className="mt-2 text-sm text-gray-500">
                                <p>Post at: {new Date(room.created_at).toLocaleDateString()}</p>
                                <p>Posted by: {room.profiles?.name || 'Unknown User'}</p>
                            </div>
                            <Button asChild className="mt-4 w-full">
                                <Link href={`/rooms/${room.id}`}>Show More Details</Link>
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserDashboard;
