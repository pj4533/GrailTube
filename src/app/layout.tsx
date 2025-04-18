import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AdminProviderWrapper from '@/components/AdminProviderWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'GrailTube - Discover Ultra-Rare YouTube Videos',
  description: 'Find unedited YouTube videos from camera footage.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AdminProviderWrapper>
          {children}
        </AdminProviderWrapper>
      </body>
    </html>
  );
}