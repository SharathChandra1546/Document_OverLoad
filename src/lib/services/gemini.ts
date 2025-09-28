interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
    finishReason?: string;
  }>;
  error?: {
    message: string;
    status: string;
  };
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export class GeminiService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent';
  private conversationHistory: ChatMessage[] = [];

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || 'AIzaSyDPV2JyOzDVWZtuX5FL7U-z_dSKaGA0RaE';
  }

  private getKochiMetroKnowledge(): string {
    return `
    KOCHI METRO RAIL LIMITED (KMRL) KNOWLEDGE BASE:
    
    **Basic Information:**
    - Operator: Kochi Metro Rail Limited (KMRL)
    - First Phase: 25.6 km with 22 stations
    - Current Phase: Aluva to Petta (Phase 1)
    - Future Phases: Petta to Tripunithura, Kakkanad extension
    - Inauguration: June 17, 2017
    - Daily ridership: ~50,000 passengers
    
    **Stations (Phase 1):**
    North to South: Aluva, Pulinchodu, Companypady, Ambattukavu, Muttom, Kalamassery, Cochin University, Pathadipalam, Edapally, Changampuzha Park, Palarivattom, JLN Stadium, Kaloor, Town Hall, Maharaja's College, Ernakulam South, Kadavanthra, Elamkulam, Vytilla, Thaikoodam, Petta
    
    **Operating Hours:**
    - First train: 6:00 AM
    - Last train: 10:00 PM
    - Frequency: 5-8 minutes during peak hours, 8-12 minutes off-peak
    
    **Fare Structure:**
    - Minimum: ₹10 (up to 2 km)
    - Maximum: ₹60 (full route)
    - Student concession: 50% off
    - Senior citizen: 50% off (60+ years)
    
    **Services:**
    - Kochi1 Card (smart card)
    - Mobile app: Kochi Metro
    - Free WiFi on trains
    - Wheelchair accessible
    - Women's coach (first coach)
    
    **Contact Information:**
    - Customer Care: 1800-425-1550
    - Website: www.kochimetro.org
    - Email: info@kochimetro.org
    
    **Recent Developments:**
    - Water Metro integration
    - Airport connectivity (proposed)
    - Kakkanad IT corridor extension
    - Integration with KSRTC buses
    
    **Safety & Security:**
    - CCTV surveillance
    - Security personnel at all stations
    - Emergency communication system
    - Fire safety systems
    `;
  }

  private getSystemPrompt(documentContext?: string, conversationHistory?: ChatMessage[]): string {
    const metroKnowledge = this.getKochiMetroKnowledge();
    
    let historyContext = '';
    if (conversationHistory && conversationHistory.length > 0) {
      historyContext = '\n\n**Previous Conversation Context:**\n';
      conversationHistory.slice(-6).forEach(msg => {
        historyContext += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
      });
    }

    return `You are an AI assistant specialized in Kochi Metro Rail operations and document analysis. You are knowledgeable, helpful, and professional.

${metroKnowledge}

**Your Role:**
- Provide accurate information about Kochi Metro Rail operations, schedules, routes, and services
- Analyze documents related to metro operations, compliance, and regulations
- Help users with metro-related queries and troubleshooting
- Assist with document management and analysis for metro operations
- Provide guidance on metro policies, procedures, and best practices

**Response Guidelines:**
- Be specific and accurate with metro information
- Use the provided knowledge base for Kochi Metro details
- If unsure about specific details, suggest contacting KMRL directly
- For document analysis, focus on metro-relevant insights
- Be helpful and conversational while maintaining professionalism
- Provide actionable advice when possible

${documentContext ? `\n**Document Context:**\n${documentContext}` : ''}

${historyContext}

Please provide a helpful response to the user's query.`;
  }

  async generateResponse(prompt: string, documentContext?: string, conversationHistory?: ChatMessage[]): Promise<string> {
    try {
      const systemPrompt = this.getSystemPrompt(documentContext, conversationHistory);
      
      // Add current message to history
      this.conversationHistory.push({
        role: 'user',
        content: prompt,
        timestamp: new Date()
      });

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\nUser Query: ${prompt}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Gemini API error:', response.status, errorData);
        throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
      }

      const data: GeminiResponse = await response.json();
      
      if (data.error) {
        throw new Error(`API Error: ${data.error.message}`);
      }
      
      if (data.candidates && data.candidates.length > 0) {
        const responseText = data.candidates[0].content.parts[0].text;
        
        // Add response to history
        this.conversationHistory.push({
          role: 'assistant',
          content: responseText,
          timestamp: new Date()
        });

        // Keep only last 20 messages to manage context length
        if (this.conversationHistory.length > 20) {
          this.conversationHistory = this.conversationHistory.slice(-20);
        }

        return responseText;
      } else {
        throw new Error('No response generated from AI model');
      }
    } catch (error) {
      console.error('Gemini API error:', error);
      return `I apologize, but I encountered an error while processing your request: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again or contact KMRL support at 1800-425-1550 if the issue persists.`;
    }
  }

  async analyzeDocument(fileContent: string, fileName: string): Promise<string> {
    const prompt = `Please analyze this document "${fileName}" and provide a summary of its key contents, important information, and any relevant insights for Kochi Metro Rail operations or compliance:

    ${fileContent.substring(0, 4000)}...`; // Limit content to avoid token limits

    return this.generateResponse(prompt);
  }

  // Method to start a new chat session
  startNewChat(): void {
    this.conversationHistory = [];
  }

  // Method to get conversation history
  getConversationHistory(): ChatMessage[] {
    return [...this.conversationHistory];
  }

  // Method to add a message to history manually
  addMessageToHistory(role: 'user' | 'assistant', content: string): void {
    this.conversationHistory.push({
      role,
      content,
      timestamp: new Date()
    });
  }

  // Method to clear conversation history
  clearHistory(): void {
    this.conversationHistory = [];
  }

  // Method to get the last few messages for context
  getRecentContext(limit: number = 6): ChatMessage[] {
    return this.conversationHistory.slice(-limit);
  }
}

export const geminiService = new GeminiService();