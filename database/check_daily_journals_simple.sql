-- ============================================
-- Simple Check for Daily Journals
-- ============================================
-- Quick queries to check if save is working
-- ============================================

-- 1. Check if table exists
SELECT 'daily_journals table exists!' as status;

-- 2. Count total entries
SELECT COUNT(*) as total_entries FROM daily_journals;

-- 3. Show all entries (simple view)
SELECT 
  date,
  user_id,
  mood_morning,
  mood_evening,
  CASE WHEN photo_url IS NOT NULL THEN '✓' ELSE '✗' END as has_photo,
  created_at
FROM daily_journals
ORDER BY date DESC
LIMIT 10;

-- 4. Show full data for specific user (Replace YOUR_USER_ID)
-- UNCOMMENT and replace user_id:
/*
SELECT 
  id,
  date,
  todo_list,
  completed_list,
  mood_morning,
  mood_evening,
  comment,
  photo_url,
  created_at,
  updated_at
FROM daily_journals
WHERE user_id = 'YOUR_USER_ID'
ORDER BY date DESC;
*/

-- 5. Check most recent entry
SELECT 
  date,
  user_id,
  todo_list,
  completed_list,
  created_at
FROM daily_journals
ORDER BY created_at DESC
LIMIT 1;

-- 6. Count entries per user
SELECT 
  user_id,
  COUNT(*) as entry_count,
  MIN(date) as first_entry,
  MAX(date) as last_entry
FROM daily_journals
GROUP BY user_id;

-- 7. Check if today's entry exists for any user
SELECT 
  user_id,
  date,
  todo_list,
  mood_morning,
  mood_evening
FROM daily_journals
WHERE date = CURRENT_DATE;

-- 8. Check RLS is enabled (should be true)
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'daily_journals';

-- 9. List all policies
SELECT 
  policyname,
  cmd as command,
  permissive
FROM pg_policies 
WHERE tablename = 'daily_journals';

-- 10. Get user IDs from profiles
SELECT 
  id,
  username,
  birthday
FROM profiles
ORDER BY created_at DESC
LIMIT 5;

-- ============================================
-- Quick Test Insert (OPTIONAL)
-- ============================================
-- Uncomment to test if insert works:
/*
INSERT INTO daily_journals (
  user_id,
  date,
  todo_list,
  completed_list,
  mood_morning,
  mood_evening,
  comment
) VALUES (
  'YOUR_USER_ID',  -- REPLACE THIS!
  CURRENT_DATE,
  '["Test todo 1", "Test todo 2"]'::jsonb,
  '["Completed task 1"]'::jsonb,
  'happy',
  'excited',
  'Test comment from SQL'
)
ON CONFLICT (user_id, date) 
DO UPDATE SET
  todo_list = EXCLUDED.todo_list,
  comment = EXCLUDED.comment,
  updated_at = NOW()
RETURNING 
  id,
  date,
  todo_list,
  created_at,
  updated_at;
*/

-- ============================================
-- Cleanup (if needed)
-- ============================================
-- Delete test entries:
-- DELETE FROM daily_journals WHERE comment = 'Test comment from SQL';

SELECT '✅ Queries completed successfully!' as final_status;
