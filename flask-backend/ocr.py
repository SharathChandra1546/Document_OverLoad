import os
import logging
from typing import Dict, Any, List
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
LLAMAPARSE_API_URL = os.environ.get('LLAMAPARSE_API_URL', 'https://api.llamacloud.com/llamaparse/v1/parse')

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
        # Parse document to extract text (prefer LlamaParse when available)
        raw_text = parse_document(file_path)

        # Generate summary using Groq API (map-reduce over chunks for long docs)
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
            # Try LlamaParse first if API key provided
            if LLAMAPARSE_API_KEY:
                parsed = parse_with_llamaparse(file_path)
                if parsed:
                    return parsed
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

def parse_with_llamaparse(file_path: str) -> str:
    """
    Attempt to parse document with LlamaParse API.

    Returns an empty string if parsing fails to allow graceful fallback.
    """
    try:
        if not LLAMAPARSE_API_KEY:
            return ''

        logger.info(f"Attempting LlamaParse for: {file_path}")
        headers = {
            'Authorization': f"Bearer {LLAMAPARSE_API_KEY}"
        }
        files = {
            'file': (os.path.basename(file_path), open(file_path, 'rb'))
        }
        # Optional parameters – adjust as needed
        data = {
            'output_format': 'text',
        }
        resp = requests.post(LLAMAPARSE_API_URL, headers=headers, files=files, data=data, timeout=120)
        if resp.status_code == 200:
            text = resp.text if resp.text else ''
            if text.strip():
                logger.info("LlamaParse succeeded")
                return text
            else:
                logger.warning("LlamaParse returned empty text; falling back")
                return ''
        logger.error(f"LlamaParse error {resp.status_code}: {resp.text}")
        return ''
    except Exception as e:
        logger.error(f"LlamaParse exception: {str(e)}")
        return ''

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
        
        # Delegate to the new Groq summarization tailored for proportional, simple-English output
        return summarize_text_with_groq(text)
            
    except Exception as e:
        logger.error(f"Error summarizing text: {str(e)}")
        # Return a mock response for demonstration
        return mock_summarize_text(text)

def groq_summarize_single(text: str, headers: Dict[str, str], *, model: str = 'llama3-70b-8192', temperature: float = 0.5, max_tokens: int = 3500) -> str:
    """
    Summarize a single chunk via Groq with a stronger, more general prompt and higher limits.
    """
    try:
        prompt = (
            "Summarize the following document text accurately and comprehensively.\n"
            "- Keep critical details and structure.\n"
            "- Use clear paragraphs and bullet points when helpful.\n\n"
            f"Text:\n{text}"
        )
        payload = {
            'model': model,
            'messages': [
                { 'role': 'system', 'content': 'You are an expert summarizer focused on accuracy and coverage.' },
                { 'role': 'user', 'content': prompt }
            ],
            'temperature': temperature,
            'max_tokens': max_tokens
        }
        response = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=120)
        if response.status_code == 200:
            data = response.json()
            return data['choices'][0]['message']['content'] or 'Summary generation failed'
        logger.error(f"Groq single-chunk error {response.status_code}: {response.text}")
        return mock_summarize_text(text)
    except Exception as e:
        logger.error(f"Groq single-chunk exception: {str(e)}")
        return mock_summarize_text(text)

def chunk_text(text: str, max_chunk_chars: int = 6000, overlap: int = 200) -> List[str]:
    """
    Split text into overlapping chunks to preserve context across boundaries.
    """
    if not text:
        return []
    if len(text) <= max_chunk_chars:
        return [text]
    chunks: List[str] = []
    start = 0
    n = len(text)
    while start < n:
        end = min(start + max_chunk_chars, n)
        chunk = text[start:end]
        chunks.append(chunk)
        if end == n:
            break
        start = end - overlap if end - overlap > start else end
    return chunks

def summarize_text_with_groq(parsed_text: str) -> str:
    """
    Summarize parsed document text using Groq with a simple-English, proportional-length summary.

    Uses a single call for shorter inputs; falls back to map-reduce (chunk + synthesize)
    for long inputs. Always aims for easy-to-understand English.
    """
    try:
        if not GROQ_API_KEY:
            logger.warning('Groq API key not available, using mock summarization')
            return mock_summarize_text(parsed_text)

        headers = {
            'Authorization': f'Bearer {GROQ_API_KEY}',
            'Content-Type': 'application/json'
        }

        text = parsed_text or ''
        if not text.strip():
            return 'No content to summarize.'

        # If reasonably small, single pass with proportional instruction
        # Rough heuristic: <= 8000 chars -> single call
        if len(text) <= 8000:
            proportional_tokens = min(2000, max(400, len(text) // 4))
            return groq_summarize_single(
                text,
                headers,
                model='llama3-70b-8192',
                temperature=0.5,
                max_tokens=proportional_tokens,
            )

        # Otherwise chunk + merge for longer inputs
        chunks = chunk_text(text, max_chunk_chars=6000)
        partial_summaries: List[str] = []
        for idx, chunk in enumerate(chunks):
            logger.info(f"Summarizing chunk {idx+1}/{len(chunks)} (len={len(chunk)})")
            partial = groq_summarize_single(
                chunk,
                headers,
                model='llama3-70b-8192',
                temperature=0.5,
                max_tokens=2800,
            )
            partial_summaries.append(partial)

        synthesis_prompt = (
            "Provide a clear, simple English summary of the following partial summaries.\n"
            "Make it proportional to the document length, easy to scan, and concise.\n"
            "Include short paragraphs and 5-10 bullet points for key takeaways.\n\n"
            f"Partial summaries:\n{('\n\n').join(f'- {s}' for s in partial_summaries)}\n\n"
            "Now produce the final summary."
        )

        payload = {
            'model': 'llama3-70b-8192',
            'messages': [
                { 'role': 'system', 'content': 'Always write in simple, easy-to-understand English.' },
                { 'role': 'user', 'content': synthesis_prompt }
            ],
            'temperature': 0.4,
            'max_tokens': 4000
        }
        response = requests.post(GROQ_API_URL, headers=headers, json=payload, timeout=120)
        if response.status_code == 200:
            data = response.json()
            final_summary = data['choices'][0]['message']['content'] or 'Summary generation failed'
            logger.info(f"Groq final summary length: {len(final_summary)}")
            return final_summary
        logger.error(f"Groq synthesis error {response.status_code}: {response.text}")
        return '\n\n'.join(partial_summaries)
    except Exception as e:
        logger.error(f"Error in summarize_text_with_groq: {str(e)}")
        return mock_summarize_text(parsed_text)

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