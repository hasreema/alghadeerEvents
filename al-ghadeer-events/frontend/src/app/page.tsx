'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const isAuthenticated = !!localStorage.getItem('access_token');
    router.replace(isAuthenticated ? '/dashboard' : '/login');
  }, [router]);

  return null;
}