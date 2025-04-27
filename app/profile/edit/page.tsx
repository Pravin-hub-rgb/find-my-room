'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { statesAndDistricts } from '@/lib/statesAndDistricts';

const EditProfile = () => {
  const router = useRouter();
  const [profile, setProfile] = useState({
    name: '',
    state: '',
    district: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'state') {
      // Clear district if state changes
      setProfile((prev) => ({
        ...prev,
        state: value,
        district: '', // reset district when state changes
      }));
    } else {
      setProfile((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
          console.error('User is not authenticated:', userError?.message);
          setError('User is not authenticated.');
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('name, state, district')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error.message);
          setError('An error occurred while fetching your profile.');
          setLoading(false);
          return;
        }

        setProfile({
          name: data?.name ?? '',
          state: data?.state ?? '',
          district: data?.district ?? '',
        });
        setLoading(false);
      } catch (err: unknown) {
        console.error('Error fetching profile:', err instanceof Error ? err.message : 'Unknown error');
        setError('An error occurred while fetching your profile.');
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
  
      if (userError || !user) {
        setError('User is not authenticated.');
        setLoading(false);
        return;
      }
  
      const { error } = await supabase
        .from('profiles')
        .update({
          name: profile.name,
          state: profile.state,
          district: profile.district,
        })
        .eq('id', user.id);
  
      if (error) {
        console.error('Error updating profile:', error.message);
        setError('An error occurred while updating your profile.');
        setLoading(false);
        return;
      }
  
      setSuccess(true);
      setLoading(false);
  
      // ✅ Redirect to /profile after 1 second
      setTimeout(() => {
        router.push('/profile');
      }, 1000);
    } catch (err: unknown) {
      console.error('Error updating profile:', err instanceof Error ? err.message : 'Unknown error');
      setError('An error occurred while updating your profile.');
      setLoading(false);
    }
  };
  

  const availableDistricts =
    statesAndDistricts.find((s) => s.state === profile.state)?.districts || [];

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen m-10">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-4">Edit Your Profile</h1>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {success && <p className="text-green-500 text-center mb-4">Profile updated successfully!</p>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="text-lg font-medium">Name:</label>
            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="text-lg font-medium">State:</label>
            <select
              name="state"
              value={profile.state}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select State</option>
              {statesAndDistricts.map((stateObj) => (
                <option key={stateObj.state} value={stateObj.state}>
                  {stateObj.state}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="text-lg font-medium">District:</label>
            <select
              name="district"
              value={profile.district}
              onChange={handleChange}
              required
              disabled={!profile.state}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select District</option>
              {availableDistricts.map((district) => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-400 rounded-lg py-2"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;