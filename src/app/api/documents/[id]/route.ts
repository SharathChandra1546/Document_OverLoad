import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // Get single document endpoint implementation will be added in later tasks
  return NextResponse.json({ message: `Get document ${id} endpoint placeholder` });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // Delete document endpoint implementation will be added in later tasks
  return NextResponse.json({ message: `Delete document ${id} endpoint placeholder` });
}