"use client";

import { useState, useRef } from 'react';
import { Upload, X, File, Image, Loader2, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { useFileUpload } from '@/hooks/useFileUpload';
import { downloadFile } from '@/lib/utils';

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
    const isDocument = uploadedFile.type.includes('document') || uploadedFile.type.includes('msword');

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
            ) : isPDF ? (
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded flex items-center justify-center">
                <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                  <path d="M14 2v6h6" />
                  <path d="M8.267 14.68c-.184 0-.308.018-.372.036v1.178c.076.018.171.023.302.023.479 0 .774-.242.774-.651 0-.366-.254-.586-.704-.586zm3.487.012c-.2 0-.33.018-.407.036v2.61c.077.018.201.018.313.018.817.006 1.349-.444 1.349-1.396.006-.83-.479-1.268-1.255-1.268z" />
                </svg>
              </div>
            ) : isDocument ? (
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
                  <path d="M14 2v6h6" />
                  <path d="M10.5 12.5L9.5 16l-1-3.5L7.5 16l-1-3.5h1.25l.5 2 .5-2h.5l.5 2 .5-2h1.25z" />
                </svg>
              </div>
            ) : (
              <File className="w-12 h-12 text-gray-500" />
            )}

            <div>
              <p className="font-medium text-gray-900 dark:text-white text-sm truncate max-w-48">
                {isPDF && '📄 '}{uploadedFile.name}
              </p>
              <p className="text-sm text-gray-500">
                {isPDF && 'PDF • '}{isDocument && 'Document • '}{(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {(isPDF || isDocument) && (
              <Button
                onClick={() => window.open(uploadedFile.url, '_blank')}
                variant="ghost"
                size="sm"
                className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                title="Preview file"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </Button>
            )}

            <Button
              onClick={() => downloadFile(uploadedFile.url, uploadedFile.name, uploadedFile.downloadUrl)}
              variant="ghost"
              size="sm"
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
              title="Download file"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </Button>

            <Button
              onClick={handleRemoveFile}
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
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

        {isPDF && (
          <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
            <p className="text-sm text-red-700 dark:text-red-300">
              📄 PDF file ready for upload. Click preview to view the document.
            </p>
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