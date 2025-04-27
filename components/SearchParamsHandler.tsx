// components/SearchParamsHandler.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

const SearchParamsHandler = () => {
  const searchParams = useSearchParams();
  const toastShownRef = useRef(false);

  useEffect(() => {
    const success = searchParams.get("success");

    // Show toast only if success=login and it hasn't been shown yet
    if (success === "login" && !toastShownRef.current) {
      toast.success("Successfully logged in!");

      // Mark the toast as shown
      toastShownRef.current = true;

      // Remove the success parameter from the URL to prevent showing the toast on refresh
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("success");
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [searchParams]);

  return null; // This component doesn't need to render anything
};

export default SearchParamsHandler;
