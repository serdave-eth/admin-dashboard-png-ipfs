// Token price calculation utilities

const TOTAL_SUPPLY = 1000000000; // 1 billion tokens

/**
 * Calculate the price per token based on market cap
 * @param marketCap - The market cap of the token
 * @returns Price per token in USD
 */
export function calculateTokenPrice(marketCap: string | number): number {
  const cap = typeof marketCap === 'string' ? parseFloat(marketCap) : marketCap;
  if (isNaN(cap) || cap <= 0) return 0;
  return cap / TOTAL_SUPPLY;
}

/**
 * Calculate total cost for purchasing tokens
 * @param tokenAmount - Number of tokens to purchase
 * @param tokenPrice - Price per token in USD
 * @returns Total cost in USD
 */
export function calculateTotalCost(tokenAmount: number, tokenPrice: number): number {
  return tokenAmount * tokenPrice;
}

/**
 * Format price for display
 * @param price - Price in USD
 * @param decimals - Number of decimal places
 * @returns Formatted price string
 */
export function formatPrice(price: number, decimals: number = 4): string {
  if (price === 0) return '$0.00';
  if (price < 0.0001) return '<$0.0001';
  return `$${price.toFixed(decimals)}`;
}

/**
 * Format USDC amount for display
 * @param amount - Amount in USDC
 * @returns Formatted USDC string
 */
export function formatUSDC(amount: number): string {
  return `$${amount.toFixed(2)} USDC`;
}

/**
 * Calculate required USDC for purchase
 * @param totalCost - Total cost of purchase
 * @param currentBalance - Current USDC balance
 * @returns Required USDC amount to onramp
 */
export function calculateRequiredUSDC(totalCost: number, currentBalance: number): number {
  const required = totalCost - currentBalance;
  return required > 0 ? required : 0;
}