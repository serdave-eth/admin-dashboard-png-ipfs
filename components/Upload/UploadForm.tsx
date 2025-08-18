'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { toast } from 'sonner';
import FileDropzone from './FileDropzone';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '@/types';
import { formatFileSize } from '@/lib/utils';
import { Upload, X } from 'lucide-react';
import { useZoraLinking } from '@/lib/hooks/useZoraLinking';

export default function UploadForm({ onUploadSuccess }: { onUploadSuccess: () => void }) {
  const { user, getAccessToken } = usePrivy();
  const { zoraCoins, fetchZoraCoins, hasZoraLinked } = useZoraLinking();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedCoin, setSelectedCoin] = useState<string>('');
  const [minimumAmount, setMinimumAmount] = useState<string>('');

  // Fetch Zora coins when component mounts
  useEffect(() => {
    if (hasZoraLinked) {
      fetchZoraCoins();
    }
  }, [hasZoraLinked, fetchZoraCoins]);

  const validateFile = (file: File): boolean => {
    const allowedTypes = Object.values(ALLOWED_FILE_TYPES).flat();
    
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload PNG images only.');
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error(`File size must be less than ${formatFileSize(MAX_FILE_SIZE)}`);
      return false;
    }

    return true;
  };

  const validateCoinForm = (): boolean => {
    if (!selectedCoin) {
      toast.error('Please select a coin');
      return false;
    }
    
    if (!minimumAmount || parseFloat(minimumAmount) <= 0) {
      toast.error('Please enter a valid minimum token amount');
      return false;
    }

    return true;
  };

  const handleFileSelect = (selectedFile: File) => {
    if (validateFile(selectedFile)) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !user) return;

    // Validate coin form if Zora is linked
    if (hasZoraLinked && !validateCoinForm()) {
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const accessToken = await getAccessToken();
      
      const formData = new FormData();
      formData.append('file', file);
      
      // Add coin data if Zora is linked
      if (hasZoraLinked && selectedCoin && minimumAmount) {
        formData.append('coinContractAddress', selectedCoin);
        formData.append('minimumTokenAmount', minimumAmount);
      }

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setUploadProgress(Math.round(percentComplete));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          if (response.success) {
            toast.success('File uploaded successfully!');
            setFile(null);
            setUploadProgress(0);
            setSelectedCoin('');
            setMinimumAmount('');
            onUploadSuccess();
          } else {
            toast.error(response.error || 'Upload failed');
          }
        } else {
          toast.error('Upload failed');
        }
        setUploading(false);
      });

      xhr.addEventListener('error', () => {
        toast.error('Upload failed');
        setUploading(false);
      });

      xhr.open('POST', '/api/upload');
      xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
      xhr.setRequestHeader('X-Wallet-Address', user?.wallet?.address || '');
      xhr.send(formData);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      
      {!file ? (
        <FileDropzone onFileSelect={handleFileSelect} />
      ) : (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-base font-semibold text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-600">{formatFileSize(file.size)}</p>
              </div>
              {!uploading && (
                <button
                  onClick={() => setFile(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            
            {uploading && (
              <div className="mt-3">
                <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm font-medium text-gray-700 mt-2">{uploadProgress}% uploaded</p>
              </div>
            )}
          </div>

          {/* Coin Selection Form */}
          {hasZoraLinked && zoraCoins.filter(coin => coin.isOwner).length > 0 && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Content Access Requirements</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="coin-select" className="block text-sm font-medium text-gray-700 mb-2">
                    Select Creator Coin
                  </label>
                  <select
                    id="coin-select"
                    value={selectedCoin}
                    onChange={(e) => setSelectedCoin(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={uploading}
                  >
                    <option value="">Choose a coin</option>
                    {zoraCoins.filter(coin => coin.isOwner).map((coin, index) => (
                      <option key={`${coin.id || coin.coin?.address || 'coin'}-${index}`} value={coin.coin?.address || ''}>
                        {coin.coin?.name || 'Unknown'} ({coin.coin?.symbol || 'N/A'}) - Balance: {coin.balanceDecimal ? coin.balanceDecimal.toLocaleString(undefined, { maximumFractionDigits: 6 }) : coin.balance}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="minimum-amount" className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Coin Amount Required
                  </label>
                  <input
                    type="number"
                    id="minimum-amount"
                    value={minimumAmount}
                    onChange={(e) => setMinimumAmount(e.target.value)}
                    placeholder="e.g., 100"
                    min="0"
                    step="0.000001"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={uploading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Users must hold at least this amount to view
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* No Zora Account Message */}
          {!hasZoraLinked && (
            <div className="border-t pt-6">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Link Zora Account for Token Gating
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>Link your Zora account to set content access requirements based on coin ownership.</p>
                      <p className="mt-1">This allows you to restrict content to users who hold specific amounts of your coins.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* No Coins Message */}
          {hasZoraLinked && zoraCoins.filter(coin => coin.isOwner).length === 0 && (
            <div className="border-t pt-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      No Creator Coins Found
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>You need to be the creator of at least one coin to set content access requirements.</p>
                      <p className="mt-1">Launch your own creator coin on Zora to enable content gating.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={uploading || (hasZoraLinked && (!selectedCoin || !minimumAmount))}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white px-6 py-4 rounded-lg font-semibold text-base transition-colors"
          >
            {uploading ? (
              <>
                <LoadingSpinner size="sm" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Upload to IPFS
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}