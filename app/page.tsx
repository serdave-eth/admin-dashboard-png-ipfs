'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import TopCreators from '@/components/TopCreators';

export default function Home() {
  const { authenticated } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (authenticated) {
      router.push('/dashboard');
    }
  }, [authenticated, router]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <main>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-black mb-6 tracking-tight">
              The Patreon for
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
            
            <div className="flex justify-center items-center mb-16">
              <button 
                onClick={() => router.push('/explore')}
                className="bg-black text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-800 transition-colors"
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