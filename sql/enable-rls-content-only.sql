-- Enable RLS for content table only (safe version)
-- Run this in your Supabase SQL Editor

-- =====================================================
-- ENABLE ROW LEVEL SECURITY ON CONTENT TABLE
-- =====================================================

-- Enable RLS on content table
ALTER TABLE content ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CONTENT TABLE POLICIES
-- =====================================================

-- Policy: Users can view their own content
CREATE POLICY "Users can view own content" ON content
  FOR SELECT 
  USING (
    user_wallet_address = current_setting('app.current_user_wallet', true)
  );

-- Policy: Users can insert their own content
CREATE POLICY "Users can insert own content" ON content
  FOR INSERT 
  WITH CHECK (
    user_wallet_address = current_setting('app.current_user_wallet', true)
  );

-- Policy: Users can update their own content
CREATE POLICY "Users can update own content" ON content
  FOR UPDATE 
  USING (
    user_wallet_address = current_setting('app.current_user_wallet', true)
  )
  WITH CHECK (
    user_wallet_address = current_setting('app.current_user_wallet', true)
  );

-- Policy: Users can delete their own content
CREATE POLICY "Users can delete own content" ON content
  FOR DELETE 
  USING (
    user_wallet_address = current_setting('app.current_user_wallet', true)
  );

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check that RLS is enabled on content table
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'content';

-- View content table policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'content';