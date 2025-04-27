'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSession } from '@/lib/useSession';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Link from 'next/link';

interface Profile {
  name: string;
}

interface Review {
  id: string;
  room_id: string;
  user_id: string;
  comment: string;
  rating: number;
  created_at: string;
  profiles?: Profile;
}

interface ReviewsSectionProps {
  roomId: string;
  initialReviews: Review[];
}

export default function ReviewsSection({ roomId, initialReviews }: ReviewsSectionProps) {
  const { session } = useSession();
  const [newReview, setNewReview] = useState('');
  const [rating, setRating] = useState(5);
  const [reviews, setReviews] = useState<Review[]>(initialReviews || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  const checkIfUserHasReviewed = useCallback(async (): Promise<boolean> => {
    if (!session?.user) return false;

    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('id')
        .eq('room_id', roomId)
        .eq('user_id', session.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking for existing review:', error);
        return false;
      }

      return !!data;
    } catch (err) {
      console.error('Error checking for existing review:', err);
      return false;
    }
  }, [roomId, session]);

  const fetchReviews = useCallback(async () => {
    try {
      const response = await fetch(`/api/reviews?room_id=${roomId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      const data = await response.json() as Review[];
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to fetch reviews');
    }
  }, [roomId]);

  useEffect(() => {
    const initializeReviews = async () => {
      await fetchReviews();
      if (session?.user) {
        const hasUserReviewed = await checkIfUserHasReviewed();
        setHasReviewed(hasUserReviewed);
      }
    };
    initializeReviews();
  }, [fetchReviews, checkIfUserHasReviewed, session]);

  const handleSubmitReview = async () => {
    if (!newReview.trim()) {
      toast.error('Review cannot be empty!');
      return;
    }

    if (!session?.user) {
      toast.error('Please log in to leave a review.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          room_id: roomId,
          comment: newReview,
          rating: rating
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 409) {
          toast.warning('You have already reviewed this room. You can only submit one review per room.');
          setHasReviewed(true);
        } else {
          throw new Error(errorData.error || 'Failed to submit review');
        }
        return;
      }

      toast.success('Review submitted successfully');
      setNewReview('');
      setHasReviewed(true);
      await fetchReviews();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message || 'Failed to submit review');
      } else {
        toast.error('Failed to submit review');
      }
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    const confirmDelete = confirm('Are you sure you want to delete your review?');
    if (!confirmDelete) return;
  
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);
  
    if (error) {
      toast.error('Failed to delete review.');
      console.error('Error deleting review:', error);
    } else {
      toast.success('Review deleted successfully.');
      setHasReviewed(false);
      await fetchReviews();
    }
  };

  return (
    <div className="reviews-section p-4 border-t mt-6">
      <h3 className="text-xl font-semibold mb-4">Reviews</h3>

      <div className="reviews-list space-y-4">
        {reviews.length === 0 ? (
          <p>No reviews yet. Be the first to leave one!</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border p-3 rounded shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{review.profiles?.name || 'Anonymous'}</p>
                  <div className="flex items-center">
                    <span className="text-yellow-500">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                    <span className="text-gray-500 text-sm ml-2">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {session?.user?.id === review.user_id && (
                  <button
                    onClick={() => handleDeleteReview(review.id)}
                    className="text-red-500 text-sm ml-4 hover:underline"
                  >
                    Delete
                  </button>
                )}
              </div>

              <p className="text-gray-700 mt-2">{review.comment}</p>
            </div>
          ))
        )}
      </div>

      {session?.user ? (
        hasReviewed ? (
          <div className="mt-6 text-amber-600">
            <p>You&apos;ve already reviewed this room. Thank you for your feedback!</p>
          </div>
        ) : (
          <div className="review-form mt-8 border rounded-md p-6 bg-gray-50">
            <h4 className="text-lg font-semibold mb-4">Leave a Review</h4>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 text-gray-700">Your Rating</label>
              <div className="flex items-center gap-2">
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="text-2xl focus:outline-none"
                    >
                      <span className={star <= rating ? 'text-yellow-500' : 'text-gray-300'}>
                        ★
                      </span>
                    </button>
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-700">{rating}</span>
              </div>
            </div>

            <div className="mb-4">
              <textarea
                value={newReview}
                onChange={(e) => setNewReview(e.target.value)}
                rows={3}
                placeholder="Write your review..."
                className="w-full border rounded-md p-3 text-sm focus:ring-1 focus:ring-blue-400"
              />
            </div>

            <Button
              onClick={handleSubmitReview}
              className="mt-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        )
      ) : (
        <div className="mt-4 text-gray-500">
          <p>Please <Link href="/auth/login" className="text-blue-500 underline">log in</Link> to leave a review.</p>
        </div>
      )}
    </div>
  );
}