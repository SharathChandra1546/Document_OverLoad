/**
 * Flask OCR API client
 * This module provides functions to interact with the Flask OCR backend
 */

interface FlaskOCRResponse {
  filename: string;
  text: string;
  summary: string;
  status: string;
}

/**
 * Process a file using the Flask OCR backend
 * @param file The file to process
 * @returns Promise with OCR result
 */
export async function processFileWithFlaskOCR(file: File): Promise<FlaskOCRResponse> {
  try {
    // Get backend URL from environment variable or use default
    const backendUrl = process.env.FLASK_BACKEND_URL || 'http://localhost:5000';
    
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    
    // Send request to Flask backend
    const response = await fetch(`${backendUrl}/upload`, {
      method: 'POST',
      body: formData,
    });
    
    // Check if response is ok
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Parse JSON response
    const result: FlaskOCRResponse = await response.json();
    return result;
  } catch (error) {
    console.error('Error processing file with Flask OCR:', error);
    throw error;
  }
}