'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';

const TestApiPage: React.FC = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testGeminiDirect = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-gemini');
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testChatApi = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Tell me about Kochi Metro Rail operating hours',
        }),
      });
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const listModels = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/list-models');
      const data = await response.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">API Test Page</h1>
      
      <div className="space-y-4 mb-6">
        <Button onClick={listModels} disabled={loading}>
          List Available Models
        </Button>
        <Button onClick={testGeminiDirect} disabled={loading}>
          Test Gemini Direct
        </Button>
        <Button onClick={testChatApi} disabled={loading}>
          Test Chat API
        </Button>
      </div>

      {loading && <p>Loading...</p>}
      
      {result && (
        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Result:</h3>
          <pre className="text-sm overflow-auto">{result}</pre>
        </div>
      )}
    </div>
  );
};

export default TestApiPage;