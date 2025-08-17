import { ZoraCreatorData } from '@/lib/hooks/useZoraCreators';

export interface CreatorServiceInterface {
  fetchCreatorById: (coinAddress: string) => Promise<ZoraCreatorData | null>;
  updateCreatorBalance: (creator: ZoraCreatorData, balanceData: BalanceData) => ZoraCreatorData;
}

export interface BalanceData {
  rawBalance: string;
  balanceDecimal: number;
  decimals: number;
}

export class CreatorService implements CreatorServiceInterface {
  constructor(private getCreatorById: (coinAddress: string) => Promise<ZoraCreatorData | null>) {}

  async fetchCreatorById(coinAddress: string): Promise<ZoraCreatorData | null> {
    try {
      console.log('====== CREATOR SERVICE DEBUG ======');
      console.log('Target coin address from URL:', coinAddress);
      
      const creatorData = await this.getCreatorById(coinAddress);
      console.log('Raw API creator data:', creatorData);
      
      if (creatorData) {
        // Set initial balance data
        creatorData.userBalance = '0';
        creatorData.userBalanceDecimal = 0;
        console.log('Setting basic creator data:', creatorData);
        return creatorData;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to fetch creator:', error);
      return null;
    }
  }

  updateCreatorBalance(creator: ZoraCreatorData, balanceData: BalanceData): ZoraCreatorData {
    return {
      ...creator,
      userBalance: balanceData.rawBalance,
      userBalanceDecimal: balanceData.balanceDecimal,
      decimals: balanceData.decimals,
    };
  }
}

export const createCreatorService = (getCreatorById: (coinAddress: string) => Promise<ZoraCreatorData | null>) => {
  return new CreatorService(getCreatorById);
};