export interface ContentItem {
  id: string;
  userWalletAddress: string;
  filename: string;
  fileType: string;
  fileSize: bigint;
  ipfsCid: string;
  coinContractAddress?: string | null;
  minimumTokenAmount?: string | null;
  createdAt: Date;
}

export interface UploadResponse {
  success: boolean;
  cid?: string;
  error?: string;
  content?: ContentItem;
}

export interface ContentResponse {
  items: ContentItem[];
  nextCursor?: string;
  hasMore: boolean;
}

// Creator page content interface
export interface Content {
  id: string;
  title: string;
  type: 'image' | 'video' | 'text' | 'audio';
  thumbnail: string;
  url: string;
  description: string;
  requiredBalance: number;
  createdAt: string;
  likes: number;
  views: number;
  isPremium: boolean;
  coinAddress?: string;
  creatorAddress?: string;
}

// Creator interface
export interface Creator {
  id: string;
  name: string;
  username: string;
  profileImage: string;
  coinSymbol: string;
  coinPrice: number;
  marketCap: number;
  holders: number;
  contentCount: number;
  unlockThreshold: number;
  coinAddress?: string;
  creatorAddress?: string;
}

// Zora coin information
export interface ZoraCoinInfo {
  address: string;
  name: string;
  symbol: string;
  totalSupply: string;
  marketCap: string;
  price: number;
  holders: number;
  volume24h: string;
  description?: string;
  mediaContent?: {
    previewImage?: {
      small?: string;
      medium?: string;
    };
  };
}

export type FileType = 'png';

export const ALLOWED_FILE_TYPES: Record<FileType, string[]> = {
  png: ['image/png'],
};

export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB