# Vercel Deployment Checklist with Supabase

## ✅ Pre-Deployment Setup

### 1. Supabase Database
- [ ] Create Supabase project
- [ ] Get database connection string
- [ ] Update .env file with Supabase DATABASE_URL
- [ ] Test database connection locally
- [ ] Run `npx prisma db push` to create tables
- [ ] Run `npx prisma generate` to update client

### 2. Environment Variables
- [ ] DATABASE_URL (Supabase connection string)
- [ ] NEXT_PUBLIC_ZORA_APP_ID
- [ ] PINATA_API_KEY
- [ ] PINATA_SECRET_API_KEY
- [ ] PINATA_JWT
- [ ] NEXT_PUBLIC_PRIVY_APP_ID
- [ ] PRIVY_APP_SECRET

### 3. Code Preparation
- [ ] All changes committed to Git
- [ ] Build passes locally (`npm run build`)
- [ ] Database schema is final
- [ ] Remove any local-only configurations

## 🚀 Vercel Deployment

### 1. Connect Repository
- [ ] Push code to GitHub
- [ ] Connect GitHub repo to Vercel
- [ ] Select the correct repository

### 2. Configure Project
- [ ] Framework Preset: Next.js
- [ ] Root Directory: ./
- [ ] Build Command: `npm run build`
- [ ] Output Directory: .next
- [ ] Install Command: `npm install`

### 3. Environment Variables
- [ ] Add all environment variables from .env file
- [ ] Ensure DATABASE_URL is set correctly
- [ ] Mark sensitive variables as "Encrypted"

### 4. Deploy
- [ ] Click "Deploy"
- [ ] Wait for build to complete
- [ ] Check for any build errors
- [ ] Verify database connection in production

## 🔍 Post-Deployment Verification

### 1. Functionality Tests
- [ ] Homepage loads correctly
- [ ] Authentication works
- [ ] File uploads function
- [ ] Zora linking works
- [ ] Content display works
- [ ] Token gating displays correctly

### 2. Database Verification
- [ ] Check Supabase dashboard for tables
- [ ] Verify data is being stored
- [ ] Test database queries in production

### 3. Performance
- [ ] Check Vercel analytics
- [ ] Monitor database performance
- [ ] Verify IPFS uploads work

## 🚨 Common Issues & Solutions

### Database Connection Errors
- **Issue**: "Connection refused" or "Authentication failed"
- **Solution**: Check DATABASE_URL format and password

### Build Failures
- **Issue**: Prisma client generation fails
- **Solution**: Ensure `npx prisma generate` runs in build

### Environment Variable Issues
- **Issue**: Variables not available in production
- **Solution**: Add them in Vercel project settings

### IPFS Upload Failures
- **Issue**: Pinata API calls fail
- **Solution**: Verify API keys are set in Vercel

## 📊 Monitoring

### Vercel Dashboard
- [ ] Function execution logs
- [ ] Performance metrics
- [ ] Error tracking

### Supabase Dashboard
- [ ] Database performance
- [ ] Query logs
- [ ] Storage usage

## 🔄 Future Updates

### Database Migrations
- [ ] Use `npx prisma migrate dev` for schema changes
- [ ] Test migrations locally first
- [ ] Deploy with `npx prisma migrate deploy`

### Environment Updates
- [ ] Update Vercel environment variables
- [ ] Redeploy if needed
- [ ] Test changes in production
