'use client';

import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { toast } from 'sonner';
import FileDropzone from './FileDropzone';
import LoadingSpinner from '@/components/UI/LoadingSpinner';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '@/types';
import { formatFileSize } from '@/lib/utils';
import { Upload, X } from 'lucide-react';

export default function UploadForm({ onUploadSuccess }: { onUploadSuccess: () => void }) {
  const { user, getAccessToken } = usePrivy();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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

  const handleFileSelect = (selectedFile: File) => {
    if (validateFile(selectedFile)) {
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !user) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const accessToken = await getAccessToken();
      
      const formData = new FormData();
      formData.append('file', file);

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
      xhr.send(formData);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload file');
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <h2 className="text-xl font-bold mb-6">Upload File</h2>
      
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

          <button
            onClick={handleUpload}
            disabled={uploading}
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