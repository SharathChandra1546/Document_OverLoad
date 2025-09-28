import os
import logging
from typing import Dict, Any
import PyPDF2
from PIL import Image
import io
import requests
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# ---------------- Logging ----------------
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ---------------- Configuration ----------------
# Get API keys from environment variables
LLAMAPARSE_API_KEY = os.environ.get('LLAMAPARSE_API_KEY', '')
GROQ_API_KEY = os.environ.get('GROQ_API_KEY', '')
GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

# Check if API keys are available
if not LLAMAPARSE_API_KEY:
    logger.warning('LLAMAPARSE_API_KEY not set in environment variables')
if not GROQ_API_KEY:
    logger.warning('GROQ_API_KEY not set in environment variables')

# ---------------- Functions ----------------
def process_file(file_path: str) -> Dict[str, Any]:
    """
    Main function to process a file using OCR and return extracted text with summary.
    
    Args:
        file_path (str): Path to the file to process
        
    Returns:
        dict: Dictionary containing the extracted text and summary
    """
    try:
        # Parse document to extract text
        raw_text = parse_document(file_path)
        
        # Generate summary using Groq API
        summary = summarize_text(raw_text)
        
        return {
            "text": raw_text,
            "summary": summary
        }
    except Exception as e:
        logger.error(f"Error processing file {file_path}: {str(e)}")
        return {
            "error": f"Failed to process file: {str(e)}",
            "text": "",
            "summary": ""
        }

def parse_document(file_path: str) -> str:
    """
    Extracts text from a file based on its type.
    
    Args:
        file_path (str): Path to the file to parse
        
    Returns:
        str: Extracted text content
    """
    if not os.path.exists(file_path):
        raise ValueError(f"File not found: {file_path}")

    logger.info(f"Parsing file: {file_path}")
    
    try:
        # Get file extension
        _, extension = os.path.splitext(file_path)
        extension = extension.lower()
        
        # Handle different file types
        if extension == '.pdf':
            return parse_pdf(file_path)
        elif extension in ['.jpg', '.jpeg', '.png', '.tiff', '.bmp']:
            return parse_image(file_path)
        else:
            # For text files and other formats
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            logger.info(f"Successfully read text file: {file_path}")
            return content
    except Exception as e:
        logger.error(f"Error parsing file {file_path}: {str(e)}")
        # Return a mock response for demonstration
        return f"Mock OCR text extracted from {file_path}\nThis is simulated OCR content.\nIn a real implementation, this would contain the actual text extracted from the document."

def parse_pdf(file_path: str) -> str:
    """
    Extract text from PDF file.
    
    Args:
        file_path (str): Path to the PDF file
        
    Returns:
        str: Extracted text content
    """
    try:
        logger.info(f"Parsing PDF file: {file_path}")
        text = ""
        
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
        
        logger.info(f"Successfully extracted text from PDF: {file_path}")
        return text
    except Exception as e:
        logger.error(f"Error parsing PDF {file_path}: {str(e)}")
        return f"Error parsing PDF file: {str(e)}\nThis is a placeholder text for the PDF file."

def parse_image(file_path: str) -> str:
    """
    Placeholder for image OCR processing.
    
    Args:
        file_path (str): Path to the image file
        
    Returns:
        str: Extracted text content or placeholder
    """
    try:
        logger.info(f"Processing image file: {file_path}")
        # In a real implementation, you would use pytesseract or similar OCR library here
        # For now, return a placeholder
        return f"Image OCR processing would extract text from {file_path}\nThis is a placeholder for OCR extracted text."
    except Exception as e:
        logger.error(f"Error processing image {file_path}: {str(e)}")
        return f"Error processing image file: {str(e)}\nThis is a placeholder text for the image file."

def summarize_text(text: str) -> str:
    """
    Summarizes text using Groq API or mock summarization.
    
    Args:
        text (str): Text to summarize
        
    Returns:
        str: Generated summary
    """
    try:
        # Check if API key is available
        if not GROQ_API_KEY:
            logger.warning('Groq API key not available, using mock summarization')
            return mock_summarize_text(text)
        
        logger.info(f"Summarizing text of length: {len(text)}")
        
        # Use Groq API for summarization
        headers = {
            'Authorization': f'Bearer {GROQ_API_KEY}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'model': 'openai/gpt-oss-20b',
            'messages': [{
                'role': 'user', 
                'content': f"Summarize this text related to Kochi Metro Rail operations:\n\n{text}"
            }],
            'temperature': 0.7,
            'max_tokens': 1000
        }

        response = requests.post(GROQ_API_URL, headers=headers, json=payload)

        if response.status_code == 200:
            data = response.json()
            summary = data['choices'][0]['message']['content'] or 'Summary generation failed'
            logger.info(f"Groq generated summary length: {len(summary)}")
            return summary
        else:
            logger.error(f"Groq API error: {response.status_code} - {response.text}")
            return mock_summarize_text(text)
            
    except Exception as e:
        logger.error(f"Error summarizing text: {str(e)}")
        # Return a mock response for demonstration
        return mock_summarize_text(text)

def mock_summarize_text(text: str) -> str:
    """
    Mock summarization function for when API is not available.
    
    Args:
        text (str): Text to summarize
        
    Returns:
        str: Generated summary
    """
    try:
        logger.info(f"Mock summarizing text of length: {len(text)}")
        
        # Simple mock summarization
        lines = text.split('\n')
        if len(lines) > 5:
            summary = f"Summary of document with {len(lines)} lines.\n"
            summary += "Key points:\n"
            for i, line in enumerate(lines[:3]):
                if line.strip():
                    summary += f"{i+1}. {line[:50]}...\n"
            summary += f"\nDocument processed successfully."
        else:
            summary = f"Summary: {text[:100]}..." if len(text) > 100 else text
            
        return summary
    except Exception as e:
        logger.error(f"Error in mock summarization: {str(e)}")
        # Return a simple fallback
        return "Mock summary of the document content.\nThis is simulated summarization.\nIn a real implementation, this would contain an AI-generated summary of the document."