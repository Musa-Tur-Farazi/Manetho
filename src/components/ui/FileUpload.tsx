"use client";

import { useState, useRef } from 'react';
import { Upload, X, File, Image, Loader2, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { useFileUpload } from '@/hooks/useFileUpload';

interface FileUploadProps {
  onFileUploaded?: (file: {
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
    downloadUrl: string;
    previewUrl?: string;
  }) => void;
  onFileRemoved?: () => void;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  disabled?: boolean;
  showPreview?: boolean;
}

export default function FileUpload({
  onFileUploaded,
  onFileRemoved,
  accept = "image/*,.pdf,.doc,.docx,.txt",
  maxSize = 10,
  className = "",
  disabled = false,
  showPreview = true,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const {
    uploading,
    error,
    uploadedFile,
    uploadFile,
    deleteFile,
    reset
  } = useFileUpload();

  const handleFileSelect = async (file: File) => {
    if (disabled) return;

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File too large. Maximum size is ${maxSize}MB.`);
      return;
    }

    const result = await uploadFile(file);
    if (result && onFileUploaded) {
      onFileUploaded(result);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleRemoveFile = async () => {
    if (uploadedFile) {
      const success = await deleteFile(uploadedFile.id);
      if (success && onFileRemoved) {
        onFileRemoved();
      }
    } else {
      reset();
      if (onFileRemoved) {
        onFileRemoved();
      }
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const renderFilePreview = () => {
    if (!uploadedFile || !showPreview) return null;

    const isImage = uploadedFile.type.startsWith('image/');
    const isPDF = uploadedFile.type === 'application/pdf';

    return (
      <div className="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isImage ? (
              uploadedFile.previewUrl ? (
                <img
                  src={uploadedFile.previewUrl}
                  alt={uploadedFile.name}
                  className="w-12 h-12 object-cover rounded"
                />
              ) : (
                <Image className="w-12 h-12 text-blue-500" />
              )
            ) : (
              <File className="w-12 h-12 text-gray-500" />
            )}

            <div>
              <p className="font-medium text-gray-900 dark:text-white text-sm truncate max-w-48">
                {uploadedFile.name}
              </p>
              <p className="text-sm text-gray-500">
                {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </div>

          <Button
            onClick={handleRemoveFile}
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {isImage && uploadedFile.previewUrl && (
          <div className="mt-3">
            <img
              src={uploadedFile.previewUrl}
              alt={uploadedFile.name}
              className="max-w-full h-32 object-cover rounded"
            />
          </div>
        )}
      </div>
    );
  };

  if (uploadedFile && showPreview) {
    return renderFilePreview();
  }

  return (
    <div className={`relative ${className}`}>
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragOver
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${uploading ? 'pointer-events-none' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled || uploading}
        />

        {uploading ? (
          <div className="flex flex-col items-center space-y-2">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Uploading file...
            </p>
          </div>
        ) : (
          <>
            <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              <span className="font-medium text-blue-600 dark:text-blue-400">
                Click to upload
              </span>{' '}
              or drag and drop
            </p>
            <p className="text-xs text-gray-500">
              Images, PDFs, documents up to {maxSize}MB
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
} 