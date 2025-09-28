import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Semantic search endpoint implementation will be added in later tasks
  return NextResponse.json({ message: 'Semantic search endpoint placeholder' });
}