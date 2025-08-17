import type { Metadata } from 'next';
import { Anton } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import './globals.css';
import Providers from '@/components/Providers';
import Header from '@/components/UI/Header';

const anton = Anton({ 
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton"
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono"
});

export const metadata: Metadata = {
  title: 'Backstage - Admin Dashboard',
  description: 'Upload and manage your content on IPFS with token-gated access',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistMono.variable} ${anton.variable} font-mono antialiased`}>
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}