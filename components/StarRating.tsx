import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface StarRatingProps {
  roomId: string;
}

interface Review {
  rating: number;
}

const StarRating: React.FC<StarRatingProps> = ({ roomId }) => {
  const [averageRating, setAverageRating] = useState<number | null>(null);

  const fetchAverageRating = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('rating')
        .eq('room_id', roomId);

      if (error) {
        console.error('Error fetching ratings:', error);
        return;
      }

      if (data && data.length > 0) {
        const totalRatings = data.reduce((acc: number, review: Review) => acc + review.rating, 0);
        const average = totalRatings / data.length;
        setAverageRating(average);
      } else {
        setAverageRating(null);
      }
    } catch (error) {
      console.error('Error fetching average rating:', error);
    }
  }, [roomId]);

  useEffect(() => {
    fetchAverageRating();
  }, [fetchAverageRating]);

  const renderStar = (position: number) => {
    if (!averageRating) return <EmptyStar key={position} />;

    const difference = averageRating - position;

    if (difference >= 0) {
      return <FullStar key={position} />;
    } else if (difference > -1) {
      const percentage = (difference + 1) * 100;
      return <PartialStar key={position} percentage={percentage} />;
    } else {
      return <EmptyStar key={position} />;
    }
  };

  return (
    <div className="flex items-center mt-2">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((pos) => renderStar(pos))}
      </div>
      <span className="ml-2 text-xs text-gray-500">
        {averageRating !== null ? averageRating.toFixed(1) : 'No ratings'}
      </span>
    </div>
  );
};

const FullStar = () => (
  <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const EmptyStar = () => (
  <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

interface PartialStarProps {
  percentage: number;
  key?: number;
}

const PartialStar: React.FC<PartialStarProps> = ({ percentage, key }) => (
  <div className="relative w-5 h-5" key={key}>
    <EmptyStar />
    <div className="absolute top-0 left-0 overflow-hidden" style={{ width: `${percentage}%` }}>
      <FullStar />
    </div>
  </div>
);

export default StarRating;