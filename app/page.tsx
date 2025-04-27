// app/page.tsx
'use client';

import { Suspense } from 'react';
import RoomMap from '@/components/RoomMap';
import RecentRooms from '@/components/RecentRooms';
import SearchParamsHandler from '@/components/SearchParamsHandler';

const HomePage = () => {
  return (
    <div>
      {/* Suspense wrapping SearchParamsHandler */}
      <Suspense fallback={<div>Loading search params...</div>}>
        <SearchParamsHandler />
      </Suspense>

      <section className="mb-8">
        <div className="rounded-lg overflow-hidden border border-gray-200 mt-3">
          <RoomMap />
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <RecentRooms />
        </Suspense>
      </section>
    </div>
  );
};

export default HomePage;
