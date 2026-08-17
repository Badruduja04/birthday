-- ============================================
-- FIX RLS POLICIES - Run this AFTER planner_tables.sql
-- ============================================
-- Purpose: Fix RLS policies to work with custom auth (localStorage)
-- Instead of auth.uid(), we use simple USING (true) since
-- the app filters by user_id in queries
-- ============================================

-- First, DROP all existing policies
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

DROP POLICY IF EXISTS "Users can view their own schedule tasks" ON schedule_tasks;
DROP POLICY IF EXISTS "Users can insert their own schedule tasks" ON schedule_tasks;
DROP POLICY IF EXISTS "Users can update their own schedule tasks" ON schedule_tasks;
DROP POLICY IF EXISTS "Users can delete their own schedule tasks" ON schedule_tasks;

-- ============================================
-- CREATE NEW POLICIES (Compatible with custom auth)
-- ============================================

-- Daily Journals Policies
CREATE POLICY "Users can view their own daily journals"
  ON daily_journals FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own daily journals"
  ON daily_journals FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own daily journals"
  ON daily_journals FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete their own daily journals"
  ON daily_journals FOR DELETE
  USING (true);

-- Monthly Planners Policies
CREATE POLICY "Users can view their own monthly planners"
  ON monthly_planners FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own monthly planners"
  ON monthly_planners FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own monthly planners"
  ON monthly_planners FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete their own monthly planners"
  ON monthly_planners FOR DELETE
  USING (true);

-- Habit Tracker Policies
CREATE POLICY "Users can view their own habits"
  ON habit_tracker FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own habits"
  ON habit_tracker FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own habits"
  ON habit_tracker FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete their own habits"
  ON habit_tracker FOR DELETE
  USING (true);

-- Schedule Tasks Policies
CREATE POLICY "Users can view their own schedule tasks"
  ON schedule_tasks FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own schedule tasks"
  ON schedule_tasks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own schedule tasks"
  ON schedule_tasks FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete their own schedule tasks"
  ON schedule_tasks FOR DELETE
  USING (true);

-- ============================================
-- VERIFICATION
-- ============================================
-- Run this to check if policies are active:
-- SELECT schemaname, tablename, policyname, cmd 
-- FROM pg_policies 
-- WHERE tablename IN ('daily_journals', 'monthly_planners', 'habit_tracker', 'schedule_tasks');
