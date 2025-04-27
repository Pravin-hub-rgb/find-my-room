'use client'

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { statesAndDistricts } from '@/lib/statesAndDistricts';
import { Button } from '@/components/ui/button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Image from 'next/image';
import Link from 'next/link';
import StarRating from '@/components/StarRating';
import RoomCard from '@/components/RoomCard';

// BHK Types for filter
const bhkTypes = ["1 RK", "Studio", "1 BHK", "2 BHK", "3 BHK", "Other"];

export default function RoomsPage() {
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [districts, setDistricts] = useState<string[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Filter states
  const [selectedBhkType, setSelectedBhkType] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000); // You can adjust this max as per your needs

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
      // Filter rooms based on BHK type and price range
      const filteredRooms = (data || []).filter((room) => {
        const isBhkTypeMatch = selectedBhkType ? room.bhk_type === selectedBhkType : true;
        const isPriceMatch = room.price >= minPrice && room.price <= maxPrice;
        return isBhkTypeMatch && isPriceMatch;
      });
      setRooms(filteredRooms.map(room => ({
        ...room,
        image_urls: Array.isArray(room.image_urls) ? room.image_urls : [],
      })));
    }

    setLoading(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Browse Rooms</h1>

      {/* Container for the sidebar and room cards */}
      <div className="lg:flex space-y-6 lg:space-y-0">
        {/* Filters Sidebar */}
        <div className="w-full lg:w-1/4 space-y-6">
          {/* Location Filters - Side by side on small screens, stacked on sidebar */}
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row sm:space-x-2 lg:flex-col lg:space-x-0 lg:space-y-4">
              {/* Select State */}
              <div className="w-full mb-4 sm:mb-0 lg:mb-0">
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
                <div className="w-full">
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
            </div>
          </div>

          {/* BHK Type Filter */}
          <div className="mb-4">
            <label className="block mb-1">Select BHK Type</label>
            <select
              className="border px-3 py-2 w-full"
              value={selectedBhkType}
              onChange={(e) => setSelectedBhkType(e.target.value)}
            >
              <option value="">-- Choose BHK Type --</option>
              {bhkTypes.map((bhk) => (
                <option key={bhk} value={bhk}>
                  {bhk}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range Filter */}
          <div className="mb-4">
            <label className="block mb-1">Price Range</label>
            <div className="flex items-center justify-between">
              <input
                type="number"
                className="border px-3 py-2 w-1/3"
                placeholder="Min Price"
                value={minPrice}
                onChange={(e) => setMinPrice(parseInt(e.target.value, 10))}
              />
              <span className="mx-2">to</span>
              <input
                type="number"
                className="border px-3 py-2 w-1/3"
                placeholder="Max Price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(parseInt(e.target.value, 10))}
              />
            </div>
          </div>

          <Button onClick={() => fetchRooms()} disabled={!selectedDistrict || loading} className="w-full mb-4">
            {loading ? 'Loading...' : 'Fetch Rooms'}
          </Button>
        </div>

        {/* Room Cards Grid */}
        <div className="flex-1 lg:ml-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}

          </div>
        </div>
      </div>
    </div>
  );
}
