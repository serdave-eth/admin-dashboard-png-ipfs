export interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  creator: {
    name: string;
    symbol: string;
    marketCap: string;
    address: string;
  };
}

export interface OnrampData {
  requiredAmount: number;
  walletAddress: string;
  asset: 'USDC';
  network: 'base' | 'ethereum';
}

export enum PurchaseStep {
  INPUT = 'input',
  CONFIRMING = 'confirming',
  ONRAMP = 'onramp',
  PURCHASING = 'purchasing',
  SUCCESS = 'success',
  ERROR = 'error'
}

export interface PurchaseState {
  step: PurchaseStep;
  tokenAmount: number;
  totalCost: number;
  requiredUSDC: number;
  error?: string;
  txHash?: string;
}