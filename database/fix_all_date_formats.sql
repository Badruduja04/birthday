-- ============================================
-- Fix All Date Format Issues
-- ============================================
-- Run this to fix 406 errors
-- ============================================

-- 1. Check current monthly_planners data
SELECT 
  id,
  user_id,
  month,
  date_trunc('month', month)::date as corrected_month,
  CASE 
    WHEN month = date_trunc('month', month)::date THEN '✓ OK'
    ELSE '✗ WRONG - Will fix'
  END as status
FROM monthly_planners
ORDER BY month DESC;

-- 2. Fix all monthly_planners to use first day of month
UPDATE monthly_planners
SET month = date_trunc('month', month)::date
WHERE month != date_trunc('month', month)::date;

-- 3. Verify fix
SELECT 
  'Monthly planners fixed!' as message,
  COUNT(*) as total_records,
  COUNT(CASE WHEN month = date_trunc('month', month)::date THEN 1 END) as correct_format
FROM monthly_planners;

-- 4. Add constraint to prevent future issues
ALTER TABLE monthly_planners 
DROP CONSTRAINT IF EXISTS month_must_be_first_day;

ALTER TABLE monthly_planners
ADD CONSTRAINT month_must_be_first_day
CHECK (month = date_trunc('month', month)::date);

-- 5. Check daily_journals dates (should already be fine)
SELECT 
  COUNT(*) as total_entries,
  MIN(date) as earliest_date,
  MAX(date) as latest_date
FROM daily_journals;

-- 6. Check for any malformed dates in daily_journals
SELECT date, COUNT(*) 
FROM daily_journals
GROUP BY date
ORDER BY date DESC
LIMIT 10;

-- 7. Verify RLS policies allow queries
SELECT 
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN qual = 'true' THEN '✓ Allows all'
    WHEN qual LIKE '%auth.uid()%' THEN '⚠️ Uses auth.uid() (might cause 406)'
    ELSE '? Custom condition'
  END as policy_check
FROM pg_policies 
WHERE tablename IN ('daily_journals', 'monthly_planners')
ORDER BY tablename, cmd;

-- 8. If you see auth.uid() policies, they might cause 406 errors
-- Run fix_rls_policies.sql to fix them

SELECT '✅ Date format check complete!' as final_status;
SELECT 'If you still see 406 errors, run: database/fix_rls_policies.sql' as next_step;
