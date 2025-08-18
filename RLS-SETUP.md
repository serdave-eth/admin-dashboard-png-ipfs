# Row Level Security (RLS) Setup Guide

This guide explains how to enable and configure Row Level Security for your Supabase database.

## 🔒 What is RLS?

Row Level Security (RLS) is a PostgreSQL feature that allows you to control which rows users can access at the database level. Even if your application has bugs, users can only see their own data.

## 📋 Setup Steps

### 1. Enable RLS Policies in Supabase

Run the SQL script in your Supabase SQL Editor:

```bash
# Copy the contents of sql/enable-rls.sql and paste it into Supabase SQL Editor
```

Or if you have `psql` access:
```bash
psql $DATABASE_URL -f sql/enable-rls.sql
```

### 2. Verify RLS is Enabled

Check that RLS is active on your tables:

```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('content', 'wallet_links');
```

You should see `rowsecurity = t` (true) for both tables.

### 3. View Active Policies

Check that all policies were created:

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('content', 'wallet_links');
```

You should see 8 policies total (4 for each table).

## 🛠️ How It Works

### Authentication Context

The RLS policies use PostgreSQL's `current_setting()` function to get the current user's wallet address:

```sql
current_setting('app.current_user_wallet', true)
```

### API Integration

Each API route now calls `setCurrentUserWallet()` after authentication:

```typescript
// Set RLS context for the authenticated user
await setCurrentUserWallet(prisma, walletAddress);
```

This ensures all database queries are automatically filtered to the user's own data.

## 📊 Security Benefits

### Before RLS:
- Application logic must filter data
- Risk of bugs exposing other users' data
- Manual WHERE clause in every query

### After RLS:
- Database automatically filters data
- Zero chance of data leakage
- Policies enforced at the database level
- Works even if application has bugs

## 🧪 Testing RLS

### Test User Isolation:

1. Create content with User A's wallet address
2. Try to query with User B's wallet address
3. User B should see zero results

### Test Policy Enforcement:

1. Try to access content without setting user context
2. Should return empty results (no access)

### Manual Testing:

```sql
-- Set user context for testing
SELECT set_config('app.current_user_wallet', '0x1234...', true);

-- Query should only return rows for this wallet
SELECT * FROM content;
SELECT * FROM wallet_links;
```

## 🚨 Important Notes

### Always Set User Context
Every API route must call `setCurrentUserWallet()` after authentication, or queries will return empty results.

### Database Sessions
The `set_config()` function sets the value for the current database session only. Each API request gets a fresh session.

### Performance Impact
RLS adds a small overhead to queries, but PostgreSQL optimizes these policies efficiently.

### Backup Access
Service role keys can bypass RLS policies for admin operations and backups.

## 🔧 Troubleshooting

### Empty Query Results
- Check that `setCurrentUserWallet()` is called
- Verify the wallet address matches the data
- Ensure RLS policies are enabled

### Policy Not Working
- Check policy syntax in `pg_policies`
- Verify `current_setting()` returns correct value
- Test policies manually in SQL Editor

### Performance Issues
- Add indexes on columns used in RLS policies
- Monitor query execution plans
- Consider policy optimization for complex rules

## 📚 Additional Resources

- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Prisma with RLS Best Practices](https://www.prisma.io/docs/concepts/components/prisma-client/row-level-security)