import { ContentItem, ContentResponse } from '@/types';

export interface ContentFetchParams {
  coinAddress: string;
  limit?: number;
  cursor?: string;
}

export interface ContentServiceInterface {
  fetchCreatorContent: (params: ContentFetchParams) => Promise<ContentResponse>;
  checkContentAccess: (content: ContentItem, userBalance: number) => boolean;
  formatFileSize: (sizeInBytes: string) => string;
  buildContentImageUrl: (ipfsCid: string) => string;
  buildContentDownloadUrl: (ipfsCid: string) => string;
}

export class ContentService implements ContentServiceInterface {
  private readonly ipfsGateway = 'https://gateway.pinata.cloud/ipfs/';
  private readonly defaultLimit = 20;

  async fetchCreatorContent(params: ContentFetchParams): Promise<ContentResponse> {
    const { coinAddress, limit = this.defaultLimit, cursor } = params;
    
    try {
      const searchParams = new URLSearchParams({
        limit: limit.toString()
      });
      
      if (cursor) {
        searchParams.append('cursor', cursor);
      }
      
      const response = await fetch(`/api/content/creator/${coinAddress}?${searchParams}`);
      const data = await response.json();
      
      if (data.success === false) {
        return {
          items: [],
          hasMore: false
        };
      }
      
      return {
        items: data.items || [],
        nextCursor: data.nextCursor,
        hasMore: data.hasMore || false
      };
    } catch (error) {
      console.error('Failed to fetch content:', error);
      return {
        items: [],
        hasMore: false
      };
    }
  }

  checkContentAccess(content: ContentItem, userBalance: number): boolean {
    const requiredBalance = content.minimumTokenAmount ? parseFloat(content.minimumTokenAmount) : 0;
    return userBalance >= requiredBalance;
  }

  formatFileSize(sizeInBytes: string): string {
    const bytes = parseInt(sizeInBytes);
    const megabytes = bytes / (1024 * 1024);
    return `${megabytes.toFixed(2)} MB`;
  }

  buildContentImageUrl(ipfsCid: string): string {
    return `${this.ipfsGateway}${ipfsCid}`;
  }

  buildContentDownloadUrl(ipfsCid: string): string {
    return `${this.ipfsGateway}${ipfsCid}`;
  }

  getRequiredBalance(content: ContentItem): number {
    return content.minimumTokenAmount ? parseFloat(content.minimumTokenAmount) : 0;
  }

  formatCreatedDate(createdAt: Date): string {
    return new Date(createdAt).toLocaleDateString();
  }
}

export const createContentService = (): ContentService => {
  return new ContentService();
};