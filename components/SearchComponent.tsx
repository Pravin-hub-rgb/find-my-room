// app/components/SearchComponent.tsx
'use client';

import { useSearchParams } from 'next/navigation';

export default function SearchComponent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query');

  return <div>Search Query: {query}</div>;
}
