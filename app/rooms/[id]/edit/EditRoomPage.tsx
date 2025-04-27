'use client'

import { useEffect, useState } from 'react'
import { statesAndDistricts } from '@/lib/statesAndDistricts'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

interface EditPageProps {
  roomId: string;
}

// Room update data interface
interface RoomUpdateData {
  description: string;
  price: string;
  state: string;
  district: string;
  locality: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  image_urls: string[];
  bhk_type: string | null;
}

// This is the exported client component that will be used by the server page component
export function EditRoomForm({ roomId }: EditPageProps) {
  const router = useRouter();
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedBhkType, setSelectedBhkType] = useState<string>('');

  const [formData, setFormData] = useState({
    description: '',
    price: '',
    state: '',
    district: '',
    locality: '',
    address: '',
    latitude: null as number | null,
    longitude: null as number | null,
    bhkType: ''
  });

  const [formErrors, setFormErrors] = useState({
    state: '',
    district: '',
    locality: '',
    price: '',
    bhkType: '',
    images: ''
  });

  // BHK types array matching the create page
  const bhkTypes = [
    "1 RK",
    "Studio",
    "1 BHK",
    "2 BHK",
    "3 BHK",
    "Other"
  ];

  useEffect(() => {
    const loadData = async () => {
      // Check authentication
      const { data: userData, error: authError } = await supabase.auth.getUser();
      if (authError || !userData?.user) {
        console.warn("User not authenticated:", authError?.message);
        router.push('/auth/login');
        return;
      }

      // Fetch room data
      try {
        const { data: roomData, error: roomError } = await supabase
          .from('rooms')
          .select('*')
          .eq('id', roomId)
          .single();

        if (roomError || !roomData) {
          setError("Room not found");
          setLoading(false);
          return;
        }

        // Check if current user is the owner
        if (roomData.user_id !== userData.user.id) {
          setError("You don't have permission to edit this room");
          router.push(`/rooms/${roomId}`);
          return;
        }

        // Map the values from database
        const mappedBhkType = roomData.bhk_type || '';

        // Set state values
        setSelectedBhkType(mappedBhkType);
        setSelectedState(roomData.state || '');
        setSelectedDistrict(roomData.district || '');

        // Initialize form data with room data
        setFormData({
          description: roomData.description || '',
          price: roomData.price?.toString() || '',
          state: roomData.state || '',
          district: roomData.district || '',
          locality: roomData.locality || '',
          address: roomData.address || '',
          latitude: roomData.latitude || null,
          longitude: roomData.longitude || null,
          bhkType: mappedBhkType
        });

        // Set existing images
        if (Array.isArray(roomData.image_urls)) {
          setExistingImages(roomData.image_urls);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching room:", err);
        setError("Failed to load room data");
        setLoading(false);
      }
    };

    loadData();
  }, [roomId, router]);

  if (loading) return <div className="p-6">Loading room data...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  // Districts based on selected state
  const districts = statesAndDistricts.find(s => s.state === selectedState)?.districts || [];

  // Handle image file changes
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      const validFiles: File[] = [];
      let fileTooLarge = false;

      for (const file of fileArray) {
        if (file.size > 500 * 1024) { // 500KB
          fileTooLarge = true;
          break;
        } else {
          validFiles.push(file);
        }
      }

      if (fileTooLarge) {
        setError("One or more images exceed the 500KB size limit.");
      } else {
        setError(null);
        setImageFiles(validFiles);
      }
    }
  };

  // Handle removing an existing image
  const toggleImageRemoval = (imageUrl: string) => {
    if (imagesToRemove.includes(imageUrl)) {
      setImagesToRemove(imagesToRemove.filter(url => url !== imageUrl));
    } else {
      setImagesToRemove([...imagesToRemove, imageUrl]);
    }
  };

  // Enhanced fetchLatLng function with multiple attempts and scatter
  const fetchLatLng = async (state: string, district: string, locality: string, scatter = true) => {
    const baseUrl = "https://nominatim.openstreetmap.org/search?format=json&q=";
    console.log("fetchLatLng called with:", { state, district, locality });

    // Helper function to fetch and return lat/lng from a query
    const tryFetch = async (query: string) => {
      console.log("Trying with query:", query);
      const res = await fetch(`${baseUrl}${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data?.length) {
        const { lat, lon } = data[0];
        console.log("Lat/Lng found:", lat, lon);
        return { lat: parseFloat(lat), lng: parseFloat(lon) };
      }
      console.log("No results for query:", query);
      return null;
    };

    try {
      let location = null;

      // 1. Try with locality + district + state
      if (locality) {
        location = await tryFetch(`${locality}, ${district}, ${state}, India`);
      }

      // 2. If failed, try with district + state
      if (!location) {
        location = await tryFetch(`${district}, ${state}, India`);
      }

      // 3. If still failed, try with state only
      if (!location) {
        location = await tryFetch(`${state}, India`);
      }

      // 4. If we got location, apply scatter before returning
      if (location) {
        const origLat = location.lat;
        const origLng = location.lng;

        if (scatter) {
          const scatterAmount = 0.003; // ~300 meters random scatter
          location.lat = parseFloat((location.lat + (Math.random() * scatterAmount * 2 - scatterAmount)).toFixed(6));
          location.lng = parseFloat((location.lng + (Math.random() * scatterAmount * 2 - scatterAmount)).toFixed(6));
          console.log("Original Lat/Lng:", origLat, origLng);
          console.log("Scattered Lat/Lng:", location.lat, location.lng);
        }
        return location;
      }

      console.log("No Lat/Lng found after all attempts.");
      return null;
    } catch (err) {
      console.error("Error fetching lat/lng:", err);
      return null;
    }
  };

  const updateLocationCoordinates = async () => {
    console.log("updateLocationCoordinates called with current formData:", {
      state: formData.state,
      district: formData.district,
      locality: formData.locality,
      currentLat: formData.latitude,
      currentLng: formData.longitude
    });
    
    if (formData.state && formData.district) {
      console.log("Fetching new coordinates...");
      const result = await fetchLatLng(formData.state, formData.district, formData.locality);
      
      if (result) {
        console.log("Updating coordinates from:", { lat: formData.latitude, lng: formData.longitude });
        console.log("Updating coordinates to:", { lat: result.lat, lng: result.lng });
        
        // Using function form of setState to ensure we're working with the latest state
        setFormData(prev => {
          const updated = {
            ...prev,
            latitude: result.lat,
            longitude: result.lng,
          };
          console.log("Updated formData with new coordinates:", updated);
          return updated;
        });
      } else {
        console.log("No coordinates retrieved, keeping current values");
      }
    } else {
      console.log("Missing required location data (state or district)");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    const errors = {
      state: formData.state ? '' : 'State is required',
      district: formData.district ? '' : 'District is required',
      locality: formData.locality ? '' : 'Locality is required',
      price: formData.price && parseFloat(formData.price) > 0 ? '' : 'Valid price required',
      bhkType: formData.bhkType ? '' : 'BHK type is required',
      images: (existingImages.length - imagesToRemove.length > 0) || imageFiles.length > 0 ? '' : 'At least one image required'
    };

    setFormErrors(errors);

    // If any error exists, return early
    const hasErrors = Object.values(errors).some(err => err !== '');
    if (hasErrors) return;

    setIsSubmitting(true);
    setSubmissionStatus("Updating...");

    // Use the current formData state directly when creating updateData
    // This ensures we have the latest coordinates
    const currentFormData = { ...formData };
    
    console.log("Current form data for submission:", currentFormData);

    // Step 1: Upload new images if any
    const newImageUrls: string[] = [];

    try {
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        const fileName = `${Date.now()}-${file.name}`;

        // Upload the file to Supabase Storage
        const uploadResponse = await supabase.storage
          .from('room-images')
          .upload(fileName, file);

        if (uploadResponse.error) {
          console.error("File upload error:", uploadResponse.error);
          setSubmissionStatus("Error uploading image");
          setIsSubmitting(false);
          return;
        }

        // Get the public URL for the uploaded file
        const { data } = supabase.storage
          .from('room-images')
          .getPublicUrl(fileName);

        if (!data?.publicUrl) {
          console.error("Error fetching public URL");
          setSubmissionStatus("Error fetching image URL");
          setIsSubmitting(false);
          return;
        }

        newImageUrls.push(data.publicUrl);
      }

      // Step 2: Prepare final image URLs (keep existing ones not marked for removal + add new ones)
      const finalImageUrls = [
        ...existingImages.filter(url => !imagesToRemove.includes(url)),
        ...newImageUrls
      ];

      // Step 3: Update room data in the database
      const updateData: RoomUpdateData = {
        description: currentFormData.description,
        price: currentFormData.price,
        state: currentFormData.state,
        district: currentFormData.district,
        locality: currentFormData.locality,
        address: currentFormData.address,
        latitude: currentFormData.latitude,
        longitude: currentFormData.longitude,
        image_urls: finalImageUrls,
        bhk_type: selectedBhkType,
      };
      
      // Just before the supabase update call:
      console.log("Submitting room update with coordinates:", {
        latitude: updateData.latitude,
        longitude: updateData.longitude
      });
      
      const { error: updateError } = await supabase
        .from('rooms')
        .update(updateData)
        .eq('id', roomId);

      if (updateError) {
        console.error("Error updating room:", updateError);
        setSubmissionStatus("Error updating room details");
        setIsSubmitting(false);
        return;
      }

      setSubmissionStatus("Room updated successfully!");

      // Redirect to the room page after a brief delay
      setTimeout(() => {
        router.push(`/rooms/${roomId}`);
      }, 1500);
    } catch (error) {
      console.error("Error in update process:", error);
      setSubmissionStatus("An unexpected error occurred");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow space-y-6">
      <h1 className="text-3xl font-semibold text-gray-800">Edit Room</h1>

      {submissionStatus && (
        <div className={`p-3 rounded ${submissionStatus.includes("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
          {submissionStatus}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Description */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Description</label>
          <Textarea
            placeholder="Describe your room..."
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        {/* Price */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Price (₹)</label>
          <Input
            type="number"
            placeholder="e.g. 5000"
            value={formData.price}
            onChange={e => setFormData({ ...formData, price: e.target.value })}
          />
          {formErrors.price && <p className="text-red-600 text-sm mt-1">{formErrors.price}</p>}
        </div>

        {/* BHK Type */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">BHK Type</label>
          <Select
            value={selectedBhkType}
            onValueChange={(value) => {
              setSelectedBhkType(value);
              setFormData(prev => ({ ...prev, bhkType: value }));
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select BHK Type" />
            </SelectTrigger>
            <SelectContent>
              {bhkTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formErrors.bhkType && <p className="text-red-600 text-sm mt-1">{formErrors.bhkType}</p>}
        </div>

        {/* State and District */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium text-gray-700">State</label>
            <Select
              value={selectedState}
              onValueChange={(value) => {
                console.log("State changed to:", value);
                setSelectedState(value);
                setSelectedDistrict('');
                setFormData(prev => ({
                  ...prev,
                  state: value,
                  district: '',
                  // Reset coordinates when state changes
                  latitude: null,
                  longitude: null
                }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select State" />
              </SelectTrigger>
              <SelectContent>
                {statesAndDistricts.map(stateObj => (
                  <SelectItem key={stateObj.state} value={stateObj.state}>
                    {stateObj.state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.state && <p className="text-red-600 text-sm mt-1">{formErrors.state}</p>}
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-700">District</label>
            <Select
              value={selectedDistrict}
              disabled={!selectedState}
              onValueChange={(value) => {
                console.log("District changed to:", value);
                setSelectedDistrict(value);
                setFormData(prev => {
                  // Update district immediately
                  const updated = { ...prev, district: value };
                  console.log("Updated form with district:", updated);
                  return updated;
                });
                
                // Now that district is set, we can fetch coordinates
                // Use a slight delay to ensure state update has completed
                setTimeout(async () => {
                  if (selectedState && value) {
                    console.log("Getting coordinates after district change");
                    const coordsResult = await fetchLatLng(selectedState, value, formData.locality);
                    if (coordsResult) {
                      setFormData(prev => ({
                        ...prev,
                        latitude: coordsResult.lat,
                        longitude: coordsResult.lng
                      }));
                    }
                  }
                }, 100);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select District" />
              </SelectTrigger>
              <SelectContent>
                {districts.map(d => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.district && <p className="text-red-600 text-sm mt-1">{formErrors.district}</p>}
          </div>
        </div>

        {/* Locality */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Locality</label>
          <Input
            placeholder="e.g. Andheri West"
            value={formData.locality}
            onChange={e => {
              setFormData(prev => ({ ...prev, locality: e.target.value }));
            }}
            onBlur={async (e) => {
              console.log("Locality input blurred with value:", e.target.value);
              
              // Directly update coordinates if we have state and district
              if (selectedState && selectedDistrict) {
                const localityValue = e.target.value;
                console.log("Getting coordinates after locality change");
                const coordsResult = await fetchLatLng(selectedState, selectedDistrict, localityValue);
                if (coordsResult) {
                  setFormData(prev => ({
                    ...prev,
                    latitude: coordsResult.lat,
                    longitude: coordsResult.lng
                  }));
                }
              }
            }}
          />
          {formErrors.locality && <p className="text-red-600 text-sm mt-1">{formErrors.locality}</p>}
        </div>

        {/* Address (optional) */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Address (optional)</label>
          <Input
            placeholder="e.g. 123, XYZ Apartment"
            value={formData.address}
            onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
          />
        </div>

        {/* Debug view for coordinates - uncomment if needed */}
        {/* <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
          Debug: Coordinates: Lat: {formData.latitude}, Lng: {formData.longitude}
        </div> */}

        {/* Existing Images */}
        {existingImages.length > 0 && (
          <div>
            <label className="block mb-2 font-medium text-gray-700">Existing Images</label>
            <div className="flex flex-wrap gap-2">
              {existingImages.map((url, index) => (
                <div key={index} className="relative w-1/3 sm:w-1/4 md:w-1/5">
                  <div className={`relative aspect-square ${imagesToRemove.includes(url) ? 'opacity-30' : ''}`}>
                    <div className="relative h-full w-full">
                      <Image
                        src={url}
                        alt={`Room image ${index + 1}`}
                        fill
                        sizes="(max-width: 768px) 33vw, 20vw"
                        className="object-cover rounded-md"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleImageRemoval(url)}
                    className={`absolute top-2 right-2 p-1 rounded-full ${imagesToRemove.includes(url) ? 'bg-green-500' : 'bg-red-500'
                      } text-white text-xs`}
                  >
                    {imagesToRemove.includes(url) ? 'Keep' : 'Remove'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add New Images */}
        <div>
          <label className="block font-medium text-gray-700 mb-1">Upload New Images</label>

          <label
            htmlFor="image-upload"
            className="flex items-center justify-center h-32 border-2 border-dashed border-gray-400 rounded-md cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition"
          >
            <div className="text-center">
              <p className="text-sm text-gray-600">Click to upload or drag & drop images here</p>
              <p className="text-xs text-gray-400">Only image files are supported</p>
            </div>
          </label>

          <input
            id="image-upload"
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* New Image Previews */}
        {imageFiles.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {imageFiles.map((file, index) => (
              <div key={index} className="relative w-1/3 sm:w-1/4 md:w-1/5 aspect-square">
                <div className="relative h-full w-full">
                  <Image
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 33vw, 20vw"
                    className="object-cover rounded-md"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newFiles = imageFiles.filter((_, i) => i !== index);
                    setImageFiles(newFiles);
                  }}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full text-xs px-2 py-1 hover:bg-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {formErrors.images && <p className="text-red-600 text-sm mt-1">{formErrors.images}</p>}

        {/* Submit Buttons */}
        <div className="flex space-x-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Updating...' : 'Update Room'}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/rooms/${roomId}`)}
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}