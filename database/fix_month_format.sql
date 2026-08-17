-- ============================================
-- Fix Month Format in Monthly Planners
-- ============================================
-- Purpose: Ensure all month values use first day of month
-- Run this if you get 406 errors on monthly_planners queries
-- ============================================

-- Check current data format
SELECT 
  id,
  user_id,
  month,
  date_trunc('month', month)::date as corrected_month,
  CASE 
    WHEN month = date_trunc('month', month)::date THEN '✓ Correct'
    ELSE '✗ Needs fixing'
  END as status
FROM monthly_planners
ORDER BY month DESC;

-- Update all month values to first day of month
UPDATE monthly_planners
SET month = date_trunc('month', month)::date
WHERE month != date_trunc('month', month)::date;

-- Verify the fix
SELECT 
  'Monthly Planners Fixed' as message,
  COUNT(*) as total_records,
  COUNT(CASE WHEN month = date_trunc('month', month)::date THEN 1 END) as correct_records
FROM monthly_planners;

-- ============================================
-- Add constraint to prevent future issues
-- ============================================

-- Drop existing constraint if exists
ALTER TABLE monthly_planners 
DROP CONSTRAINT IF EXISTS month_must_be_first_day;

-- Add check constraint to ensure month is always first day
ALTER TABLE monthly_planners
ADD CONSTRAINT month_must_be_first_day
CHECK (month = date_trunc('month', month)::date);

-- Test the constraint (this should fail)
-- INSERT INTO monthly_planners (user_id, month) VALUES ('00000000-0000-0000-0000-000000000000', '2026-08-15');

-- Test the constraint (this should succeed)
-- INSERT INTO monthly_planners (user_id, month) VALUES ('00000000-0000-0000-0000-000000000000', '2026-08-01');

SELECT 'Setup complete! Month format is now enforced.' as status;
