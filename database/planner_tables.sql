-- ============================================
-- Personal Planner Database Tables
-- ============================================
-- Created: 2026-08-16
-- Purpose: Support daily journal and monthly planner features
-- ============================================

-- 1. Daily Journal Entries
-- Stores daily diary entries with todo lists, mood tracking, and photos
CREATE TABLE IF NOT EXISTS daily_journals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  todo_list jsonb DEFAULT '[]'::jsonb, -- Array of tasks user wants to do
  completed_list jsonb DEFAULT '[]'::jsonb, -- Array of completed tasks
  mood_morning text, -- 'happy', 'excited', 'neutral', 'sad', 'angry', etc
  mood_evening text,
  comment text, -- Daily reflection/comment
  photo_url text, -- Photo of the day
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, date) -- One journal entry per user per day
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_daily_journals_user_date ON daily_journals(user_id, date DESC);

-- 2. Monthly Planner
-- Stores monthly planning data (focus, goals, priorities)
CREATE TABLE IF NOT EXISTS monthly_planners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  month date NOT NULL, -- First day of the month (e.g., 2026-08-01)
  focus_theme text, -- "Focus this month" text
  goals jsonb DEFAULT '[]'::jsonb, -- Array of goals for the month
  priorities jsonb DEFAULT '[]'::jsonb, -- Top priorities
  notes text, -- Additional notes/brain dump
  gratitude_list jsonb DEFAULT '[]'::jsonb, -- Things to be grateful for
  monthly_reflection text, -- End of month reflection
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, month) -- One planner per user per month
);

CREATE INDEX IF NOT EXISTS idx_monthly_planners_user_month ON monthly_planners(user_id, month DESC);

-- 3. Habit Tracker
-- Tracks daily habits with completion status
CREATE TABLE IF NOT EXISTS habit_tracker (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  habit_name text NOT NULL, -- e.g., "Workout", "Read", "Drink Water"
  habit_icon text, -- Emoji or icon identifier
  month date NOT NULL, -- Month this habit is tracked
  tracked_dates jsonb DEFAULT '[]'::jsonb, -- Array of dates when habit was completed ["2026-08-01", "2026-08-05"]
  target_days integer DEFAULT 7, -- How many days per week is the target
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_habit_tracker_user_month ON habit_tracker(user_id, month);

-- 4. Schedule/Tasks
-- Stores scheduled tasks and events with specific times
CREATE TABLE IF NOT EXISTS schedule_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  time time, -- Optional time for the task
  title text NOT NULL,
  description text,
  category text, -- 'work', 'personal', 'health', 'study', etc
  is_completed boolean DEFAULT false,
  priority integer DEFAULT 0, -- 0=none, 1=low, 2=medium, 3=high
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_schedule_tasks_user_date ON schedule_tasks(user_id, date, time);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE daily_journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_planners ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_tracker ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_tasks ENABLE ROW LEVEL SECURITY;

-- Daily Journals Policies
-- Using simple user_id check (no auth.uid() since we use custom auth)
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
-- Triggers for updated_at
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables
CREATE TRIGGER update_daily_journals_updated_at BEFORE UPDATE ON daily_journals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monthly_planners_updated_at BEFORE UPDATE ON monthly_planners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_habit_tracker_updated_at BEFORE UPDATE ON habit_tracker
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedule_tasks_updated_at BEFORE UPDATE ON schedule_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- NOTES FOR IMPLEMENTATION:
-- ============================================
-- 1. Run this SQL in Supabase SQL Editor
-- 2. Create storage bucket for daily journal photos:
--    - Bucket name: 'daily-journal-photos'
--    - Public: false (only authenticated users)
-- 3. Example queries:
--    - Get today's journal: SELECT * FROM daily_journals WHERE user_id = $1 AND date = CURRENT_DATE
--    - Get current month planner: SELECT * FROM monthly_planners WHERE user_id = $1 AND month = date_trunc('month', CURRENT_DATE)
--    - Track habit: UPDATE habit_tracker SET tracked_dates = tracked_dates || '["2026-08-16"]' WHERE id = $1
