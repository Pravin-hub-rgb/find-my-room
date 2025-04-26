'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Modal from './ui/modal';

interface ContactOwnerProps {
  user_id: string;
}

const ContactOwner: React.FC<ContactOwnerProps> = ({ user_id }) => {
  const router = useRouter();
  const [ownerEmail, setOwnerEmail] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    async function fetchOwnerEmail() {
      const { data, error } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', user_id)
        .single();

      if (error) {
        console.error("Error fetching owner's email:", error);
        return;
      }

      setOwnerEmail(data?.email || null);
    }

    async function checkLogin() {
      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(!!data.session);
    }

    fetchOwnerEmail();
    checkLogin();
  }, [user_id]);

  const handleContactClick = () => {
    if (!isLoggedIn) {
      router.push('/auth/login?toast=contact-login-required');
      return;
    }
    setIsModalOpen(true);
  };

  const subject = `Interested in your room on Find-My-Room`;
  const body = `Hi,\n\nI'm ${name} and I'm interested in your room.\n\n${message}\n\nThanks!`;

  return (
    <>
      <button
        onClick={handleContactClick}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Contact Owner
      </button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Contact Owner"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Your Name</label>
            <input
              type="text"
              className="w-full border px-3 py-2 rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Message (optional)</label>
            <textarea
              className="w-full border px-3 py-2 rounded"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message"
            />
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              onClick={() => setIsModalOpen(false)}
              className="text-sm text-gray-600 hover:text-black"
            >
              Cancel
            </button>

            {ownerEmail && (
              <a
                href={`mailto:${ownerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => setIsModalOpen(false)}
              >
                Send Email
              </a>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ContactOwner;
