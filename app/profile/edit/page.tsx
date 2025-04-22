'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

const EditProfile = () => {
    const router = useRouter();
    const [profile, setProfile] = useState({ name: '', city: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // Fetch user session (authenticated user)
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setProfile((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Fetch user session (authenticated user)
            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (userError || !user) {
                setError('User is not authenticated.');
                setLoading(false);
                return;
            }

            // Update profile data in the profiles table
            const { error } = await supabase
                .from('profiles')
                .update({ name: profile.name, city: profile.city })
                .eq('id', user.id);

            if (error) {
                console.error('Error updating profile:', error.message);
                setError('An error occurred while updating your profile.');
                setLoading(false);
                return;
            }

            setSuccess(true);
            setLoading(false);
        } catch (err: any) {
            console.error('Error updating profile:', err.message);
            setError('An error occurred while updating your profile.');
            setLoading(false);
        }
    };

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

                    <div className="mb-6">
                        <label className="text-lg font-medium">City:</label>
                        <input
                            type="text"
                            name="city"
                            value={profile.city}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
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
