'use client';
import { supabase } from '@/lib/supabaseClient';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import MapWrapper from '@/components/MapWrapper';
import { PencilIcon, TrashIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ContactOwner from '@/components/ContactOwner';
import ReviewsSection from '@/components/ReviewSection';
import StarRating from '@/components/StarRating';
import { Room } from '@/types/room'; // Import the base Room type

// Extend the Room type with additional properties needed in this component
interface ExtendedRoom extends Room {
  user_id: string;
  bhk_type?: string;
  profiles?: {
    name: string;
  };
}

// Define proper type for reviews
interface Review {
  id: string;
  user_id: string;
  room_id: string;
  rating: number;
  comment: string;
  created_at: string;
  profiles?: {
    name: string;
  };
}

interface RoomPageContentProps {
  room: ExtendedRoom;
  id: string;
  reviews: Review[];
}

export default function RoomPageContent({ room, id, reviews }: RoomPageContentProps) {
  const [isOwner, setIsOwner] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function checkOwnership() {
      // Get current logged-in user
      const { data } = await supabase.auth.getUser();
      // Check if current user is the owner of the room
      setIsOwner(data.user?.id === room.user_id);
    }
    checkOwnership();
  }, [room.user_id]);

  const handleDeleteClick = () => {
    setShowDeleteConfirmation(true);
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirmation(false);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      // Get current session
      const { data: { session } } = await supabase.auth.getSession();

      // Make the request with the token
      const response = await fetch(`/api/rooms/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`,
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete room');
      }

      // Redirect to rooms listing
      router.push('/rooms');
      router.refresh();

    } catch (error) {
      console.error('Error deleting room:', error);
      alert('Failed to delete room: ' + (error as Error).message);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirmation(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header with edit button */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Room Details</h1>
        {isOwner && (
          <div className="flex gap-2">
            <Link href={`/rooms/${id}/edit`}>
              <Button variant="outline" className="flex items-center gap-2">
                <PencilIcon size={16} />
                Edit Room
              </Button>
            </Link>
            <Button
              variant="destructive"
              className="flex items-center gap-2"
              onClick={handleDeleteClick}
            >
              <TrashIcon size={16} />
              Delete Room
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md shadow-lg max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Delete Room</h3>
            <p className="mb-6">Are you sure you want to delete this room? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={handleDeleteCancel}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Carousel */}
      {Array.isArray(room.image_urls) && room.image_urls.length > 0 && (
        <div className="relative w-full">
          <Carousel className="w-full">
            <CarouselContent>
              {room.image_urls.map((url: string, index: number) => (
                <CarouselItem key={index}>
                  <div className="relative h-[400px] w-full">
                    <Image
                      src={url}
                      alt={`Room image ${index + 1}`}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-2 h-8 w-8" />
            <CarouselNext className="absolute right-2 h-8 w-8" />
          </Carousel>
        </div>
      )}

      {/* Room Info */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Room Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <div className="mb-4">
              <p className="font-bold text-lg text-blue-600">₹{room.price}</p>
              <p className="text-gray-700 font-medium"><strong>Type: </strong>{room.bhk_type || 'Room'}</p>
              <StarRating roomId={room.id} />
            </div>
            <div className="space-y-2">
              <p><strong>Location:</strong> {room.locality}, {room.district}, {room.state}</p>
              {room.address && <p><strong>Address:</strong> {room.address}</p>}
            </div>
          </div>
          <div className="space-y-2">
            {room.created_at && (
              <p><strong>Posted on:</strong> {new Date(room.created_at).toLocaleDateString()}</p>
            )}
            <p><strong>Posted by:</strong> {room.profiles?.name || 'Unknown User'}</p>
          </div>
        </div>
        <div className="mt-6">
          <h3 className="font-medium mb-2">Description</h3>
          <p className="text-gray-700">{room.description || 'No description available'}</p>
        </div>
        {/* Contact the Owner Button */}
        <div className="mt-6">
          <ContactOwner user_id={room.user_id} />
        </div>
      </div>
      <ReviewsSection roomId={id} initialReviews={reviews} />
      {/* Map - Only render MapWrapper when latitude and longitude are defined */}
      {room.latitude !== null && room.longitude !== null ? (
        <div className="h-[400px] w-full rounded-lg overflow-hidden shadow-sm">
          <h2 className="text-xl font-semibold mb-2">Location</h2>
          <MapWrapper room={{
            ...room,
            latitude: room.latitude,
            longitude: room.longitude
          } as Room & { latitude: number; longitude: number }} />
        </div>
      ) : (
        <p>No location data available</p>
      )}
    </div>
  );
}