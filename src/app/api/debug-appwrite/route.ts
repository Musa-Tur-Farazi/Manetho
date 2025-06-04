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
    console.log('Debugging Appwrite connection...');

    const bucketId = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!;

    console.log('Environment variables:', {
      endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
      projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
      bucketId: bucketId,
      hasApiKey: !!process.env.APPWRITE_API_KEY
    });

    // Try to list files in the bucket
    const files = await storage.listFiles(bucketId);

    console.log(`Found ${files.documents.length} files in bucket`);

    // Get details for each file
    const fileDetails = files.documents.map(file => ({
      id: file.$id,
      name: file.name,
      size: file.sizeOriginal,
      mimeType: file.mimeType,
      permissions: file.$permissions,
      createdAt: file.$createdAt,
      updatedAt: file.$updatedAt
    }));

    return NextResponse.json({
      success: true,
      bucketId,
      totalFiles: files.documents.length,
      files: fileDetails
    });

  } catch (error: any) {
    console.error('Error debugging Appwrite:', error);
    return NextResponse.json(
      {
        error: 'Failed to debug Appwrite',
        details: error.message,
        code: error.code,
        type: error.type
      },
      { status: 500 }
    );
  }
} 