'use client';

import React, { useState, useRef, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const ChatWidget: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AI assistant. How can I help you with your documents today?",
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Smooth scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((msgs) => [...msgs, userMsg]);
    setInputText('');
    setIsLoading(true);

    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: "I’m here to assist! Please tell me more about your document requests.",
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages((msgs) => [...msgs, aiMsg]);
      setIsLoading(false);
    }, 1400);
  };

  return (
    <Card className="max-w-xl mx-auto h-[650px] flex flex-col rounded-2xl shadow-2xl bg-gradient-to-tr from-indigo-900 to-indigo-700 overflow-hidden">
      <CardHeader className="px-6 py-4 font-bold text-white text-lg bg-gradient-to-r from-purple-700 to-indigo-900 select-none">
        AI Assistant
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto px-6 py-4 bg-indigo-950 scrollbar-thin scrollbar-thumb-indigo-700 scrollbar-track-indigo-900">
        {messages.map(({ id, text, sender, timestamp }) => (
          <div
            key={id}
            className={`max-w-[75%] mb-4 px-5 py-3 rounded-2xl shadow-md relative text-sm whitespace-pre-wrap break-words
              ${sender === 'user'
                ? 'self-end bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-br-md animate-fade-in-right'
                : 'self-start bg-indigo-200 dark:bg-indigo-300 dark:text-indigo-900 rounded-bl-md text-indigo-900 animate-fade-in-left'
              }`}
          >
            <p>{text}</p>
            <span className="absolute bottom-1 right-4 text-xs text-indigo-100 dark:text-indigo-600 select-none">
              {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        {isLoading && (
          <div className="self-start max-w-[75%] p-3 mb-4 rounded-2xl bg-indigo-300 shadow-inner text-indigo-900 animate-pulse">
            AI is typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>
      <div className="flex items-center gap-3 px-6 py-4 bg-indigo-900 border-t border-indigo-800 rounded-b-2xl">
        <Input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
          placeholder="Ask me anything about your documents..."
          disabled={isLoading}
          className="flex-1 bg-indigo-800 text-white placeholder-indigo-400 dark:placeholder-indigo-500 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm"
        />
        <Button
          onClick={sendMessage}
          disabled={isLoading || inputText.trim() === ''}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white font-semibold rounded-xl transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '...' : 'Send'}
        </Button>
      </div>
    </Card>
  );
};

export default ChatWidget;
