import { ZoraCreatorData } from '@/lib/hooks/useZoraCreators';

interface ZoraCoin {
  coin?: {
    address?: string;
  };
  balance?: string;
  balanceDecimal?: number;
  decimals?: number;
}

export interface BalanceData {
  rawBalance: string;
  balanceDecimal: number;
  decimals: number;
}

export interface BalanceUtilsInterface {
  getUserBalanceForCoin: (coinAddress: string, zoraCoins: ZoraCoin[]) => BalanceData;
  formatBalance: (balance: number, decimals?: number) => string;
  hasMinimumBalance: (userBalance: number, requiredBalance: number) => boolean;
}

export class BalanceUtils implements BalanceUtilsInterface {
  getUserBalanceForCoin(coinAddress: string, zoraCoins: ZoraCoin[]): BalanceData {
    
    const userCoin = zoraCoins.find(zc => 
      zc.coin?.address?.toLowerCase() === coinAddress?.toLowerCase()
    );
    
    if (userCoin) {
      return {
        rawBalance: userCoin.balance || '0',
        balanceDecimal: userCoin.balanceDecimal || 0,
        decimals: userCoin.decimals || 18
      };
    }
    
    return {
      rawBalance: '0',
      balanceDecimal: 0,
      decimals: 18
    };
  }

  formatBalance(balance: number, decimals: number = 2): string {
    return balance.toLocaleString('en-US', { 
      minimumFractionDigits: decimals, 
      maximumFractionDigits: decimals 
    });
  }

  hasMinimumBalance(userBalance: number, requiredBalance: number): boolean {
    return userBalance >= requiredBalance;
  }

  debugBalanceCalculation(creator: ZoraCreatorData, userBalance: number): void {
  }

  getUserWalletAddress(user: { wallet?: { address?: string }; linkedAccounts?: Array<{ type: string; address?: string }> } | null): string | undefined {
    return user?.wallet?.address || user?.linkedAccounts?.find((account) => account.type === 'wallet')?.address;
  }
}

export const createBalanceUtils = (): BalanceUtils => {
  return new BalanceUtils();
};