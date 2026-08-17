-- ============================================
-- QUICK FIX for 406 Errors
-- ============================================
-- Run this script step by step
-- ============================================

-- STEP 1: Check current month format in monthly_planners
SELECT 
  month,
  EXTRACT(day FROM month) as day_of_month,
  CASE 
    WHEN EXTRACT(day FROM month) = 1 THEN '✓ OK'
    ELSE '✗ WRONG - Needs fix'
  END as status
FROM monthly_planners
ORDER BY month DESC;

-- If you see any "WRONG", continue to STEP 2
-- If all are "OK", skip to STEP 4


-- ============================================
-- STEP 2: Fix month format (uncomment to run)
-- ============================================
/*
UPDATE monthly_planners
SET month = DATE_TRUNC('month', month)::date;
*/


-- ============================================
-- STEP 3: Verify the fix
-- ============================================
/*
SELECT month FROM monthly_planners ORDER BY month DESC;
-- All should now be first day of month (day 1)
*/


-- ============================================
-- STEP 4: Check RLS policies
-- ============================================
SELECT 
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN qual = 'true' THEN '✓ OK - Allows all'
    WHEN qual LIKE '%auth.uid()%' THEN '✗ PROBLEM - Uses auth.uid()'
    ELSE '? Unknown'
  END as policy_status
FROM pg_policies 
WHERE tablename IN ('daily_journals', 'monthly_planners')
ORDER BY tablename, cmd;

-- If you see "PROBLEM", run: database/fix_rls_policies.sql


-- ============================================
-- STEP 5: Test queries (replace YOUR_USER_ID)
-- ============================================
/*
-- Test monthly_planners (should work without 406)
SELECT month, focus_theme 
FROM monthly_planners 
WHERE user_id = 'YOUR_USER_ID' 
  AND month = '2026-08-01';  -- Use first day of month!

-- Test daily_journals (should work without 406)
SELECT date, mood_morning 
FROM daily_journals 
WHERE user_id = 'YOUR_USER_ID' 
  AND date = CURRENT_DATE;
*/


-- ============================================
-- FINAL VERIFICATION
-- ============================================
SELECT 
  'Setup complete!' as status,
  'Check console for 406 errors after refresh' as next_step;
