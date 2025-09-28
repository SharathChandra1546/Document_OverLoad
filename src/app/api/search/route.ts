import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Search documents endpoint implementation will be added in later tasks
  return NextResponse.json({ message: 'Search documents endpoint placeholder' });
}