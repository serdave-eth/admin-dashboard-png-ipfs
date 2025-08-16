export interface ContentItem {
  id: string;
  userWalletAddress: string;
  filename: string;
  fileType: string;
  fileSize: bigint;
  ipfsCid: string;
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

export type FileType = 'png';

export const ALLOWED_FILE_TYPES: Record<FileType, string[]> = {
  png: ['image/png'],
};

export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB