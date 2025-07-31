import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'No image URL provided' },
        { status: 400 }
      );
    }

    console.log('Testing image access:', imageUrl);

    // Try to fetch the image
    const response = await fetch(imageUrl, {
      method: 'HEAD', // Just check headers, don't download the full image
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Manetho/1.0)',
      }
    });

    console.log('Image access test response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (response.ok) {
      return NextResponse.json({
        accessible: true,
        status: response.status,
        statusText: response.statusText,
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length'),
        lastModified: response.headers.get('last-modified'),
        imageUrl: imageUrl
      });
    } else {
      return NextResponse.json({
        accessible: false,
        status: response.status,
        statusText: response.statusText,
        error: `Image not accessible: ${response.status} ${response.statusText}`,
        imageUrl: imageUrl
      });
    }

  } catch (error) {
    console.error('Error testing image access:', error);
    return NextResponse.json({
      accessible: false,
      error: `Network error: ${error instanceof Error ? error.message : String(error)}`,
      imageUrl: request.nextUrl.searchParams.get('url')
    }, { status: 500 });
  }
} 