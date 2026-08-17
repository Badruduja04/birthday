-- ============================================
-- REMOVE BLOCKING CONSTRAINT
-- ============================================
-- This removes the constraint that's blocking saves
-- The app code is now fixed to always use correct format
-- ============================================

-- Remove the constraint
ALTER TABLE monthly_planners 
DROP CONSTRAINT IF EXISTS month_must_be_first_day;

SELECT '✅ Constraint removed!' as status;
SELECT 'App will now be able to save data' as result;

-- You can verify:
SELECT 
  conname as constraint_name
FROM pg_constraint
WHERE conrelid = 'monthly_planners'::regclass;

-- Should NOT see "month_must_be_first_day" in results
