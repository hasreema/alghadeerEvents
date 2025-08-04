import type { Metadata } from 'next'
import { Inter, Rubik, Noto_Sans_Arabic } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const rubik = Rubik({ 
  subsets: ['hebrew'],
  variable: '--font-rubik',
})

const notoSansArabic = Noto_Sans_Arabic({ 
  subsets: ['arabic'],
  variable: '--font-noto-arabic',
})

export const metadata: Metadata = {
  title: 'Al Ghadeer Events Management System',
  description: 'Comprehensive event management system for hall owners',
  keywords: 'event management, hall management, wedding planning, event planning',
  authors: [{ name: 'Al Ghadeer Events' }],
  creator: 'Al Ghadeer Events',
  publisher: 'Al Ghadeer Events',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Al Ghadeer Events Management System',
    description: 'Comprehensive event management system for hall owners',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    siteName: 'Al Ghadeer Events',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Al Ghadeer Events Management System',
    description: 'Comprehensive event management system for hall owners',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${inter.variable} ${rubik.variable} ${notoSansArabic.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}