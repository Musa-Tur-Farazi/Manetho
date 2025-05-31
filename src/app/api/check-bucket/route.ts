import { NextRequest, NextResponse } from 'next/server';
import { Client, Storage } from 'node-appwrite';

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const storage = new Storage(client);

export async function GET(request: NextRequest) {
  try {
    const bucketId = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!;

    console.log('Checking bucket:', bucketId);

    // Get bucket information
    const bucket = await storage.getBucket(bucketId);

    console.log('Bucket details:', bucket);

    return NextResponse.json({
      success: true,
      bucket: {
        id: bucket.$id,
        name: bucket.name,
        permissions: bucket.$permissions,
        fileSecurity: bucket.fileSecurity,
        enabled: bucket.enabled,
        maximumFileSize: bucket.maximumFileSize,
        allowedFileExtensions: bucket.allowedFileExtensions,
        compression: bucket.compression,
        encryption: bucket.encryption,
        antivirus: bucket.antivirus
      }
    });

  } catch (error: any) {
    console.error('Error checking bucket:', error);
    return NextResponse.json(
      {
        error: 'Failed to check bucket',
        details: error.message,
        code: error.code,
        type: error.type
      },
      { status: 500 }
    );
  }
} 