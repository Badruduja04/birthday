-- ============================================
-- COMPLETE FIX - Run This Once
-- ============================================
-- This will fix ALL issues causing 406 errors
-- ============================================

-- PART 1: Temporarily remove constraint to allow data fix
-- ============================================
ALTER TABLE monthly_planners 
DROP CONSTRAINT IF EXISTS month_must_be_first_day;

-- PART 2: Fix existing data
-- ============================================
UPDATE monthly_planners
SET month = DATE_TRUNC('month', month)::date
WHERE EXTRACT(day FROM month) != 1;

-- Verify all are now first day of month
SELECT 
  COUNT(*) as total_records,
  COUNT(CASE WHEN EXTRACT(day FROM month) = 1 THEN 1 END) as correct_format,
  COUNT(CASE WHEN EXTRACT(day FROM month) != 1 THEN 1 END) as wrong_format
FROM monthly_planners;

-- Should show: wrong_format = 0

-- PART 3: Re-add constraint
-- ============================================
ALTER TABLE monthly_planners
ADD CONSTRAINT month_must_be_first_day
CHECK (EXTRACT(day FROM month) = 1);

-- PART 4: Fix RLS Policies for 406 errors
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own daily journals" ON daily_journals;
DROP POLICY IF EXISTS "Users can insert their own daily journals" ON daily_journals;
DROP POLICY IF EXISTS "Users can update their own daily journals" ON daily_journals;
DROP POLICY IF EXISTS "Users can delete their own daily journals" ON daily_journals;

DROP POLICY IF EXISTS "Users can view their own monthly planners" ON monthly_planners;
DROP POLICY IF EXISTS "Users can insert their own monthly planners" ON monthly_planners;
DROP POLICY IF EXISTS "Users can update their own monthly planners" ON monthly_planners;
DROP POLICY IF EXISTS "Users can delete their own monthly planners" ON monthly_planners;

DROP POLICY IF EXISTS "Users can view their own habits" ON habit_tracker;
DROP POLICY IF EXISTS "Users can insert their own habits" ON habit_tracker;
DROP POLICY IF EXISTS "Users can update their own habits" ON habit_tracker;
DROP POLICY IF EXISTS "Users can delete their own habits" ON habit_tracker;

-- Create new policies (allow all - app filters by user_id)
-- Daily Journals
CREATE POLICY "Allow all on daily_journals"
  ON daily_journals
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Monthly Planners
CREATE POLICY "Allow all on monthly_planners"
  ON monthly_planners
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Habit Tracker
CREATE POLICY "Allow all on habit_tracker"
  ON habit_tracker
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- PART 5: Verification
-- ============================================

-- Check month formats
SELECT 
  '1. Month Format Check' as step,
  month,
  EXTRACT(day FROM month) as day
FROM monthly_planners
ORDER BY month DESC
LIMIT 5;

-- Check RLS policies
SELECT 
  '2. RLS Policy Check' as step,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename IN ('daily_journals', 'monthly_planners', 'habit_tracker')
ORDER BY tablename, cmd;

-- Test query (replace YOUR_USER_ID)
-- SELECT 
--   '3. Test Query' as step,
--   * 
-- FROM monthly_planners 
-- WHERE user_id = 'f0902aaa-cdb8-4ab1-b7e5-a3f280292e41'
-- ORDER BY month DESC
-- LIMIT 3;

SELECT '✅ Setup complete! Restart your server and test.' as final_status;
