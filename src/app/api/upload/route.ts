import { NextRequest, NextResponse } from 'next/server';
import { Client, Storage, ID } from 'node-appwrite';

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
  .setKey(process.env.APPWRITE_API_KEY!);

const storage = new Storage(client);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({
        success: false,
        error: 'No file provided'
      }, { status: 400 });
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({
        success: false,
        error: 'File too large. Maximum size is 10MB.'
      }, { status: 400 });
    }

    // Validate file type (images only for this route)
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({
        success: false,
        error: 'Only image files are allowed.'
      }, { status: 400 });
    }

    const bucketId = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!;
    const fileId = ID.unique();

    console.log('Uploading file to Appwrite:', {
      name: file.name,
      type: file.type,
      size: file.size,
      bucketId,
      fileId
    });

    // Upload file to Appwrite with public read permissions
    const uploadedFile = await storage.createFile(
      bucketId,
      fileId,
      file,
      ['read("any")'] // Public read permissions
    );

    console.log('File uploaded successfully to Appwrite:', uploadedFile);

    // Generate URLs - Using /view instead of /preview since preview endpoint has issues
    const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
    const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
    const baseUrl = `${endpoint}/storage/buckets/${bucketId}/files/${fileId}`;
    const url = `${baseUrl}/view?project=${projectId}`;
    const downloadUrl = `${baseUrl}/download?project=${projectId}`;

    console.log('Generated URLs:', {
      endpoint,
      projectId,
      bucketId,
      fileId: uploadedFile.$id,
      baseUrl,
      previewUrl: url,
      downloadUrl
    });

    const result = {
      id: uploadedFile.$id,
      name: file.name,
      size: file.size,
      type: file.type,
      url: url,
      downloadUrl: downloadUrl,
      previewUrl: url
    };

    console.log('Returning upload result:', result);

    return NextResponse.json({
      success: true,
      file: result
    });

  } catch (error: any) {
    console.error('Upload error:', error);

    return NextResponse.json({
      success: false,
      error: error.message || 'Upload failed'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      return NextResponse.json({
        success: false,
        error: 'No file ID provided'
      }, { status: 400 });
    }

    const bucketId = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!;

    // Delete file from Appwrite
    await storage.deleteFile(bucketId, fileId);

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete error:', error);

    return NextResponse.json({
      success: false,
      error: error.message || 'Delete failed'
    }, { status: 500 });
  }
} 