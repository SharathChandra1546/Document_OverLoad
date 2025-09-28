# Flask OCR Backend Setup

## Environment Variables Setup

To use the OCR functionality with real API services, you need to set up the following environment variables:

### 1. LlamaParse API Key
- Go to [LlamaIndex Cloud](https://cloud.llamaindex.ai/) to get your API key
- Used for document parsing and text extraction

### 2. Groq API Key
- Go to [Groq Console](https://console.groq.com/) to get your API key
- Used for text summarization

## Setting Up Environment Variables

### For Development (Local)

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and add your actual API keys:
   ```bash
   LLAMAPARSE_API_KEY=your_actual_llamaparse_key_here
   GROQ_API_KEY=your_actual_groq_key_here
   ```

### For Production

Set the environment variables directly in your production environment:
```bash
export LLAMAPARSE_API_KEY=your_actual_llamaparse_key_here
export GROQ_API_KEY=your_actual_groq_key_here
```

## Starting the Server

After setting up your environment variables, start the Flask server:
```bash
python app.py
```

The server will run on `http://localhost:5000` by default.

## Testing the API

You can test the OCR functionality by sending a POST request to `http://localhost:5000/upload` with a file attachment.

## Security Notes

- Never commit your actual API keys to version control
- The `.env` file is included in `.gitignore` to prevent accidental commits
- Always use environment variables for sensitive information