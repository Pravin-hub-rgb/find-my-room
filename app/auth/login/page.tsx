'use client';

import { Suspense } from 'react';
import LoginComponent from '@/app/auth/login/LoginComponent';// assuming Login logic is inside this component

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginComponent />
    </Suspense>
  );
}
