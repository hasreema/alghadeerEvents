'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Spinner, Center } from '@chakra-ui/react';
import { useAuth } from '@/hooks/useAuth';
import Dashboard from '@/components/Dashboard/Dashboard';
import LoginPage from '@/components/Auth/LoginPage';

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect based on authentication status
    if (!isLoading) {
      if (!user) {
        router.push('/login');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="brand.500" />
      </Center>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <Dashboard />;
}