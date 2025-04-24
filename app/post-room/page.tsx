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
    images: [] as File[]
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

  // Fetch districts based on the selected state
  const districts = statesAndDistricts.find(s => s.state === selectedState)?.districts || []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
          image_urls: imageUrls,
        },
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

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Post a Room</h1>
      <form onSubmit={handleSubmit}>
        <Textarea
          placeholder="Description"
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
        />

        <Input
          type="number"
          placeholder="Price (₹)"
          value={formData.price}
          onChange={e => setFormData({ ...formData, price: e.target.value })}
        />

        {/* Room Type */}
        <Select
          onValueChange={value => setFormData({ ...formData, roomType: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Room Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Private">Private</SelectItem>
            <SelectItem value="Shared">Shared</SelectItem>
            <SelectItem value="PG">PG</SelectItem>
          </SelectContent>
        </Select>

        {/* State Dropdown */}
        <Select
          onValueChange={(value) => {
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

        {/* District Dropdown */}
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
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Locality Input */}
        <Input
          placeholder="Locality"
          value={formData.locality}
          onChange={e => setFormData({ ...formData, locality: e.target.value })}
        />

        {/* Address Input */}
        <Input
          placeholder="Address (optional)"
          value={formData.address}
          onChange={e => setFormData({ ...formData, address: e.target.value })}
        />

        {/* Image Upload */}
        <div>
          <label htmlFor="image-upload" className="block">Upload Images:</label>
          <input
            type="file"
            id="image-upload"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="mt-2"
          />
          {error && <p className="text-red-600">{error}</p>}
        </div>

        {/* Image Previews */}
        <div className="image-previews">
          {imageFiles.length > 0 && imageFiles.map((file, index) => (
            <div key={index} className="preview">
              <img
                src={URL.createObjectURL(file)}
                alt={`Preview ${index + 1}`}
                className="h-32 w-32 object-cover"
              />
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <Button>Post</Button>
      </form>
    </div>
  );
}

export default PostRoomPage;