import { NextRequest, NextResponse } from 'next/server';
import { geminiService } from '@/lib/services/gemini';

interface ChatRequest {
  message: string;
  documentContext?: string;
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
  }>;
  sessionId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { message, documentContext, conversationHistory, sessionId }: ChatRequest = await request.json();

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Convert conversation history to the format expected by Gemini service
    const chatHistory = conversationHistory?.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
      timestamp: new Date(msg.timestamp)
    })) || [];

    // Generate response using the enhanced Gemini service
    const aiResponse = await geminiService.generateResponse(
      message.trim(),
      documentContext,
      chatHistory
    );

    return NextResponse.json({ 
      response: aiResponse,
      sessionId: sessionId || `session_${Date.now()}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate response',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve conversation history (if needed)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // In a real implementation, you'd retrieve from a database
    // For now, return the current conversation history
    const history = geminiService.getConversationHistory();
    
    return NextResponse.json({ 
      conversationHistory: history,
      sessionId 
    });

  } catch (error) {
    console.error('Get conversation history error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve conversation history' },
      { status: 500 }
    );
  }
}