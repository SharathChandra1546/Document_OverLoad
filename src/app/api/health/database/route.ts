import { NextRequest, NextResponse } from 'next/server';
import { dbInitializer } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    // Perform health check
    const health = await dbInitializer.healthCheck();
    
    const status = health.overall ? 200 : 503;
    
    return NextResponse.json({
      success: health.overall,
      timestamp: new Date().toISOString(),
      services: {
        postgres: {
          status: health.postgres ? 'healthy' : 'unhealthy',
          required: true,
        },
        milvus: {
          status: health.milvus ? 'healthy' : 'unhealthy',
          required: false,
        },
      },
      overall: health.overall ? 'healthy' : 'unhealthy',
    }, { status });
    
  } catch (error) {
    console.error('Database health check failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Database health check failed',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}