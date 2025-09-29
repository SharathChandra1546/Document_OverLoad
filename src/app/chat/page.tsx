'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ThemeToggle from '@/components/ui/ThemeToggle';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  attachments?: File[];
}

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: 'Hello! I\'m your Kochi Metro Rail AI assistant. I can help you with metro schedules, routes, services, and analyze documents related to metro operations. How can I assist you today?',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [sessionId, setSessionId] = useState<string>(`session_${Date.now()}`);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Convert messages to conversation history format
  const getConversationHistory = () => {
    return messages
      .filter(msg => msg.id !== 'welcome')
      .map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text,
        timestamp: msg.timestamp.toISOString()
      }));
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() && attachedFiles.length === 0) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
      attachments: attachedFiles.length > 0 ? [...attachedFiles] : undefined
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    const currentFiles = [...attachedFiles];
    setInputText('');
    setAttachedFiles([]);
    setIsLoading(true);

    try {
      let documentContext = '';
      
      // Analyze attached documents first using OCR
      if (currentFiles.length > 0) {
        const analysisPromises = currentFiles.map(async (file) => {
          try {
            // First try OCR processing for better text extraction
            const ocrFormData = new FormData();
            ocrFormData.append('file', file);
            
            const ocrResponse = await fetch('/api/ocr', {
              method: 'POST',
              body: ocrFormData,
            });
            
            if (ocrResponse.ok) {
              const ocrResult = await ocrResponse.json();
              if (ocrResult.text) {
                // Use OCR extracted text for analysis
                const analysisFormData = new FormData();
                analysisFormData.append('file', new Blob([ocrResult.text], { type: 'text/plain' }), `${file.name}.txt`);
                
                const analysisResponse = await fetch('/api/analyze-document', {
                  method: 'POST',
                  body: analysisFormData,
                });
                
                const analysisResult = await analysisResponse.json();
                
                if (analysisResponse.ok && analysisResult.analysis) {
                  return `Document "${file.name}" (OCR Processed): ${analysisResult.analysis}`;
                } else {
                  // Fallback to direct OCR text if analysis fails
                  return `Document "${file.name}" (OCR Text): ${ocrResult.text.substring(0, 1000)}...`;
                }
              }
            }
            
            // Fallback to regular document analysis if OCR fails
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await fetch('/api/analyze-document', {
              method: 'POST',
              body: formData,
            });
            
            const result = await response.json();
            
            if (response.ok && result.analysis) {
              return `Document "${file.name}": ${result.analysis}`;
            } else {
              console.error('Document analysis error:', result);
              return `Document "${file.name}": ${result.error || 'Could not analyze this file.'}`;
            }
          } catch (error) {
            console.error('Document analysis error:', error);
            return `Document "${file.name}": Error analyzing file.`;
          }
        });
        
        const analyses = await Promise.all(analysisPromises);
        documentContext = analyses.join('\n\n');
      }

      // Get AI response with conversation history
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          documentContext: documentContext || undefined,
          conversationHistory: getConversationHistory(),
          sessionId: sessionId,
        }),
      });

      const result = await response.json();

      if (response.ok && result.response) {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: result.response,
          sender: 'ai',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        
        // Update session ID if provided
        if (result.sessionId) {
          setSessionId(result.sessionId);
        }
      } else {
        console.error('API Error:', result);
        throw new Error(result.error || 'Failed to get AI response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `I apologize, but I encountered an error while processing your request: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again or contact KMRL support at 1800-425-1550.`,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileAttach = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachedFiles(prev => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Scroll to bottom when messages change
  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Clear conversation
  const clearConversation = () => {
    setMessages([{
      id: 'welcome',
      text: 'Hello! I\'m your Kochi Metro Rail AI assistant. I can help you with metro schedules, routes, services, and analyze documents related to metro operations. How can I assist you today?',
      sender: 'ai',
      timestamp: new Date()
    }]);
    setSessionId(`session_${Date.now()}`);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="border-b border-border/50 bg-background/95 backdrop-blur-xl shadow-lg sticky top-0 z-10">
        <div className="flex items-center justify-between px-8 py-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="hover:bg-muted/80 transition-all duration-200 rounded-xl">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center shadow-lg">
                <svg className="w-4 h-4 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                DocuMind Chat
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearConversation}
              title="Clear conversation"
              className="hover:bg-destructive/10 hover:text-destructive transition-all duration-200 rounded-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </Button>
            <ThemeToggle size="sm" />
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-8">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-3xl flex items-center justify-center mb-6 shadow-2xl">
                <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent mb-3">
                Welcome to DocuMind AI
              </h2>
              <p className="text-muted-foreground max-w-lg mb-8 text-lg leading-relaxed">
                I'm your AI assistant specialized in Kochi Metro Rail operations and document analysis. Ask me about metro schedules, routes, compliance documents, or upload files for intelligent analysis.
              </p>
              
              {/* Quick Action Buttons */}
              <div className="grid grid-cols-2 gap-4 max-w-2xl">
                {[
                  {
                    text: 'What are the metro operating hours?',
                    title: 'Operating Hours',
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )
                  },
                  {
                    text: 'What are the metro stations and routes?',
                    title: 'Routes & Stations',
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )
                  },
                  {
                    text: 'What are the metro fare rates?',
                    title: 'Fare Information',
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    )
                  },
                  {
                    text: 'What services are available on the metro?',
                    title: 'Services',
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )
                  }
                ].map((action, index) => (
                  <Button 
                    key={index}
                    variant="outline" 
                    size="lg" 
                    onClick={() => setInputText(action.text)}
                    className="text-left justify-start p-4 h-auto hover:bg-muted/80 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 rounded-xl border-border/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-primary">
                        {action.icon}
                      </div>
                      <span className="font-medium">{action.title}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-8">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-6 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.sender === 'ai' && (
                    <div className="w-10 h-10 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] p-6 rounded-2xl shadow-lg ${
                      message.sender === 'user'
                        ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground shadow-primary/20'
                        : 'bg-background/80 backdrop-blur-sm text-foreground border border-border/50 shadow-lg'
                    }`}
                  >
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mb-4 space-y-2">
                        {message.attachments.map((file, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-background/20 rounded-lg backdrop-blur-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            <span className="text-sm font-medium">{file.name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-sm leading-relaxed font-medium">{message.text}</p>
                    <p className="text-xs opacity-70 mt-3 font-medium">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  {message.sender === 'user' && (
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                      <span className="text-sm font-bold text-primary-foreground">U</span>
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-6 justify-start">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="bg-background/80 backdrop-blur-sm text-foreground p-6 rounded-2xl border border-border/50 shadow-lg">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-border/50 bg-background/95 backdrop-blur-xl shadow-lg">
          <div className="max-w-4xl mx-auto p-8">
            {/* Attached Files */}
            {attachedFiles.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-3">
                {attachedFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-3 bg-muted/80 backdrop-blur-sm px-4 py-3 rounded-xl shadow-sm">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <span className="text-sm font-medium">{file.name}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeAttachment(index)}
                      className="h-6 w-6 p-0 hover:bg-destructive/20 hover:text-destructive rounded-lg"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex gap-4 items-end">
              <div className="flex-1 relative">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask me anything about metro operations or upload documents..."
                  className="pr-14 py-4 text-base resize-none rounded-xl border-border/50 bg-background/80 backdrop-blur-sm shadow-lg"
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                />
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileAttach}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-3 top-1/2 -translate-y-1/2 hover:bg-muted/80 rounded-lg"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </Button>
              </div>
              
              <Button
                onClick={handleSendMessage}
                disabled={(!inputText.trim() && attachedFiles.length === 0) || isLoading}
                size="lg"
                className="shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 rounded-xl px-6"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;