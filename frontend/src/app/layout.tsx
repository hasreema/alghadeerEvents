'use client';

import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { useState } from 'react';
import '@/styles/globals.css';

// Extend Chakra UI theme for RTL support and Al Ghadeer branding
const theme = extendTheme({
  direction: 'ltr', // Will be dynamically changed based on language
  colors: {
    brand: {
      50: '#E6F3FF',
      100: '#BAE3FF',
      200: '#8ED3FF',
      300: '#62C3FF',
      400: '#36B3FF',
      500: '#0A93FF', // Primary blue
      600: '#0882E6',
      700: '#0671CC',
      800: '#0460B3',
      900: '#024F99',
    },
    gold: {
      50: '#FFFBF0',
      100: '#FFF3D1',
      200: '#FFEBB3',
      300: '#FFE394',
      400: '#FFDB76',
      500: '#FFD700', // Gold accent
      600: '#E6C200',
      700: '#CCAD00',
      800: '#B39900',
      900: '#998400',
    },
  },
  fonts: {
    heading: "'Cairo', 'Heebo', 'Inter', sans-serif",
    body: "'Cairo', 'Heebo', 'Inter', sans-serif",
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'brand',
      },
    },
    Input: {
      defaultProps: {
        focusBorderColor: 'brand.500',
      },
    },
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: 1,
          },
        },
      })
  );

  return (
    <html lang="en">
      <head>
        <title>Al Ghadeer Events Management System</title>
        <meta name="description" content="Comprehensive event management system for hall owners" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Arabic and Hebrew fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@200;300;400;500;600;700&family=Heebo:wght@100;200;300;400;500;600;700;800;900&family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <ChakraProvider theme={theme}>
            <LanguageProvider>
              <AuthProvider>
                <div id="root">
                  {children}
                </div>
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 5000,
                    style: {
                      background: '#363636',
                      color: '#fff',
                    },
                    success: {
                      style: {
                        background: '#10B981',
                      },
                    },
                    error: {
                      style: {
                        background: '#EF4444',
                      },
                    },
                  }}
                />
              </AuthProvider>
            </LanguageProvider>
          </ChakraProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}