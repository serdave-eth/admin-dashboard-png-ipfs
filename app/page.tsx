'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LoginButton from '@/components/Auth/LoginButton';

export default function Home() {
  const { authenticated } = usePrivy();
  const router = useRouter();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (authenticated) {
      router.push('/dashboard');
    }
  }, [authenticated, router]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{backgroundColor: '#F6CA46'}}>
      {/* Cursor glow effect */}
      <div 
        className="pointer-events-none fixed w-64 h-64 rounded-full bg-black/10 blur-3xl transition-all duration-300 ease-out z-0"
        style={{ 
          left: `${mousePosition.x - 128}px`, 
          top: `${mousePosition.y - 128}px` 
        }}
      />

      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center p-24">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="inline-block mb-4">
              <span className="text-sm font-medium text-blue-400 bg-blue-400/10 px-4 py-2 rounded-full border border-blue-400/20">
                ⚡ Admin Portal
              </span>
            </div>
            <h1 className="text-6xl md:text-7xl font-anton text-black mb-6 tracking-tight">
              BACKSTAGE
            </h1>
            <p className="text-xl text-black/80 max-w-2xl mx-auto leading-relaxed mb-8">
              Upload and manage your content on IPFS with token-gated access
            </p>
          </div>
          
          <div className="group bg-black/10 rounded-3xl p-8 cursor-pointer hover:scale-105 transition-all duration-300 border border-black/20 hover:border-black/30 relative overflow-hidden">
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/5 to-orange-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative">
              <h2 className="text-3xl font-anton text-black mb-4 text-center tracking-wide">
                WELCOME BACK
              </h2>
              <p className="text-black/70 text-center mb-6">
                Connect your wallet to access your dashboard
              </p>
              <LoginButton />
            </div>
          </div>
          
          <div className="text-center">
            <div className="bg-black/10 rounded-2xl p-4 border border-black/20">
              <p className="text-black/80 font-bold">Supported file type: PNG images only</p>
              <p className="text-black/70 mt-1">Max file size: 100MB</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}