-- Fix RLS policies to allow public read access to content
-- This allows creator pages to work while maintaining write security
-- Run this in your Supabase SQL Editor

-- =====================================================
-- UPDATE CONTENT TABLE POLICIES FOR PUBLIC READ
-- =====================================================

-- Drop the restrictive read policy
DROP POLICY IF EXISTS "Users can view own content" ON content;

-- Create new policy that allows public read access to all content
CREATE POLICY "Public read access to all content" ON content
  FOR SELECT 
  USING (true); -- Anyone can read any content

-- Keep the existing write policies for security:
-- "Users can insert own content" - already exists
-- "Users can update own content" - already exists  
-- "Users can delete own content" - already exists

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check that RLS is still enabled on content table
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'content';

-- View updated content table policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'content'
ORDER BY cmd, policyname;