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
    console.log('=== GETTING USER BALANCE FOR COIN ===');
    console.log('Looking for coinAddress:', coinAddress);
    console.log('Available zoraCoins:', zoraCoins?.length || 0);
    
    const userCoin = zoraCoins.find(zc => 
      zc.coin?.address?.toLowerCase() === coinAddress?.toLowerCase()
    );
    console.log('Found userCoin in zoraCoins:', userCoin);
    
    if (userCoin) {
      return {
        rawBalance: userCoin.balance || '0',
        balanceDecimal: userCoin.balanceDecimal || 0,
        decimals: userCoin.decimals || 18
      };
    }
    
    console.log('No balance found for this coin in zoraCoins');
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
    console.log('=== USER BALANCE CALCULATION DEBUG ===');
    console.log('creator object:', creator);
    console.log('creator.userBalance (raw):', creator.userBalance);
    console.log('creator.userBalanceDecimal:', creator.userBalanceDecimal);
    console.log('calculated userBalance for display:', userBalance);
  }

  getUserWalletAddress(user: { wallet?: { address?: string }; linkedAccounts?: Array<{ type: string; address?: string }> } | null): string | undefined {
    return user?.wallet?.address || user?.linkedAccounts?.find((account) => account.type === 'wallet')?.address;
  }
}

export const createBalanceUtils = (): BalanceUtils => {
  return new BalanceUtils();
};