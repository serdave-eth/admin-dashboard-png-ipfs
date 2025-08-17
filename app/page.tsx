'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import TopCreators from '@/components/TopCreators';

function HomeContent() {
  const { authenticated } = usePrivy();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Removed automatic redirect - let authenticated users stay on landing page

  return (
    <div className="h-[calc(100vh-64px)] bg-white flex flex-col">
      {/* Hero Section - Header is 64px (h-16) */}
      <main className="flex-1 flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-black mb-6 tracking-tight">
              Patreon for
              <br />
              <span className="text-blue-600">Creator Coins</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-12">
              Support creators through coin ownership and unlock exclusive content.
            </p>
            
            {/* Creator Profile Icons */}
            <div className="flex justify-center items-center mb-12">
              <TopCreators />
            </div>
            
            <div className="flex justify-center items-center">
              <button 
                onClick={() => router.push('/explore')}
                className="bg-black text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Explore Creators
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black mb-4"></div>
          <p className="text-black">Loading...</p>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}