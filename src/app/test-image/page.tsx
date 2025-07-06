'use client';

import { useState } from 'react';

export default function TestImagePage() {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [errorDetails, setErrorDetails] = useState('');

  const testImageUrl = 'https://cloud.appwrite.io/v1/storage/buckets/683947d1003cec98d984/files/683ab4d3002920f5dca2/preview?project=683946c4002d95fa0431';

  const handleImageLoad = () => {
    console.log('Image loaded successfully');
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = (e: any) => {
    console.error('Image failed to load:', e);
    setImageError(true);
    setImageLoaded(false);
    setErrorDetails(`Error loading image: ${e.type}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-900 dark:text-white">
          Image Loading Test
        </h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Test Image URL:
          </h2>
          <p className="text-sm font-mono bg-gray-100 dark:bg-gray-700 p-3 rounded break-all text-gray-800 dark:text-gray-200">
            {testImageUrl}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Image Display Test:
          </h2>

          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
            <img
              src={testImageUrl}
              alt="Test image"
              className="max-w-full max-h-96 mx-auto rounded-lg shadow-md"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />

            {!imageLoaded && !imageError && (
              <div className="text-gray-500 dark:text-gray-400 mt-4">
                Loading image...
              </div>
            )}

            {imageError && (
              <div className="text-red-500 mt-4">
                <div className="text-lg font-semibold">❌ Image failed to load</div>
                <div className="text-sm mt-2">{errorDetails}</div>
              </div>
            )}

            {imageLoaded && (
              <div className="text-green-500 mt-4">
                <div className="text-lg font-semibold">✅ Image loaded successfully!</div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Status:
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Image Loaded:</span>
              <span className={imageLoaded ? 'text-green-500' : 'text-red-500'}>
                {imageLoaded ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Error Occurred:</span>
              <span className={imageError ? 'text-red-500' : 'text-green-500'}>
                {imageError ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => window.open(testImageUrl, '_blank')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Open Image in New Tab
          </button>
        </div>
      </div>
    </div>
  );
} 