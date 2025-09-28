import { NextRequest, NextResponse } from 'next/server';
import { geminiService } from '@/lib/services/gemini';

// Supported file types for analysis
const SUPPORTED_TYPES = [
  'text/plain',
  'text/markdown',
  'application/json',
  'text/csv',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/html'
];

const SUPPORTED_EXTENSIONS = ['.txt', '.md', '.json', '.csv', '.pdf', '.doc', '.docx', '.html'];

function isFileSupported(file: File): boolean {
  return SUPPORTED_TYPES.includes(file.type) || 
         SUPPORTED_EXTENSIONS.some(ext => file.name.toLowerCase().endsWith(ext));
}

async function extractTextFromFile(file: File): Promise<string> {
  try {
    // For text-based files, read directly
    if (file.type.startsWith('text/') || 
        file.type === 'application/json' || 
        file.type === 'application/csv' ||
        file.name.endsWith('.txt') || 
        file.name.endsWith('.md') || 
        file.name.endsWith('.json') || 
        file.name.endsWith('.csv') ||
        file.name.endsWith('.html')) {
      return await file.text();
    }
    
    // For PDF and Word documents, we'd need additional libraries
    // For now, return a placeholder message
    if (file.type === 'application/pdf' || 
        file.type === 'application/msword' || 
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.name.endsWith('.pdf') || 
        file.name.endsWith('.doc') || 
        file.name.endsWith('.docx')) {
      return `[PDF/Word Document: ${file.name} - Content extraction not implemented yet. Please convert to text format for analysis.]`;
    }
    
    // Fallback for other file types
    return `[File: ${file.name} - Content extraction not supported for this file type. Please convert to text format for analysis.]`;
  } catch (error) {
    console.error('Error extracting text from file:', error);
    throw new Error(`Failed to extract text from file: ${file.name}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    // Check if file type is supported
    if (!isFileSupported(file)) {
      return NextResponse.json(
        { 
          error: 'File type not supported',
          supportedTypes: SUPPORTED_TYPES,
          supportedExtensions: SUPPORTED_EXTENSIONS
        },
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

    // Extract text content from file
    const fileContent = await extractTextFromFile(file);
    
    // Limit content to avoid token limits (keep more content for better analysis)
    const limitedContent = fileContent.substring(0, 8000);
    
    // Use the enhanced Gemini service for analysis
    const analysis = await geminiService.analyzeDocument(limitedContent, file.name);

    return NextResponse.json({ 
      analysis,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      extractedLength: fileContent.length,
      analysisTimestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Document analysis error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to analyze document',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}