'use client'

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { statesAndDistricts } from '@/lib/statesAndDistricts';
import { Button } from '@/components/ui/button';
import RoomCard from '@/components/RoomCard';

interface Room {
  id: string;
  bhk_type: string;
  price: number;
  state: string;
  district: string;
  locality: string;
  image_urls: string[];
  profiles: {
    name: string;
  };
  created_at: string;
  // Add other room properties as needed
}

const bhkTypes = ["1 RK", "Studio", "1 BHK", "2 BHK", "3 BHK", "Other"];

export default function RoomsPage() {
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [districts, setDistricts] = useState<string[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBhkType, setSelectedBhkType] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [isUserLoading, setIsUserLoading] = useState(true);

  const fetchRooms = useCallback(async (stateOverride?: string, districtOverride?: string) => {
    const stateToUse = stateOverride || selectedState;
    const districtToUse = districtOverride || selectedDistrict;

    if (!stateToUse || !districtToUse) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*, profiles(name)')
        .eq('state', stateToUse)
        .eq('district', districtToUse);

      if (error) throw error;

      const filteredRooms = (data || []).filter((room) => {
        const isBhkTypeMatch = selectedBhkType ? room.bhk_type === selectedBhkType : true;
        const isPriceMatch = room.price >= minPrice && room.price <= maxPrice;
        return isBhkTypeMatch && isPriceMatch;
      });

      setRooms(filteredRooms.map(room => ({
        ...room,
        image_urls: Array.isArray(room.image_urls) ? room.image_urls : [],
        locality: room.locality || 'Not specified'
      })));
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedState, selectedDistrict, selectedBhkType, minPrice, maxPrice]);

  useEffect(() => {
    const loadProfileAndRooms = async () => {
      setIsUserLoading(true);
      try {
        // Use getSession instead of getUser to handle missing session gracefully
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Auth session error:", error);
          setIsUserLoading(false);
          return;
        }
        
        // Only proceed with profile fetching if we have a session and user
        if (data.session?.user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('state, district')
            .eq('id', data.session.user.id)
            .single();

          if (profileError) {
            console.error("Profile fetch error:", profileError);
          } else if (profile?.state && profile?.district) {
            setSelectedState(profile.state);
            setSelectedDistrict(profile.district);

            const stateData = statesAndDistricts.find(s => s.state === profile.state);
            setDistricts(stateData ? stateData.districts : []);

            await fetchRooms(profile.state, profile.district);
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setIsUserLoading(false);
      }
    };

    loadProfileAndRooms();
  }, [fetchRooms]);

  useEffect(() => {
    const stateData = statesAndDistricts.find(s => s.state === selectedState);
    setDistricts(stateData ? stateData.districts : []);
    setSelectedDistrict('');
  }, [selectedState]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Browse Rooms</h1>

      <div className="lg:flex space-y-6 lg:space-y-0">
        <div className="w-full lg:w-1/4 space-y-6">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col sm:flex-row sm:space-x-2 lg:flex-col lg:space-x-0 lg:space-y-4">
              <div className="w-full mb-4 sm:mb-0 lg:mb-0">
                <label className="block mb-1">Select State</label>
                <select
                  className="border px-3 py-2 w-full"
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  disabled={isUserLoading}
                >
                  <option value="">-- Choose a State --</option>
                  {statesAndDistricts.map((s) => (
                    <option key={s.state} value={s.state}>
                      {s.state}
                    </option>
                  ))}
                </select>
              </div>

              {districts.length > 0 && (
                <div className="w-full">
                  <label className="block mb-1">Select District</label>
                  <select
                    className="border px-3 py-2 w-full"
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    disabled={isUserLoading}
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

          <div className="mb-4">
            <label className="block mb-1">Select BHK Type</label>
            <select
              className="border px-3 py-2 w-full"
              value={selectedBhkType}
              onChange={(e) => setSelectedBhkType(e.target.value)}
              disabled={isUserLoading}
            >
              <option value="">-- Choose BHK Type --</option>
              {bhkTypes.map((bhk) => (
                <option key={bhk} value={bhk}>
                  {bhk}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block mb-1">Price Range</label>
            <div className="flex items-center justify-between">
              <input
                type="number"
                className="border px-3 py-2 w-1/3"
                placeholder="Min Price"
                value={minPrice}
                onChange={(e) => setMinPrice(Number(e.target.value))}
                min="0"
                disabled={isUserLoading}
              />
              <span className="mx-2">to</span>
              <input
                type="number"
                className="border px-3 py-2 w-1/3"
                placeholder="Max Price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                min={minPrice}
                disabled={isUserLoading}
              />
            </div>
          </div>

          <Button 
            onClick={() => fetchRooms()} 
            disabled={!selectedDistrict || loading || isUserLoading} 
            className="w-full mb-4"
          >
            {loading ? 'Loading...' : 'Fetch Rooms'}
          </Button>
        </div>

        <div className="flex-1 lg:ml-6">
          {isUserLoading ? (
            <div className="text-center py-10">Loading...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
                {rooms.map((room) => (
                  <RoomCard key={room.id} room={room} />
                ))}
              </div>
              {rooms.length === 0 && !loading && (
                <div className="text-center py-10 text-gray-500">
                  {selectedState && selectedDistrict 
                    ? "No rooms found matching your criteria" 
                    : "Please select a state and district to see available rooms"}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}