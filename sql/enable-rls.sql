-- Enable Row Level Security on all tables
-- Run this in your Supabase SQL Editor or via direct PostgreSQL connection

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on content table
ALTER TABLE content ENABLE ROW LEVEL SECURITY;

-- Enable RLS on wallet_links table  
ALTER TABLE wallet_links ENABLE ROW LEVEL SECURITY;

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
-- WALLET_LINKS TABLE POLICIES
-- =====================================================

-- Policy: Users can view their own wallet links
CREATE POLICY "Users can view own wallet links" ON wallet_links
  FOR SELECT 
  USING (
    primary_wallet_address = current_setting('app.current_user_wallet', true)
  );

-- Policy: Users can insert their own wallet links
CREATE POLICY "Users can insert own wallet links" ON wallet_links
  FOR INSERT 
  WITH CHECK (
    primary_wallet_address = current_setting('app.current_user_wallet', true)
  );

-- Policy: Users can update their own wallet links
CREATE POLICY "Users can update own wallet links" ON wallet_links
  FOR UPDATE 
  USING (
    primary_wallet_address = current_setting('app.current_user_wallet', true)
  )
  WITH CHECK (
    primary_wallet_address = current_setting('app.current_user_wallet', true)
  );

-- Policy: Users can delete their own wallet links
CREATE POLICY "Users can delete own wallet links" ON wallet_links
  FOR DELETE 
  USING (
    primary_wallet_address = current_setting('app.current_user_wallet', true)
  );

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check that RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('content', 'wallet_links');

-- View all policies created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('content', 'wallet_links');