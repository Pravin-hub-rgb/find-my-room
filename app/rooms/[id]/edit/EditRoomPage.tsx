'use client'

import { useEffect, useState } from 'react'
import { statesAndDistricts } from '@/lib/statesAndDistricts'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
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
  room_type: string;
  price: string;
  state: string;
  district: string;
  locality: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  image_urls: string[];
  bhk_type?: string | null;  // Make bhk_type optional
}

// This is the exported client component that will be used by the server page component
export function EditRoomForm({ roomId }: EditPageProps) {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [room, setRoom] = useState<any>(null);
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  // Add explicit state variables for room type and bhk type
  const [selectedRoomType, setSelectedRoomType] = useState<string>('');
  const [selectedBhkType, setSelectedBhkType] = useState<string>('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    description: '',
    price: '',
    roomType: '', // This corresponds to room_type in the database
    state: '',
    district: '',
    locality: '',
    address: '',
    latitude: null as number | null,
    longitude: null as number | null,
    bhkType: '' // This corresponds to bhk_type in the database
  });

  const [formErrors, setFormErrors] = useState({
    state: '',
    district: '',
    locality: '',
    price: '',
    images: ''
  });

  useEffect(() => {
    const loadData = async () => {
      // Check authentication
      const { data: userData, error: authError } = await supabase.auth.getUser();
      if (authError || !userData?.user) {
        console.warn("User not authenticated:", authError?.message);
        router.push('/auth/login');
        return;
      }
      setUserId(userData.user.id);
      
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
        
        // Set the room data
        setRoom(roomData);
        
        // Debug logs - Add these to see exact values from database
        console.log("Fetched room data:", roomData);
        console.log("Room type from DB:", roomData.room_type);
        console.log("BHK type from DB:", roomData.bhk_type);
        
        // Map the values from database to match exactly the values in your Select components
        // This is the key fix - ensuring the values match exactly what's in your SelectItem values
        let mappedRoomType = roomData.room_type || '';
        let mappedBhkType = roomData.bhk_type || '';
        
        // Make sure these values exactly match your SelectItem values
        console.log("Setting room type to:", mappedRoomType);
        console.log("Setting BHK type to:", mappedBhkType);
        
        setSelectedRoomType(mappedRoomType);
        setSelectedBhkType(mappedBhkType);
        setSelectedState(roomData.state || '');
        setSelectedDistrict(roomData.district || '');
        
        // Initialize form data with room data
        setFormData({
          description: roomData.description || '',
          price: roomData.price?.toString() || '',
          roomType: mappedRoomType,
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

      for (let file of fileArray) {
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

  const fetchLatLng = async (state: string, district: string, locality: string) => {
    const query = locality
      ? `${locality}, ${district}, ${state}, India`
      : `${district}, ${state}, India`;

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data?.length) {
        const { lat, lon } = data[0];
        return { lat: parseFloat(lat), lng: parseFloat(lon) };
      }
    } catch (err) {
      console.error("Error fetching lat/lng:", err);
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    const errors = {
      state: formData.state ? '' : 'State is required',
      district: formData.district ? '' : 'District is required',
      locality: formData.locality ? '' : 'Locality is required',
      price: formData.price && parseFloat(formData.price) > 0 ? '' : 'Valid price required',
      images: (existingImages.length - imagesToRemove.length > 0) || imageFiles.length > 0 ? '' : 'At least one image required'
    };

    setFormErrors(errors);

    // If any error exists, return early
    const hasErrors = Object.values(errors).some(err => err !== '');
    if (hasErrors) return;

    setIsSubmitting(true);
    setSubmissionStatus("Updating...");

    // Step 1: Upload new images if any
    const newImageUrls: string[] = [];

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
      description: formData.description,
      room_type: selectedRoomType, // Use the explicit state variable
      price: formData.price,
      state: formData.state,
      district: formData.district,
      locality: formData.locality,
      address: formData.address,
      latitude: formData.latitude,
      longitude: formData.longitude,
      image_urls: finalImageUrls,
    };
    
    // Only include bhk_type when not PG
    if (selectedRoomType !== 'PG') {
      updateData.bhk_type = selectedBhkType; // Use the explicit state variable
    } else {
      updateData.bhk_type = null;
    }

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
  };

  // For debugging - remove in production
  console.log("Current form data:", formData);
  console.log("Selected room type:", selectedRoomType);
  console.log("Selected BHK type:", selectedBhkType);

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Edit Room</h1>

      {submissionStatus && (
        <div className={`p-3 rounded ${submissionStatus.includes("Error") ? "bg-red-100" : "bg-green-100"}`}>
          {submissionStatus}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Description */}
        <div>
          <label className="block mb-1">Description</label>
          <Textarea
            placeholder="Description"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        {/* Price */}
        <div>
          <label className="block mb-1">Price (₹)</label>
          <Input
            type="number"
            placeholder="Price (₹)"
            value={formData.price}
            onChange={e => setFormData({ ...formData, price: e.target.value })}
          />
          {formErrors.price && <p className="text-red-600">{formErrors.price}</p>}
        </div>

        {/* Room Type */}
        <div>
          <label className="block mb-1">Room Type</label>
          <Select
            value={selectedRoomType}
            onValueChange={(value) => {
              console.log("Changing room type to:", value);
              setSelectedRoomType(value);
              // Reset BHK type if PG is selected
              if (value === 'PG') {
                setSelectedBhkType('');
              }
              setFormData({ ...formData, roomType: value });
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Room Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PG">PG</SelectItem>
              <SelectItem value="Private">Private</SelectItem> 
              <SelectItem value="Shared">Shared</SelectItem> 
            </SelectContent>
          </Select>
        </div>

        {/* BHK Type Field, shown only if roomType is not 'PG' */}
        {selectedRoomType && selectedRoomType !== 'PG' && (
          <div>
            <label className="block mb-1">BHK Type</label>
            <Select
              value={selectedBhkType}
              onValueChange={(value) => {
                console.log("Changing BHK type to:", value);
                setSelectedBhkType(value);
                setFormData({ ...formData, bhkType: value });
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select BHK Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1 BHK">1 BHK</SelectItem> 
                <SelectItem value="2 BHK">2 BHK</SelectItem> 
                <SelectItem value="3 BHK">3 BHK</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* State */}
        <div>
          <label className="block mb-1">State</label>
          <Select
            value={selectedState}
            onValueChange={(value) => {
              setSelectedState(value);
              setSelectedDistrict('');
              setFormData(prev => ({ ...prev, state: value, district: '' }));
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
          {formErrors.state && <p className="text-red-600">{formErrors.state}</p>}
        </div>

        {/* District */}
        <div>
          <label className="block mb-1">District</label>
          <Select
            value={selectedDistrict}
            disabled={!selectedState}
            onValueChange={(value) => {
              setSelectedDistrict(value);
              setFormData(prev => ({ ...prev, district: value }));
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
          {formErrors.district && <p className="text-red-600">{formErrors.district}</p>}
        </div>

        {/* Locality */}
        <div>
          <label className="block mb-1">Locality</label>
          <Input
            placeholder="Locality"
            value={formData.locality}
            onChange={e => setFormData({ ...formData, locality: e.target.value })}
            onBlur={async () => {
              if (formData.state && formData.district && formData.locality) {
                const result = await fetchLatLng(formData.state, formData.district, formData.locality);
                if (result) {
                  setFormData(prev => ({
                    ...prev,
                    latitude: result.lat,
                    longitude: result.lng,
                  }));
                }
              }
            }}
          />
          {formErrors.locality && <p className="text-red-600">{formErrors.locality}</p>}
        </div>

        {/* Address (optional) */}
        <div>
          <label className="block mb-1">Address (optional)</label>
          <Input
            placeholder="Address (optional)"
            value={formData.address}
            onChange={e => setFormData({ ...formData, address: e.target.value })}
          />
        </div>

        {/* Existing Images */}
        {existingImages.length > 0 && (
          <div>
            <label className="block mb-2">Existing Images</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {existingImages.map((url, index) => (
                <div key={index} className="relative">
                  <div className={`relative h-32 w-full ${imagesToRemove.includes(url) ? 'opacity-30' : ''}`}>
                    <img
                      src={url}
                      alt={`Room image ${index + 1}`}
                      className="h-full w-full object-cover rounded"
                    />
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
          <label htmlFor="image-upload" className="block mb-1">Add New Images:</label>
          <input
            type="file"
            id="image-upload"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="mt-2"
          />
        </div>

        {/* New Image Previews */}
        {imageFiles.length > 0 && (
          <div>
            <label className="block mb-2">New Images Preview</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {imageFiles.map((file, index) => (
                <div key={index} className="relative h-32 w-full">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    className="h-full w-full object-cover rounded"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {formErrors.images && <p className="text-red-600">{formErrors.images}</p>}

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