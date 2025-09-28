# Document OverLoad Application

## Environment Variables Setup

To use the full OCR functionality with real API services, you need to set up the following environment variables:

### 1. LlamaParse API Key
- Go to [LlamaIndex Cloud](https://cloud.llamaindex.ai/) to get your API key
- Used for document parsing and text extraction

### 2. Groq API Key
- Go to [Groq Console](https://console.groq.com/) to get your API key
- Used for text summarization

### 3. Flask Backend URL (Optional)
- Used to configure the connection to the Flask OCR backend
- Defaults to `http://localhost:5000` if not set

## Setting Up Environment Variables

### For Development (Local)

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Edit the `.env.local` file and add your actual API keys:
   ```bash
   LLAMAPARSE_API_KEY=your_actual_llamaparse_key_here
   GROQ_API_KEY=your_actual_groq_key_here
   FLASK_BACKEND_URL=http://localhost:5000
   ```

### For Production

Set the environment variables directly in your production environment:
```bash
export LLAMAPARSE_API_KEY=your_actual_llamaparse_key_here
export GROQ_API_KEY=your_actual_groq_key_here
export FLASK_BACKEND_URL=https://your-flask-backend-url.com
```

## Starting the Application

### Frontend (Next.js)
```bash
npm run dev
```

The frontend will run on `http://localhost:3000` or `http://localhost:3001` if port 3000 is occupied.

### Backend (Flask)
```bash
cd flask-backend
python app.py
```

The backend will run on `http://localhost:5000`.

## Security Notes

- Never commit your actual API keys to version control
- The `.env` and `.env.local` files are included in `.gitignore` to prevent accidental commits
- Always use environment variables for sensitive information
- The application includes fallback mechanisms that use mock data when API keys are not available

## Testing the Application

1. Start both the frontend and backend servers
2. Navigate to the upload page in your browser
3. Upload a document file (PDF, TXT, DOCX, PNG, JPG)
4. The file will be processed and the extracted text will appear in the OCR preview section