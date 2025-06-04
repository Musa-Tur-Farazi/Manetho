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
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return NextResponse.json(
        { error: 'No file ID provided' },
        { status: 400 }
      );
    }

    const bucketId = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!;

    console.log('Checking file:', fileId, 'in bucket:', bucketId);

    try {
      // Get file details
      const file = await storage.getFile(bucketId, fileId);

      console.log('File details:', file);

      return NextResponse.json({
        success: true,
        exists: true,
        file: {
          id: file.$id,
          name: file.name,
          size: file.sizeOriginal,
          mimeType: file.mimeType,
          permissions: file.$permissions,
          createdAt: file.$createdAt,
          updatedAt: file.$updatedAt
        }
      });

    } catch (fileError: any) {
      console.log('File not found or error:', fileError.message);

      return NextResponse.json({
        success: true,
        exists: false,
        error: fileError.message,
        code: fileError.code,
        type: fileError.type
      });
    }

  } catch (error: any) {
    console.error('Error checking file:', error);
    return NextResponse.json(
      {
        error: 'Failed to check file',
        details: error.message,
        code: error.code,
        type: error.type
      },
      { status: 500 }
    );
  }
} 