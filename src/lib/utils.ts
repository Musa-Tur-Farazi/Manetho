import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Downloads a file from a URL by fetching it as a blob and creating a download link
 * @param url - The URL of the file to download
 * @param filename - The desired filename for the download
 * @param fallbackUrl - Optional fallback URL to open in new tab if download fails
 */
export async function downloadFile(url: string, filename: string, fallbackUrl?: string): Promise<void> {
  try {
    console.log(`📥 Starting download: ${filename}`);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;

    // Add the link to DOM temporarily
    document.body.appendChild(link);

    // Trigger download
    link.click();

    // Clean up
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);

    console.log(`✅ Download initiated: ${filename}`);
  } catch (error) {
    console.error('❌ Download failed:', error);

    // Show user-friendly error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.warn(`Download failed for ${filename}: ${errorMessage}. Opening in new tab instead.`);

    // Fallback to opening in new tab
    if (fallbackUrl) {
      window.open(fallbackUrl, '_blank');
    } else {
      window.open(url, '_blank');
    }
  }
}
