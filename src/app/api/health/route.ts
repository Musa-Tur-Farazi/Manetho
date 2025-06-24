import { NextResponse } from 'next/server';
import { db } from '@/db';

export async function GET() {
  try {
    // Basic health check
    const response = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'unknown'
    };

    // Optional: Check database connectivity
    try {
      // Simple database ping
      await db.execute({ sql: 'SELECT 1 as health_check', args: [] });
      response.database = 'connected';
    } catch (dbError) {
      console.warn('Database health check failed:', dbError);
      response.database = 'disconnected';
      // Still return 200 if only DB is down but app is running
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 