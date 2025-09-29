# 🚀 Setting up Groq API for AI Summarization

## Get Your Free Groq API Key

### Step 1: Create Account
1. Go to [console.groq.com](https://console.groq.com)
2. Sign up for a free account (GitHub/Google login available)
3. Verify your email if required

### Step 2: Get API Key
1. After login, go to **API Keys** section
2. Click **"Create API Key"**
3. Give it a name like "DocuMind AI Summary"
4. Copy the key that starts with `gsk_...`

### Step 3: Update Environment File
1. Open `.env.local` file in your project
2. Replace `GROQ_API_KEY=gsk_...` with your actual key:
   ```
   GROQ_API_KEY=gsk_your_actual_key_here_make_sure_no_spaces
   ```

### Step 4: Restart Development Server
```bash
npm run dev
```

## Groq Free Tier Limits

✅ **What's Free:**
- Up to 6000 requests per day
- Multiple AI models available
- Fast inference speeds
- Perfect for development/testing

## Troubleshooting

### ❌ Key Not Working
- Check key starts with `gsk_`
- No extra spaces or quotes in `.env.local`
- Restart server after updating key

### ❌ Rate Limits
- Free tier: 6000 requests/day
- Upgrade to Pro if needed

### ❌ Model Issues
- We use `openai/gpt-oss-20b` model
- Updated automatically in the code
- Fast and efficient for summaries

## Testing Your Setup

After configuring:
1. Upload any document
2. Click **🧪 Test API** button
3. Should see "SUCCESS" message
4. Click **🤖 Generate AI Summary**
5. Should generate summary successfully

---
**Need help?** Check browser console (F12) for any error messages.
