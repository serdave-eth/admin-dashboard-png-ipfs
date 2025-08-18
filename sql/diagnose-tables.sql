-- Diagnostic queries to check your database structure
-- Run this first in Supabase SQL Editor to understand your table structure

-- Check what tables exist in your database
SELECT table_name, table_schema
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check columns in content table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'content' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check columns in wallet_links table (if it exists)
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'wallet_links' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if wallet_links table exists at all
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'wallet_links'
) as wallet_links_exists;

-- Check current RLS status
SELECT schemaname, tablename, rowsecurity, hasrls
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;