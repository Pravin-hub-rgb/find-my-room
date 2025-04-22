'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';

const Profile = () => {
    const router = useRouter();
    const [profile, setProfile] = useState({ name: '', city: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // Fetch user session (authenticated user) using the current API
                const { data: { user }, error: userError } = await supabase.auth.getUser();

                if (userError || !user) {
                    console.error('User is not authenticated:', userError?.message);
                    setError('User is not authenticated.');
                    setLoading(false);
                    return;
                }

                // Fetch profile data from the profiles table using the user ID
                const { data, error } = await supabase
                    .from('profiles')
                    .select('name, city')
                    .eq('id', user.id)
                    .single();

                if (error) {
                    console.error('Error fetching profile:', error.message);
                    setError('An error occurred while fetching your profile.');
                    setLoading(false);
                    return;
                }

                // Set profile data in state
                setProfile(data || { name: '', city: '' });
                setLoading(false);
            } catch (err: any) {
                console.error('Error fetching profile:', err.message);
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
                <h1 className="text-2xl font-bold text-center mb-4">{profile.name}'s Profile</h1>

                <div className="mb-4">
                    <p className="text-lg font-medium">Name: <span className="text-gray-600">{profile.name}</span></p>
                </div>

                <div className="mb-4">
                    <p className="text-lg font-medium">City: <span className="text-gray-600">{profile.city}</span></p>
                </div>

                <Button
                    onClick={() => router.push('/profile/edit')}
                    className="w-full bg-blue-500 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-400 rounded-lg py-2 mt-4"
                >
                    Edit
                </Button>
            </div>
        </div>

    );
};

export default Profile;