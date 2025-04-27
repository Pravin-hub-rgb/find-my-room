'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import UserDashboard from '@/components/UserDashboard';

const Profile = () => {
  const router = useRouter();
  const [profile, setProfile] = useState({ name: '', state: '', district: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

        setProfile(data || { name: '', state: '', district: '' });
        setLoading(false);
      } catch (err: unknown) {
        console.error('Error fetching profile:', err instanceof Error ? err.message : 'Unknown error');
        setError('An error occurred while fetching your profile.');
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="min-h-screen m-10">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-4">{profile.name}&apos;s Profile</h1>
        <div className="mb-4">
          <p className="text-lg font-medium">Name: <span className="text-gray-600">{profile.name}</span></p>
        </div>
        <div className="mb-4">
          <p className="text-lg font-medium">State: <span className="text-gray-600">{profile.state || 'Not set'}</span></p>
        </div>
        <div className="mb-4">
          <p className="text-lg font-medium">District: <span className="text-gray-600">{profile.district || 'Not set'}</span></p>
        </div>
        <Button
          onClick={() => router.push('/profile/edit')}
          className="w-full bg-blue-500 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-400 rounded-lg py-2 mt-4"
        >
          Edit
        </Button>
      </div>
      <UserDashboard />
    </div>
  );
};

export default Profile;