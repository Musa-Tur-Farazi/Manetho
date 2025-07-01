'use client';

import { useState } from 'react';
import { downloadFile } from '@/lib/utils';

export default function TestUploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedFileData, setUploadedFileData] = useState<any>(null);
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
        setUploadedFileData(result.file);
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

  const getFileIcon = (fileType: string) => {
    if (fileType?.startsWith('image/')) {
      return '🖼️';
    }
    if (fileType === 'application/pdf') {
      return '📄';
    }
    if (fileType?.includes('document') || fileType?.includes('msword')) {
      return '📝';
    }
    if (fileType?.includes('zip')) {
      return '🗂️';
    }
    return '📎';
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
          📄 PDF & File Upload Test
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Upload Test File:
          </h2>

          <div className="space-y-4">
            <input
              type="file"
              accept="image/*,.pdf,.doc,.docx,.txt,.zip"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />

            {selectedFile && (
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <span className="text-2xl">{getFileIcon(selectedFile.type)}</span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {selectedFile.name}
                    </p>
                    <p>
                      Type: {selectedFile.type || 'Unknown'} • Size: {Math.round(selectedFile.size / 1024)} KB
                    </p>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors font-medium"
            >
              {uploading ? 'Uploading...' : `Upload ${selectedFile?.type === 'application/pdf' ? 'PDF' : 'File'}`}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded text-red-700">
              Error: {error}
            </div>
          )}

          {uploadedFileData && (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
              <h3 className="font-semibold text-green-800 dark:text-green-300 mb-3">
                ✅ Upload Successful!
              </h3>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getFileIcon(uploadedFileData.type)}</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {uploadedFileData.name}
                  </span>
                </div>

                <p><strong>File ID:</strong> {uploadedFileData.id}</p>
                <p><strong>Type:</strong> {uploadedFileData.type}</p>
                <p><strong>Size:</strong> {Math.round(uploadedFileData.size / 1024)} KB</p>

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => window.open(uploadedFileData.url, '_blank')}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm transition-colors"
                  >
                    {uploadedFileData.type === 'application/pdf' ? '👁️ Preview PDF' : '👁️ View File'}
                  </button>

                  <button
                    onClick={() => downloadFile(uploadedFileData.url, uploadedFileData.name, uploadedFileData.downloadUrl)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm transition-colors"
                  >
                    ⬇️ Download
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            📋 Supported File Types:
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p className="font-medium text-gray-900 dark:text-white">Images:</p>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                <li>🖼️ JPEG, JPG, PNG, GIF, WebP</li>
              </ul>
            </div>

            <div className="space-y-2">
              <p className="font-medium text-gray-900 dark:text-white">Documents:</p>
              <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                <li>📄 PDF files</li>
                <li>📝 Word documents (.doc, .docx)</li>
                <li>📄 Text files (.txt)</li>
                <li>🗂️ ZIP archives</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Note:</strong> Maximum file size is 10MB. All files are uploaded to Appwrite storage with public read permissions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}