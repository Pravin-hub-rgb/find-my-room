'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { statesAndDistricts } from '@/lib/statesAndDistricts';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Image from 'next/image';
import Link from 'next/link';

export default function RoomsPage() {
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [districts, setDistricts] = useState<string[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔹 New: Load user profile on mount
  useEffect(() => {
    const loadProfileAndRooms = async () => {
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();

      if (user && !userError) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('state, district')
          .eq('id', user.id)
          .single();

        if (profile && profile.state && profile.district) {
          setSelectedState(profile.state);
          setSelectedDistrict(profile.district);

          // Set districts list immediately
          const stateData = statesAndDistricts.find(s => s.state === profile.state);
          setDistricts(stateData ? stateData.districts : []);

          // Fetch rooms automatically
          fetchRooms(profile.state, profile.district);
        }
      }
    };

    loadProfileAndRooms();
  }, []);

  // 🔹 Recalculate districts list when user changes state
  useEffect(() => {
    const stateData = statesAndDistricts.find(s => s.state === selectedState);
    setDistricts(stateData ? stateData.districts : []);
    setSelectedDistrict('');
  }, [selectedState]);

  // 🔹 Modified to accept args (or fallback to selected state/district)
  const fetchRooms = async (stateOverride?: string, districtOverride?: string) => {
    const stateToUse = stateOverride || selectedState;
    const districtToUse = districtOverride || selectedDistrict;

    if (!stateToUse || !districtToUse) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('rooms')
      .select('*, profiles(name)')
      .eq('state', stateToUse)
      .eq('district', districtToUse);

    if (error) {
      console.error("Error fetching rooms:", error.message);
    } else {
      setRooms((data || []).map(room => ({
        ...room,
        image_urls: Array.isArray(room.image_urls) ? room.image_urls : [],
      })));
    }

    setLoading(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Browse Rooms</h1>

      {/* Select State */}
      <div className="mb-4">
        <label className="block mb-1">Select State</label>
        <select
          className="border px-3 py-2 w-full"
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
        >
          <option value="">-- Choose a State --</option>
          {statesAndDistricts.map((s) => (
            <option key={s.state} value={s.state}>
              {s.state}
            </option>
          ))}
        </select>
      </div>

      {/* Select District */}
      {districts.length > 0 && (
        <div className="mb-4">
          <label className="block mb-1">Select District</label>
          <select
            className="border px-3 py-2 w-full"
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
          >
            <option value="">-- Choose a District --</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      )}

      <Button onClick={() => fetchRooms()} disabled={!selectedDistrict || loading}>
        {loading ? 'Loading...' : 'Fetch Rooms'}
      </Button>

      {/* Room Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="border rounded p-4 shadow-sm hover:shadow-md transition"
          >
            <div className="relative w-full">
              <Carousel className="w-full">
                <CarouselContent>
                  {Array.isArray(room.image_urls) &&
                    room.image_urls.map((url: string, index: number) => (
                      <CarouselItem key={index}>
                        <div className="relative h-64 w-full">
                          <Image
                            src={url}
                            alt={`Image ${index + 1}`}
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

            <h2 className="text-lg font-bold mt-4">{room.title}</h2>
            <p className="text-sm text-gray-600">
              {room.district}, {room.state}
            </p>
            <p className="mt-1 font-medium">₹{room.price}</p>
            <p className="text-sm italic">{room.room_type}</p>
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
    </div>
  );
}
