'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { toast } from 'sonner';
import ContentCard from './ContentCard';
import InfiniteScroll from './InfiniteScroll';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { ContentItem } from '@/types';

interface ContentFeedProps {
  refreshTrigger: number;
  creatorFilter?: string;
}

export default function ContentFeed({ refreshTrigger, creatorFilter }: ContentFeedProps) {
  const { user, getAccessToken } = usePrivy();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);

  const fetchContent = async (isRefresh = false) => {
    if (!user) return;

    try {
      const accessToken = await getAccessToken();
      const url = new URL('/api/content', window.location.origin);
      
      if (!isRefresh && cursor) {
        url.searchParams.append('cursor', cursor);
      }

      if (creatorFilter) {
        url.searchParams.append('creator', creatorFilter);
      }

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }

      const data = await response.json();
      
      if (isRefresh) {
        setItems(data.items);
      } else {
        setItems(prev => [...prev, ...data.items]);
      }
      
      setCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setItems([]);
    setCursor(null);
    setHasMore(true);
    setLoading(true);
    fetchContent(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTrigger, user, creatorFilter]);

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchContent(false);
    }
  };

  if (loading && items.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg font-medium text-gray-600 mb-3">No content uploaded yet</p>
        <p className="text-base text-gray-500">Upload your first file to get started</p>
      </div>
    );
  }

  return (
    <InfiniteScroll
      loadMore={loadMore}
      hasMore={hasMore}
      loading={loading}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <ContentCard key={item.id} item={item} />
        ))}
      </div>
    </InfiniteScroll>
  );
}