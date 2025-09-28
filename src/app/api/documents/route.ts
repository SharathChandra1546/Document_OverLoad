import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Get documents endpoint implementation will be added in later tasks
  return NextResponse.json({ message: 'Get documents endpoint placeholder' });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Process file with OCR
    const ocrFormData = new FormData();
    ocrFormData.append('file', file);
    
    const ocrResponse = await fetch(`${request.nextUrl.origin}/api/ocr`, {
      method: 'POST',
      body: ocrFormData,
    });
    
    if (!ocrResponse.ok) {
      const errorData = await ocrResponse.json();
      return NextResponse.json(
        { error: 'OCR processing failed', details: errorData },
        { status: 500 }
      );
    }
    
    const ocrResult = await ocrResponse.json();
    
    // Generate document ID
    const documentId = `doc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    
    // Return document information
    return NextResponse.json({
      id: documentId,
      filename: file.name,
      fileSize: file.size,
      fileType: file.type,
      ocrText: ocrResult.text,
      summary: ocrResult.summary,
      uploadedAt: new Date().toISOString(),
      status: 'processed'
    });

  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upload document',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}