'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoginButton from '@/components/Auth/LoginButton';

export default function Home() {
  const { authenticated } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    if (authenticated) {
      router.push('/dashboard');
    }
  }, [authenticated, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-indigo-50 to-white">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mb-8">
            Upload and manage your content on IPFS
          </p>
        </div>
        
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
            Welcome Back
          </h2>
          <p className="text-gray-600 text-center mb-6">
            Connect your wallet to access your dashboard
          </p>
          <LoginButton />
        </div>
        
        <div className="text-center text-sm text-gray-500">
          <p>Supported file type: PNG images only</p>
          <p className="mt-1">Max file size: 100MB</p>
        </div>
      </div>
    </main>
  );
}