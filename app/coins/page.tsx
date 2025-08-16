'use client';

import Header from '@/components/UI/Header';
import TopValuableCoins from '@/components/UI/TopValuableCoins';

export default function CoinsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Zora Coins Explorer
          </h1>
          <p className="text-gray-600 text-lg">
            Discover the most valuable coins on Zora using the Coins SDK
          </p>
        </div>

        <div className="space-y-8">
          {/* Top 10 Most Valuable Coins */}
          <TopValuableCoins count={10} />
          
          {/* Top 5 Most Valuable Coins (Alternative View) */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Alternative View: Top 5 Coins
            </h2>
            <TopValuableCoins count={5} />
          </div>
        </div>
      </main>
    </div>
  );
}
