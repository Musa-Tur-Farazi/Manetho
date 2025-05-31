'use client';

import { useState } from 'react';

export default function TestUploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setUploadedImageUrl(result.file.url);
        console.log('Upload successful:', result.file);
      } else {
        setError(result.error || 'Upload failed');
      }
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
          Upload Test
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Upload New Image:
          </h2>

          <div className="space-y-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500 dark:text-gray-400"
            />

            {selectedFile && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors"
            >
              {uploading ? 'Uploading...' : 'Upload Image'}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded text-red-700">
              Error: {error}
            </div>
          )}
        </div>

        {uploadedImageUrl && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Uploaded Image:
            </h2>

            <div className="space-y-4">
              <p className="text-sm font-mono bg-gray-100 p-3 rounded break-all">
                {uploadedImageUrl}
              </p>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <img
                  src={uploadedImageUrl}
                  alt="Uploaded image"
                  className="max-w-full max-h-96 mx-auto rounded-lg shadow-md"
                  onLoad={() => console.log('New image loaded successfully')}
                  onError={(e) => console.error('New image failed to load:', e)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 