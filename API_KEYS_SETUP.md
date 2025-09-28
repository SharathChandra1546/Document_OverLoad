# API Keys Setup Guide

This guide explains how to set up the required API keys for the Document OverLoad application.

## Required API Keys

1. **LlamaParse API Key** - For document parsing and text extraction
2. **Groq API Key** - For text summarization

## Getting API Keys

### LlamaParse API Key

1. Go to [LlamaIndex Cloud](https://cloud.llamaindex.ai/)
2. Sign up for an account or log in if you already have one
3. Navigate to the API keys section
4. Create a new API key
5. Copy the API key for use in your environment variables

### Groq API Key

1. Go to [Groq Console](https://console.groq.com/)
2. Sign up for an account or log in if you already have one
3. Navigate to the API keys section
4. Create a new API key
5. Copy the API key for use in your environment variables

## Setting Up Environment Variables

### For Next.js Frontend

1. Create a `.env.local` file in the project root directory:
   ```bash
   cp .env.example .env.local
   ```

2. Edit the `.env.local` file and add your API keys:
   ```bash
   LLAMAPARSE_API_KEY=your_llamaparse_api_key_here
   GROQ_API_KEY=your_groq_api_key_here
   FLASK_BACKEND_URL=http://localhost:5000
   ```

### For Flask Backend

1. Create a `.env` file in the `flask-backend` directory:
   ```bash
   cd flask-backend
   cp .env.example .env
   ```

2. Edit the `.env` file and add your API keys:
   ```bash
   LLAMAPARSE_API_KEY=your_llamaparse_api_key_here
   GROQ_API_KEY=your_groq_api_key_here
   FLASK_ENV=development
   FLASK_DEBUG=True
   ```

## Testing Your Setup

### Test Frontend Environment Variables

```bash
npm run test:env
```

### Test Backend Environment Variables

```bash
npm run test:env:python
```

## Security Best Practices

1. **Never commit API keys to version control**
   - The `.env` and `.env.local` files are included in `.gitignore`
   - Always use environment variables for sensitive information

2. **Use different keys for development and production**
   - Create separate API keys for development and production environments
   - Rotate keys regularly

3. **Monitor API usage**
   - Keep track of your API usage to avoid unexpected charges
   - Set up alerts for unusual activity

## Troubleshooting

### API Keys Not Working

1. Verify that your API keys are correct and active
2. Check that you've set the environment variables correctly
3. Restart your development servers after changing environment variables

### Environment Variables Not Loading

1. Make sure you're using the correct file names:
   - Frontend: `.env.local`
   - Backend: `.env`
2. Verify that the files are in the correct directories
3. Check that the variable names match exactly

### Fallback to Mock Functionality

If API keys are not set, the application will automatically fall back to mock functionality:
- Mock document parsing for LlamaParse
- Mock text summarization for Groq

This allows you to test the application without API keys, though with limited functionality.