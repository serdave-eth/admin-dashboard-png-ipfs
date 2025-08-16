# Supabase Setup Guide

## Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Name it "admin-dashboard"
5. Set a database password (save this!)
6. Choose a region close to your users
7. Click "Create new project"

## Step 2: Get Connection Details
Once your project is created:
1. Go to **Settings** → **Database**
2. Find the **Connection string** section
3. Copy the **URI** connection string

## Step 3: Update Your .env File
Replace your current DATABASE_URL with the Supabase connection string:

```bash
# Current (local PostgreSQL)
DATABASE_URL="postgresql://keypo:keypo_password@localhost:5432/keypo_wallet?schema=public"

# New (Supabase)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

## Step 4: Get Supabase API Keys (Optional - for future features)
1. Go to **Settings** → **API**
2. Copy the following values:
   - Project URL
   - anon/public key
   - service_role key (keep this secret!)

## Step 5: Test Connection
After updating your .env file:
```bash
npx prisma db push
npx prisma generate
```

## Step 6: Deploy to Vercel
1. Push your code to GitHub
2. Connect to Vercel
3. Add the DATABASE_URL as an environment variable in Vercel
4. Deploy!

## Example Supabase Connection String Format:
```
postgresql://postgres:mypassword123@db.abcdefghijklmnop.supabase.co:5432/postgres
```

## Notes:
- The password is the one you set when creating the project
- The project ref is in your Supabase dashboard URL
- Keep your .env file out of version control
- Add DATABASE_URL to Vercel environment variables
