// app/rooms/[id]/ContactOwner.tsx
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { buttonVariants } from "@/components/ui/button";

interface ContactOwnerProps {
  user_id: string; // user_id from the room (linked to profiles.id)
}

const ContactOwner: React.FC<ContactOwnerProps> = ({ user_id }) => {
  const [ownerEmail, setOwnerEmail] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOwnerEmail() {
      const { data, error } = await supabase
        .from('profiles') // fetching from profiles
        .select('email')
        .eq('id', user_id)
        .single();

      if (error) {
        console.error("Error fetching owner's email:", error);
        return;
      }

      setOwnerEmail(data?.email || null);
    }

    fetchOwnerEmail();
  }, [user_id]);

  return (
    <div>
      {ownerEmail ? (
        <a
          href={`mailto:${ownerEmail}?subject=I'm interested in your room posted on Find-My-Room`}
          className="inline-block px-5 py-2.5 bg-blue-600 text-white text-base font-semibold rounded-md hover:bg-blue-700 transition duration-200"
        >
          Contact Owner
        </a>
      ) : (
        <p>Loading owner details...</p>
      )}
    </div>
  );
};

export default ContactOwner;
