-- ============================================
-- Debug Daily Journals
-- ============================================
-- Purpose: Check and debug daily journal data
-- Run this if save is not working
-- ============================================

-- 1. Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'daily_journals'
) as table_exists;

-- 2. Check table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'daily_journals'
ORDER BY ordinal_position;

-- 3. Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'daily_journals';

-- 4. Check existing data
SELECT 
  id,
  user_id,
  date,
  jsonb_array_length(todo_list) as todo_count,
  jsonb_array_length(completed_list) as completed_count,
  mood_morning,
  mood_evening,
  length(comment) as comment_length,
  CASE WHEN photo_url IS NOT NULL THEN '✓ Has photo' ELSE '✗ No photo' END as photo_status,
  created_at,
  updated_at
FROM daily_journals
ORDER BY date DESC
LIMIT 10;

-- 5. Check for duplicate entries (should be 0)
SELECT 
  user_id, 
  date, 
  COUNT(*) as count
FROM daily_journals
GROUP BY user_id, date
HAVING COUNT(*) > 1;

-- 6. Check constraints
SELECT
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'daily_journals'::regclass;

-- 7. Test insert (Replace with your user_id)
-- UNCOMMENT to test:
/*
INSERT INTO daily_journals (
  user_id,
  date,
  todo_list,
  completed_list,
  mood_morning,
  mood_evening,
  comment,
  photo_url
) VALUES (
  'YOUR_USER_ID_HERE',  -- Replace this!
  CURRENT_DATE,
  '["Test todo 1", "Test todo 2"]'::jsonb,
  '["Test completed 1"]'::jsonb,
  'happy',
  'neutral',
  'This is a test comment',
  NULL
)
ON CONFLICT (user_id, date) 
DO UPDATE SET
  todo_list = EXCLUDED.todo_list,
  comment = EXCLUDED.comment,
  updated_at = NOW()
RETURNING *;
*/

-- 8. Check recent entries for specific user
-- UNCOMMENT and replace user_id:
/*
SELECT 
  date,
  todo_list,
  completed_list,
  mood_morning,
  mood_evening,
  comment,
  photo_url,
  created_at
FROM daily_journals
WHERE user_id = 'YOUR_USER_ID_HERE'
ORDER BY date DESC
LIMIT 7;
*/

-- 9. Check if RLS is enabled
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' 
  AND tablename = 'daily_journals';

-- 10. Check profiles table (for user_id reference)
SELECT 
  id as user_id,
  username,
  created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 5;

-- ============================================
-- Expected Results
-- ============================================

-- ✅ table_exists = true
-- ✅ RLS policies exist (at least 4: SELECT, INSERT, UPDATE, DELETE)
-- ✅ No duplicate entries
-- ✅ Constraint 'daily_journals_user_id_date_key' exists (UNIQUE)
-- ✅ Profiles table has your user

-- ============================================
-- Common Issues & Fixes
-- ============================================

-- Issue 1: Table doesn't exist
-- Fix: Run database/planner_tables.sql

-- Issue 2: No RLS policies
-- Fix: Run database/fix_rls_policies.sql

-- Issue 3: Constraint missing
-- Fix: 
-- ALTER TABLE daily_journals 
-- ADD CONSTRAINT daily_journals_user_id_date_key 
-- UNIQUE (user_id, date);

-- Issue 4: RLS not enabled
-- Fix:
-- ALTER TABLE daily_journals ENABLE ROW LEVEL SECURITY;

-- Issue 5: Can't insert due to policies
-- Fix: Update policies to allow all operations with true condition
-- (Since we're using custom auth, not Supabase auth.uid())

-- ============================================
-- Cleanup Commands (Use with caution!)
-- ============================================

-- Delete all entries for specific user (CAREFUL!)
-- DELETE FROM daily_journals WHERE user_id = 'YOUR_USER_ID';

-- Delete specific date entry
-- DELETE FROM daily_journals 
-- WHERE user_id = 'YOUR_USER_ID' AND date = '2026-08-16';

-- Reset auto-increment ID (if needed)
-- ALTER SEQUENCE daily_journals_id_seq RESTART WITH 1;

SELECT '✅ Debug queries completed!' as status;
