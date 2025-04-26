'use client'

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import RoomMap from '@/components/RoomMap';
import RecentRooms from '@/components/RecentRooms';

const HomePage = () => {
  const searchParams = useSearchParams();
  const toastShownRef = useRef(false);

  useEffect(() => {
    const success = searchParams.get("success");

    // Show toast only if success=login and it hasn't been shown yet
    if (success === "login" && !toastShownRef.current) {
      toast.success("Successfully logged in!");

      // Mark the toast as shown
      toastShownRef.current = true;

      // Remove the success parameter from the URL to prevent showing the toast on refresh
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("success");
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [searchParams]);

  return (
    <div>
        <section className="mb-8">
        {/* <h2 className="text-xl font-semibold mb-1 text-center">Room Locations</h2> */}
        <div className="rounded-lg overflow-hidden border border-gray-200 mt-3">
          <RoomMap />
        </div>
        <RecentRooms />
      </section>
    </div>
  );
};

export default HomePage;
