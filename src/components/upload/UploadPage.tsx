'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useRecentDocuments } from '@/contexts/RecentDocumentsContext';
import { processFileWithFlaskOCR } from '@/lib/api/flaskOcr';

interface UploadedFile {
  file: File;
  preview: string;
  ocrText: string;
  detectedLanguage: 'English' | 'Malayalam';
  tags: string[];
  expiryDate: string;
}

const UploadPage: React.FC = () => {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const { addDocument } = useRecentDocuments();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);

    try {
      // Use Flask OCR processing
      const result = await processFileWithFlaskOCR(file);
      
      if (result.text) {
        // Detect language based on content
        const detectedLanguage = result.text.includes('മലയാളം') || 
                               result.text.includes('കൊച്ചി') || 
                               result.text.includes('മെട്രോ') ? 'Malayalam' : 'English';

        setUploadedFile({
          file,
          preview: URL.createObjectURL(file),
          ocrText: result.text,
          detectedLanguage,
          tags: [],
          expiryDate: ''
        });
      } else {
        console.error('OCR processing error:', result);
        throw new Error('Failed to process file with OCR');
      }
    } catch (error) {
      console.error('Error processing file:', error);
      
      // Fallback to mock processing if OCR fails
      const fallbackText = `OCR Processing Error for ${file.name}:

The OCR service encountered an error while processing this file. Please try again or contact support if the issue persists.

Error: ${error instanceof Error ? error.message : 'Unknown error'}

File Details:
- Type: ${file.type}
- Size: ${(file.size / 1024 / 1024).toFixed(2)} MB
- Name: ${file.name}`;

      setUploadedFile({
        file,
        preview: URL.createObjectURL(file),
        ocrText: fallbackText,
        detectedLanguage: 'English',
        tags: [],
        expiryDate: ''
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = async () => {
    if (uploadedFile) {
      try {
        // Upload to documents API for processing
        const formData = new FormData();
        formData.append('file', uploadedFile.file);
        
        const response = await fetch('/api/documents', {
          method: 'POST',
          body: formData,
        });
        
        if (response.ok) {
          const result = await response.json();
          
          // Add to Recent Documents context
          const generatedId = result.id || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
          const sizeMb = (uploadedFile.file.size / 1024 / 1024);
          const entry = {
            id: generatedId,
            title: uploadedFile.file.name,
            uploadedAt: result.uploadedAt || new Date().toISOString(),
            fileType: uploadedFile.file.type.split('/')[1]?.toUpperCase() || 'FILE',
            size: `${sizeMb.toFixed(2)} MB`,
            status: 'Processed' as const,
            previewUrl: uploadedFile.preview,
            textContent: result.ocrText || uploadedFile.ocrText,
            fileName: uploadedFile.file.name
          };
          addDocument(entry);
          alert('Document processed with OCR and saved to Recent Documents!');
        } else {
          // Fallback to local processing
          const generatedId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
          const sizeMb = (uploadedFile.file.size / 1024 / 1024);
          const entry = {
            id: generatedId,
            title: uploadedFile.file.name,
            uploadedAt: new Date().toISOString(),
            fileType: uploadedFile.file.type.split('/')[1]?.toUpperCase() || 'FILE',
            size: `${sizeMb.toFixed(2)} MB`,
            status: 'Processed' as const,
            previewUrl: uploadedFile.preview,
            textContent: uploadedFile.ocrText,
            fileName: uploadedFile.file.name
          };
          addDocument(entry);
          alert('Document saved locally to Recent Documents!');
        }
        
        // Reset form
        setUploadedFile(null);
        setTags([]);
        setExpiryDate('');
      } catch (error) {
        console.error('Error saving document:', error);
        alert('Error saving document. Please try again.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Upload Document
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Upload and process documents with AI-powered OCR and language detection
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              File Upload
            </h3>
          </CardHeader>
          <CardContent>
            {!uploadedFile ? (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="mt-4">
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
                        Drop files here or click to upload
                      </span>
                      <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                        PDF, DOCX, PNG, JPG up to 10MB
                      </span>
                    </label>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept=".pdf,.docx,.png,.jpg,.jpeg"
                      onChange={handleFileUpload}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
                      {uploadedFile.file.type.split('/')[1].toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {uploadedFile.file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Badge variant="success">Uploaded</Badge>
                </div>
              </div>
            )}

            {isProcessing && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-blue-700 dark:text-blue-300">
                    Processing document with AI OCR...
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* OCR Preview Section */}
        {uploadedFile && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  OCR Preview
                </h3>
                <div className="flex items-center space-x-2">
                  <Badge variant="info">{uploadedFile.detectedLanguage}</Badge>
                  <Badge variant="success">Processed</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {uploadedFile.ocrText}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Metadata Section */}
      {uploadedFile && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Document Metadata
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="info" className="flex items-center space-x-1">
                      <span>{tag}</span>
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-600"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button onClick={addTag} variant="outline">
                    Add
                  </Button>
                </div>
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Save Button */}
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setUploadedFile(null);
                    setTags([]);
                    setExpiryDate('');
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave} variant="default">
                  Save Document
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UploadPage;