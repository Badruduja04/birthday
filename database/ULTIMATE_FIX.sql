-- ============================================
-- ULTIMATE FIX - Delete Old Data & Start Fresh
-- ============================================
-- This will DELETE all planner data and start clean
-- Run ONLY if you're OK losing current data
-- ============================================

-- IMPORTANT: This will delete your data!
-- If you want to keep data, comment out the DELETE commands

-- Step 1: Show current data before delete
SELECT '=== CURRENT DATA (will be deleted) ===' as info;
SELECT month, focus_theme FROM monthly_planners ORDER BY month DESC;

-- Step 2: Disable RLS to allow operations
ALTER TABLE monthly_planners DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_journals DISABLE ROW LEVEL SECURITY;
ALTER TABLE habit_tracker DISABLE ROW LEVEL SECURITY;

-- Step 3: Drop ALL constraints
ALTER TABLE monthly_planners DROP CONSTRAINT IF EXISTS month_must_be_first_day;
ALTER TABLE monthly_planners DROP CONSTRAINT IF EXISTS monthly_planners_user_id_month_key;

-- Step 4: DELETE ALL DATA (START FRESH)
DELETE FROM habit_tracker;
DELETE FROM monthly_planners;
-- DELETE FROM daily_journals;  -- Uncomment if you want to delete journals too

SELECT '✅ Old data deleted' as step_4;

-- Step 5: Re-create constraints (correct ones)
ALTER TABLE monthly_planners
ADD CONSTRAINT monthly_planners_user_id_month_key UNIQUE (user_id, month);

ALTER TABLE monthly_planners
ADD CONSTRAINT month_must_be_first_day
CHECK (EXTRACT(day FROM month) = 1);

SELECT '✅ Constraints re-created' as step_5;

-- Step 6: Drop ALL old policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname, tablename FROM pg_policies 
              WHERE tablename IN ('monthly_planners', 'daily_journals', 'habit_tracker'))
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
    END LOOP;
END $$;

SELECT '✅ Old policies dropped' as step_6;

-- Step 7: Create ONE simple policy per table
CREATE POLICY "allow_all_operations" ON monthly_planners 
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "allow_all_operations" ON daily_journals 
FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "allow_all_operations" ON habit_tracker 
FOR ALL USING (true) WITH CHECK (true);

SELECT '✅ New policies created' as step_7;

-- Step 8: Enable RLS
ALTER TABLE monthly_planners ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_tracker ENABLE ROW LEVEL SECURITY;

SELECT '✅ RLS enabled' as step_8;

-- Step 9: Verify setup
SELECT '=== VERIFICATION ===' as info;

SELECT 'Tables RLS Status:' as check_1;
SELECT tablename, rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('monthly_planners', 'daily_journals', 'habit_tracker');

SELECT 'Policies:' as check_2;
SELECT tablename, policyname, cmd, qual
FROM pg_policies 
WHERE tablename IN ('monthly_planners', 'daily_journals', 'habit_tracker');

SELECT 'Data Count:' as check_3;
SELECT 
  (SELECT COUNT(*) FROM monthly_planners) as monthly_planners,
  (SELECT COUNT(*) FROM daily_journals) as daily_journals,
  (SELECT COUNT(*) FROM habit_tracker) as habit_tracker;

-- Step 10: Test insert (will use correct format)
-- Uncomment to test:
/*
INSERT INTO monthly_planners (user_id, month, focus_theme)
VALUES (
  'f0902aaa-cdb8-4ab1-b7e5-a3f280292e41',  -- Your user ID
  '2026-08-01',  -- Correct format (first day)
  'Test after fresh start'
)
RETURNING *;
*/

SELECT '🎉 SETUP COMPLETE! Database is now clean.' as final_status;
SELECT 'Restart your server and test!' as next_action;
