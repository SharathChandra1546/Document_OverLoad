import { NextRequest, NextResponse } from 'next/server';
import { dbInitializer } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    // Only allow in development environment
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({
        success: false,
        error: 'Database initialization is not allowed in production',
      }, { status: 403 });
    }

    console.log('Initializing database...');
    
    // Initialize the database
    await dbInitializer.initializeAll();
    
    // Perform health check to verify initialization
    const health = await dbInitializer.healthCheck();
    
    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
      health,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Database initialization failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Database initialization failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}