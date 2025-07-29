import { useState } from 'react';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  downloadUrl: string;
  previewUrl?: string;
}

interface UseFileUploadReturn {
  uploading: boolean;
  progress: number;
  error: string | null;
  uploadedFile: UploadedFile | null;
  uploadFile: (file: File) => Promise<UploadedFile | null>;
  deleteFile: (fileId: string) => Promise<boolean>;
  reset: () => void;
}

export const useFileUpload = (): UseFileUploadReturn => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);

  const uploadFile = async (file: File): Promise<UploadedFile | null> => {
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Validate file size
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('File too large. Maximum size is 10MB.');
      }

      const formData = new FormData();
      formData.append('file', file);

      // Upload file using fetch with progress tracking
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const result = await response.json();

      if (result.success) {
        setUploadedFile(result.file);
        setProgress(100);
        return result.file;
      } else {
        throw new Error(result.error || 'Upload failed');
      }

    } catch (err: any) {
      console.error('Upload error:', err);
      setError(err.message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (fileId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/upload?fileId=${fileId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Delete failed');
      }

      const result = await response.json();

      if (result.success) {
        setUploadedFile(null);
        return true;
      } else {
        throw new Error(result.error || 'Delete failed');
      }

    } catch (err: any) {
      console.error('Delete error:', err);
      setError(err.message);
      return false;
    }
  };

  const reset = () => {
    setUploading(false);
    setProgress(0);
    setError(null);
    setUploadedFile(null);
  };

  return {
    uploading,
    progress,
    error,
    uploadedFile,
    uploadFile,
    deleteFile,
    reset,
  };
}; 