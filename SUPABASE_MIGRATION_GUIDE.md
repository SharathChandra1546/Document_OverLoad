# 🚀 PostgreSQL to Supabase Migration Guide

This guide will help you migrate your local PostgreSQL database to Supabase, making your database accessible from anywhere.

## 📋 Prerequisites

- Local PostgreSQL database running
- Supabase account (free tier available)
- Node.js and npm installed

## 🔧 Step 1: Create Supabase Project

1. **Go to [supabase.com](https://supabase.com)** and sign up/sign in
2. **Click "New Project"**
3. **Fill in the details:**
   - Organization: Create new or select existing
   - Project Name: `documind-ai` (or your preferred name)
   - Database Password: **Create a strong password** (save this!)
   - Region: Choose closest to your location
   - Pricing Plan: Free tier is fine for development

## 🔑 Step 2: Get Supabase Credentials

After creating your project, you'll need these credentials:

### Database Connection Details
1. Go to **Settings > Database** in your Supabase dashboard
2. Find the **Connection string** section
3. Copy these values:
   - **Host**: `db.your-project-id.supabase.co`
   - **Port**: `5432`
   - **Database**: `postgres`
   - **User**: `postgres`
   - **Password**: The password you created

### API Keys
1. Go to **Settings > API** in your Supabase dashboard
2. Copy these values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Anon Key**: `eyJ...` (long string)
   - **Service Role Key**: `eyJ...` (long string)

## 📝 Step 3: Configure Environment Variables

1. **Copy the example file:**
   ```bash
   cp supabase-env.example .env.local
   ```

2. **Update `.env.local` with your Supabase credentials:**
   ```env
   # Supabase Database Connection
   SUPABASE_HOST=db.your-project-id.supabase.co
   SUPABASE_PORT=5432
   SUPABASE_DB=postgres
   SUPABASE_USER=postgres
   SUPABASE_PASSWORD=your-database-password

   # Supabase API Configuration
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

   # Keep your existing variables
   JWT_SECRET=your-jwt-secret
   LLAMAPARSE_API_KEY=your-llamaparse-key
   GROQ_API_KEY=your-groq-key
   ```

## 🚀 Step 4: Run Migration Script

1. **Install dependencies (if not already installed):**
   ```bash
   npm install
   ```

2. **Run the migration script:**
   ```bash
   node scripts/migrate-to-supabase.js
   ```

   This script will:
   - ✅ Export data from your local PostgreSQL database
   - ✅ Create the schema in Supabase
   - ✅ Import all your data to Supabase
   - ✅ Verify the migration was successful

## 🧪 Step 5: Test the Migration

1. **Start your application:**
   ```bash
   npm run dev
   ```

2. **Test the following:**
   - ✅ Login with existing users
   - ✅ Upload documents
   - ✅ Search functionality
   - ✅ Admin panel access

## 🔄 Step 6: Update Deployment (Optional)

If you're deploying to production, update your deployment environment variables:

### Vercel
```bash
vercel env add SUPABASE_HOST
vercel env add SUPABASE_PORT
vercel env add SUPABASE_DB
vercel env add SUPABASE_USER
vercel env add SUPABASE_PASSWORD
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

### Other Platforms
Add the same environment variables to your deployment platform.

## 🎯 Benefits of Supabase

- ✅ **Global Access**: Access your database from anywhere
- ✅ **Automatic Backups**: Built-in backup and recovery
- ✅ **Scalability**: Easy to scale as your app grows
- ✅ **Security**: Enterprise-grade security features
- ✅ **Real-time**: Built-in real-time subscriptions
- ✅ **Dashboard**: Web-based database management
- ✅ **API**: REST and GraphQL APIs out of the box

## 🔧 Troubleshooting

### Connection Issues
- ✅ Check your Supabase credentials
- ✅ Ensure your IP is not blocked (check Supabase dashboard)
- ✅ Verify SSL settings are correct

### Migration Issues
- ✅ Check that your local database is running
- ✅ Verify all environment variables are set
- ✅ Check the migration logs for specific errors

### Performance Issues
- ✅ Supabase free tier has connection limits
- ✅ Consider upgrading to Pro plan for production
- ✅ Monitor usage in Supabase dashboard

## 📞 Support

If you encounter issues:

1. **Check the migration logs** for specific error messages
2. **Verify your Supabase credentials** are correct
3. **Ensure your local database** is accessible
4. **Check Supabase dashboard** for any service issues

## 🎉 Success!

Once migration is complete, your application will be using Supabase as the database backend, making it accessible from anywhere and providing better scalability and reliability.

---

**Next Steps:**
- Test all application features
- Update your deployment configuration
- Consider setting up monitoring and alerts
- Explore Supabase's additional features (real-time, auth, storage)
