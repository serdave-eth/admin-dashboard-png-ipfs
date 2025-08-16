'use client';

import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import LoadingSpinner from '@/components/UI/LoadingSpinner';

interface InfiniteScrollProps {
  children: React.ReactNode;
  loadMore: () => void;
  hasMore: boolean;
  loading: boolean;
}

export default function InfiniteScroll({
  children,
  loadMore,
  hasMore,
  loading,
}: InfiniteScrollProps) {
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  });

  useEffect(() => {
    if (inView && hasMore && !loading) {
      loadMore();
    }
  }, [inView, hasMore, loading, loadMore]);

  return (
    <>
      {children}
      {hasMore && (
        <div ref={ref} className="flex justify-center py-4">
          {loading && <LoadingSpinner />}
        </div>
      )}
      {!hasMore && (
        <div className="text-center py-4 text-gray-500 text-sm">
          No more content to load
        </div>
      )}
    </>
  );
}