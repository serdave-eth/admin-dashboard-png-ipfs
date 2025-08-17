'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { PurchaseModalProps, PurchaseStep } from '@/types/purchase';
import { 
  calculateTokenPrice, 
  calculateTotalCost, 
  formatPrice, 
  formatUSDC,
  calculateRequiredUSDC 
} from '@/lib/utils/tokenPrice';
import { useCoinbaseOnramp } from '@/hooks/useCoinbaseOnramp';

// Mock USDC balance - replace with actual balance check
const MOCK_USDC_BALANCE = 10; // User has $10 USDC

export default function PurchaseModal({ 
  isOpen, 
  onClose, 
  creator
}: PurchaseModalProps) {
  const [step, setStep] = useState<PurchaseStep>(PurchaseStep.INPUT);
  const [tokenAmount, setTokenAmount] = useState<string>('100');
  const [totalCost, setTotalCost] = useState<number>(0);
  const [requiredUSDC, setRequiredUSDC] = useState<number>(0);
  const [userUSDCBalance, setUserUSDCBalance] = useState<number>(MOCK_USDC_BALANCE);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  const { initiateOnramp } = useCoinbaseOnramp();
  
  const tokenPrice = calculateTokenPrice(creator.marketCap);

  useEffect(() => {
    const amount = parseFloat(tokenAmount) || 0;
    const cost = calculateTotalCost(amount, tokenPrice);
    setTotalCost(cost);
    
    const required = calculateRequiredUSDC(cost, userUSDCBalance);
    setRequiredUSDC(required);
  }, [tokenAmount, tokenPrice, userUSDCBalance]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setTokenAmount(value);
      setError('');
    }
  };

  const handlePurchase = async () => {
    const amount = parseFloat(tokenAmount);
    
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (totalCost <= 0) {
      setError('Invalid token price');
      return;
    }

    // Check if user needs to onramp USDC
    if (requiredUSDC > 0) {
      setStep(PurchaseStep.ONRAMP);
      
      await initiateOnramp({
        requiredAmount: requiredUSDC,
        onSuccess: () => {
          // After successful onramp, proceed to purchase
          setUserUSDCBalance(prev => prev + requiredUSDC);
          executePurchase();
        },
        onCancel: () => {
          setStep(PurchaseStep.INPUT);
        }
      });
    } else {
      // User has enough USDC, proceed directly
      executePurchase();
    }
  };

  const executePurchase = async () => {
    setStep(PurchaseStep.PURCHASING);
    setLoading(true);
    
    try {
      // TODO: Implement actual token purchase transaction
      // This would involve calling a smart contract or API
      console.log('Purchasing tokens:', {
        amount: tokenAmount,
        cost: totalCost,
        creator: creator.address
      });
      
      // Simulate purchase delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Success
      setStep(PurchaseStep.SUCCESS);
      
      // Close modal after 3 seconds
      setTimeout(() => {
        onClose();
        // Reset state
        setStep(PurchaseStep.INPUT);
        setTokenAmount('100');
      }, 3000);
      
    } catch (err: unknown) {
      setStep(PurchaseStep.ERROR);
      setError(err instanceof Error ? err.message : 'Purchase failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-black">
            Buy ${creator.symbol}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === PurchaseStep.INPUT && (
            <>
              {/* Token Info */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Token Price</span>
                  <span className="font-mono font-bold text-black">
                    {formatPrice(tokenPrice, 6)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Your USDC Balance</span>
                  <span className="font-mono font-bold text-green-600">
                    {formatUSDC(userUSDCBalance)}
                  </span>
                </div>
              </div>

              {/* Amount Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount of ${creator.symbol} to buy
                </label>
                <input
                  type="text"
                  value={tokenAmount}
                  onChange={handleAmountChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter amount"
                />
              </div>

              {/* Cost Calculation */}
              <div className="bg-blue-50 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-700">{tokenAmount || '0'} ${creator.symbol}</span>
                  <span className="text-gray-500">×</span>
                  <span className="text-gray-700">{formatPrice(tokenPrice, 6)}</span>
                </div>
                <div className="border-t border-blue-200 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">Total Cost</span>
                    <span className="font-bold text-xl text-black">
                      {formatUSDC(totalCost)}
                    </span>
                  </div>
                </div>
              </div>

              {/* USDC Status */}
              {requiredUSDC > 0 && (
                <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-yellow-900">
                        Insufficient USDC Balance
                      </p>
                      <p className="text-sm text-yellow-700 mt-1">
                        You need {formatUSDC(requiredUSDC)} more. We&apos;ll help you purchase it via Coinbase.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-300 rounded-xl p-3 mb-6">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Purchase Button */}
              <button
                onClick={handlePurchase}
                disabled={!tokenAmount || parseFloat(tokenAmount) <= 0 || loading}
                className="w-full bg-black text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {requiredUSDC > 0 
                  ? `Get ${formatUSDC(requiredUSDC)} & Buy`
                  : `Buy ${tokenAmount || '0'} ${creator.symbol}`
                }
              </button>
            </>
          )}

          {step === PurchaseStep.ONRAMP && (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">Opening Coinbase Onramp</h3>
              <p className="text-gray-600">
                Please complete your USDC purchase in the Coinbase window.
              </p>
            </div>
          )}

          {step === PurchaseStep.PURCHASING && (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">Processing Purchase</h3>
              <p className="text-gray-600">
                Buying {tokenAmount} ${creator.symbol} for {formatUSDC(totalCost)}
              </p>
            </div>
          )}

          {step === PurchaseStep.SUCCESS && (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">Purchase Complete!</h3>
              <p className="text-gray-600">
                You now own {tokenAmount} ${creator.symbol}
              </p>
            </div>
          )}

          {step === PurchaseStep.ERROR && (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">Purchase Failed</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => {
                  setStep(PurchaseStep.INPUT);
                  setError('');
                }}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-full font-medium hover:bg-gray-300"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}