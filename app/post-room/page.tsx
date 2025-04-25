'use client'

import { useEffect, useState } from 'react'
import { statesAndDistricts } from '@/lib/statesAndDistricts'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation' // Change this import to next/navigation

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { supabase } from '@/lib/supabaseClient'

const PostRoomPage = () => {
  const router = useRouter(); // Call hook at the top level

  const [userId, setUserId] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    description: '',
    price: '',
    roomType: '',
    state: '',
    district: '',
    locality: '',
    address: '',
    latitude: null as number | null,
    longitude: null as number | null,
    images: [] as File[]
  });
  const [formErrors, setFormErrors] = useState({
    state: '',
    district: '',
    locality: '',
    price: '',
    images: '',
  });


  const [isClient, setIsClient] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<string | null>(null);

  // Mark component as client-rendered
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data?.user) {
        console.warn("User not authenticated:", error?.message);
        router.push('/auth/login'); // Redirect to login if not logged in
        return;
      }

      // If user is authenticated
      setUserId(data.user.id);
      setLoading(false);
    };

    getUser();
  }, [router]);

  if (loading) return <div>Checking authentication...</div>;


  // Handle image file changes
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setFormData(prev => ({
        ...prev,
        images: Array.from(files)
      }))
    }
  }

  // Handle file changes, check file size
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const fileArray = Array.from(files)
      const validFiles: File[] = []
      let fileTooLarge = false

      for (let file of fileArray) {
        if (file.size > 500 * 1024) { // 500KB
          fileTooLarge = true
          break
        } else {
          validFiles.push(file)
        }
      }

      if (fileTooLarge) {
        setError("One or more images exceed the 500KB size limit.")
      } else {
        setError(null)
        setImageFiles(validFiles)
      }
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files) {
      setImageFiles(Array.from(files));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
  };


  // Fetch districts based on the selected state
  const districts = statesAndDistricts.find(s => s.state === selectedState)?.districts || []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    const errors = {
      state: formData.state ? '' : 'State is required',
      district: formData.district ? '' : 'District is required',
      locality: formData.locality ? '' : 'Locality is required',
      price: formData.price && parseFloat(formData.price) > 0 ? '' : 'Valid price required',
      images: imageFiles.length > 0 ? '' : 'At least one image required',
    };

    setFormErrors(errors);

    // If any error exists, return early
    const hasErrors = Object.values(errors).some(err => err !== '');
    if (hasErrors) return;

    if (!userId) {
      setSubmissionStatus("User not logged in");
      return;
    }

    setIsSubmitting(true);
    setSubmissionStatus("Submitting...");

    // Step 1: Upload Images to Supabase Storage
    const imageUrls: string[] = [];

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const fileName = `${Date.now()}-${file.name}`;

      // Upload the file to Supabase Storage
      const uploadResponse = await supabase.storage
        .from('room-images')
        .upload(fileName, file);

      console.log("Upload response:", uploadResponse); // 👈 log full response

      if (uploadResponse.error) {
        console.error("File upload error:", uploadResponse.error);
        setSubmissionStatus("Error uploading image");
        setIsSubmitting(false);
        return;
      }


      // Step 2: Get the public URL for the uploaded file
      const { data } = supabase.storage
        .from('room-images')
        .getPublicUrl(fileName);

      if (!data?.publicUrl) {
        console.error("Error fetching public URL: No public URL available");
        setSubmissionStatus("Error fetching image URL");
        setIsSubmitting(false);
        return;
      }

      imageUrls.push(data.publicUrl);
    }

    // Step 3: Insert Room Data into `rooms` Table
    const { error: insertError } = await supabase
      .from('rooms')
      .insert([
        {
          user_id: userId,
          description: formData.description,
          room_type: formData.roomType,
          price: formData.price,
          state: formData.state,
          district: formData.district,
          locality: formData.locality,
          address: formData.address,
          latitude: formData.latitude,
          longitude: formData.longitude,
          image_urls: imageUrls,
        }

      ]);

    if (insertError) {
      console.error("Error inserting room data:", insertError);
      setSubmissionStatus("Error submitting room details");
      setIsSubmitting(false);
      return;
    }

    setSubmissionStatus("Room posted successfully!");
    setIsSubmitting(false);

    router.push('/');
  };

  // Return null until client-side is ready
  if (!isClient) {
    return null;
  }

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

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow space-y-6">
      <h1 className="text-3xl font-semibold text-gray-800">Post a Room</h1>

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

        {/* Room Type */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Room Type</label>
          <Select onValueChange={value => setFormData({ ...formData, roomType: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select Room Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Private">Private</SelectItem>
              <SelectItem value="Shared">Shared</SelectItem>
              <SelectItem value="PG">PG</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* State and District */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium text-gray-700">State</label>
            <Select
              onValueChange={value => {
                setSelectedState(value)
                setFormData(prev => ({ ...prev, state: value, district: '' }))
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
              disabled={!selectedState}
              onValueChange={(value) => {
                setSelectedDistrict(value)
                setFormData(prev => ({ ...prev, district: value }))
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select District" />
              </SelectTrigger>
              <SelectContent>
                {districts.map(d => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
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
            onChange={e => setFormData({ ...formData, locality: e.target.value })}
            onBlur={async () => {
              if (formData.state && formData.district) {
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
          {formErrors.locality && <p className="text-red-600 text-sm mt-1">{formErrors.locality}</p>}
        </div>

        {/* Optional Address */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Address (optional)</label>
          <Input
            placeholder="e.g. 123, XYZ Apartment"
            value={formData.address}
            onChange={e => setFormData({ ...formData, address: e.target.value })}
          />
        </div>

        <div>
          {/* Image Upload */}
          <label className="block font-medium text-gray-700 mb-1">Upload Images</label>

          <label
            htmlFor="image-upload"
            className="flex items-center justify-center h-32 border-2 border-dashed border-gray-400 rounded-md cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
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

          {formErrors.images && <p className="text-red-600 text-sm mt-1">{formErrors.images}</p>}

          {/* Image Previews */}
          <div className="mt-4 grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-3">
            {imageFiles.length > 0 && imageFiles.map((file, index) => (
              <div key={index} className="relative aspect-square">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${index + 1}`}
                  className="object-cover w-full h-full rounded-md"
                />
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

        </div>

        {/* Submit Button */}
        <Button className="w-full sm:w-auto">Post Room</Button>
      </form>
    </div>

  );
}

export default PostRoomPage;