import { NextRequest, NextResponse } from 'next/server';
import { postgres } from '@/lib/database/postgres';
import { AuthService } from '@/lib/auth/service';

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

    // TODO: Get authenticated user - for now using placeholder
    const userId = 'auth-placeholder';

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
    
    // Save document to Supabase database
    const documentQuery = `
      INSERT INTO documents (
        title, filename, file_path, file_type, file_size, uploaded_by, 
        content_text, summary, status, tags, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, title, filename, file_path, file_type, file_size, 
                uploaded_at, updated_at, status, content_text, summary
    `;
    
    const documentResult = await postgres.query(documentQuery, [
      file.name.replace(/\.[^/.]+$/, ""), // title (filename without extension)
      file.name, // filename
      `/uploads/${file.name}`, // file_path (virtual path)
      file.type, // file_type
      file.size, // file_size
      userId, // uploaded_by (placeholder)
      ocrResult.text || null, // content_text (OCR result, can be null for metadata-only)
      ocrResult.summary || null, // summary (AI-generated, can be null)
      'active', // status
      [], // tags (empty array for now)
      { // metadata
        originalSize: file.size,
        contentType: file.type,
        processingTimestamp: ocrResult.processingTimestamp,
        detectedLanguage: ocrResult.text ? 
          (ocrResult.text.includes('മലയാളം') || 
           ocrResult.text.includes('കൊച്ചി') || 
           ocrResult.text.includes('മെട്രോ') ? 'Malayalam' : 'English') : 'Unknown'
      }
    ]);
    
    const document = documentResult.rows[0];
    
    // Return document information with database ID
    return NextResponse.json({
      document: {
        id: document.id,
        title: document.title,
        filename: document.filename,
        filePath: document.file_path,
        fileType: document.file_type,
        fileSize: document.file_size,
        uploadedAt: document.uploaded_at,
        status: document.status,
        content_text: document.content_text,
        summary: document.summary
      },
      message: 'Document uploaded and processed successfully',
      timestamp: new Date().toISOString()
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