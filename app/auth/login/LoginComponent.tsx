// LoginComponent.tsx
import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import Link from 'next/link';

const LoginComponent = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const toastShownRef = useRef(false);

  useEffect(() => {
    const success = searchParams.get("success");
    const toastParam = searchParams.get("toast");

    if (success === "signup" && !toastShownRef.current) {
      toast.success("A confirmation email has been sent to your inbox. Please verify your email to continue.");
      toastShownRef.current = true;

      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("success");
      window.history.replaceState({}, '', newUrl.toString());
    }

    if (toastParam === "contact-login-required" && !toastShownRef.current) {
      toast.error("Please log in to contact the owner.");
      toastShownRef.current = true;

      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("toast");
      window.history.replaceState({}, '', newUrl.toString());
    }
    if (toastParam === "unauthorized-post" && !toastShownRef.current) {
      toast.error("Please log in to post a room.");
      toastShownRef.current = true;

      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("toast");
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setError(error.message);
    } else {
      router.push('/?success=login');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-4">Login</h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-6">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-blue-500 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-400 rounded-lg py-2"
          >
            Login
          </Button>
        </form>

        {/* Signup link */}
        <p className="mt-4 text-center text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="text-blue-500 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginComponent;
