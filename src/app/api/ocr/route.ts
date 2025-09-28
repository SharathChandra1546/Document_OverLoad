import { NextRequest, NextResponse } from 'next/server';
import { ocrService } from '@/lib/services/ocr';

// OCR API endpoint that mimics the Python backend functionality
export async function POST(request: NextRequest) {
  try {
    let formData: FormData;
    let file: File;
    
    try {
      formData = await request.formData();
      file = formData.get('file') as File;
    } catch (error) {
      console.error('FormData parsing error:', error);
      return NextResponse.json(
        { error: 'Invalid form data format' },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Check file size (limit to 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB' },
        { status: 400 }
      );
    }

    // Supported file types for OCR
    const supportedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/tiff',
      'image/bmp',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!supportedTypes.includes(file.type) && 
        !file.name.match(/\.(pdf|jpg|jpeg|png|tiff|bmp|doc|docx)$/i)) {
      return NextResponse.json(
        { 
          error: 'File type not supported for OCR',
          supportedTypes: supportedTypes
        },
        { status: 400 }
      );
    }

    console.log(`Processing file: ${file.name} (${file.type}, ${file.size} bytes)`);

    // Use the OCR service to process the file
    const result = await ocrService.processFile(file);

    console.log(`OCR processing completed for: ${file.name}`);

    return NextResponse.json({
      filename: file.name,
      text: result.text,
      summary: result.summary,
      fileSize: file.size,
      fileType: file.type,
      processingTimestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('OCR processing error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process file with OCR',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
