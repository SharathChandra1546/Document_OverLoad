import { NextRequest, NextResponse } from 'next/server';
import { ocrService } from '@/lib/services/ocr';

export async function GET() {
  try {
    // Create a test file blob with more content
    const testContent = `# Kochi Metro Rail Operations Manual

## Safety Procedures
- Emergency evacuation procedures
- Fire safety protocols
- Medical emergency response
- Security measures

## Operational Guidelines
- Train scheduling and frequency
- Station operations
- Maintenance procedures
- Customer service protocols

## Compliance Requirements
- Regulatory compliance
- Audit procedures
- Documentation requirements
- Quality assurance

This document contains comprehensive information about Kochi Metro Rail operations, safety procedures, and compliance requirements.`;
    
    const testFile = new File([testContent], 'metro-operations-manual.txt', { type: 'text/plain' });
    
    console.log('Testing real OCR APIs with detailed content...');
    
    // Test the OCR service with real APIs
    const result = await ocrService.processFile(testFile);
    
    return NextResponse.json({
      success: true,
      message: 'Real OCR API test completed',
      apis: {
        llamaparse: 'Real API called',
        groq: 'Real API called'
      },
      result: {
        textLength: result.text.length,
        summaryLength: result.summary.length,
        textPreview: result.text.substring(0, 300) + '...',
        summaryPreview: result.summary.substring(0, 300) + '...',
        fullText: result.text,
        fullSummary: result.summary
      }
    });
    
  } catch (error) {
    console.error('Real OCR API test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
