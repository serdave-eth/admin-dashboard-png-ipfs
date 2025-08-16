'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import Header from '@/components/UI/Header';
import UploadForm from '@/components/Upload/UploadForm';
import ContentFeed from '@/components/Content/ContentFeed';

export default function Dashboard() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <UploadForm onUploadSuccess={handleUploadSuccess} />
            </div>
            
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-lg font-semibold mb-4">Your Content</h2>
                <ContentFeed refreshTrigger={refreshTrigger} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}