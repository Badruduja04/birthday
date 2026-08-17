# Database Setup Instructions

## 📋 Setup Order

### 1. Run `planner_tables.sql`
Creates all tables, indexes, and initial RLS policies.

**In Supabase SQL Editor:**
```sql
-- Copy paste entire content of planner_tables.sql
-- Click RUN
```

### 2. Run `fix_rls_policies.sql` ⚠️ **IMPORTANT**
Fixes RLS policies to work with custom authentication (localStorage).

**In Supabase SQL Editor:**
```sql
-- Copy paste entire content of fix_rls_policies.sql
-- Click RUN
```

### 3. Create Storage Bucket

**In Supabase Dashboard > Storage:**
1. Click **New bucket**
2. Name: `daily-journal-photos`
3. **Public**: `false` (authenticated users only)
4. Click **Create bucket**

---

## 🗂️ Tables Created

### `daily_journals`
Stores daily diary entries.

**Columns:**
- `id` (uuid, primary key)
- `user_id` (uuid, references profiles)
- `date` (date) - unique per user per day
- `todo_list` (jsonb) - tasks to do
- `completed_list` (jsonb) - completed tasks
- `mood_morning` (text) - morning mood
- `mood_evening` (text) - evening mood
- `comment` (text) - daily reflection
- `photo_url` (text) - photo of the day
- `created_at`, `updated_at` (timestamp)

### `monthly_planners`
Stores monthly planning data.

**Columns:**
- `id` (uuid, primary key)
- `user_id` (uuid, references profiles)
- `month` (date) - first day of month, unique per user per month
- `focus_theme` (text) - focus for the month
- `goals` (jsonb) - goals array
- `priorities` (jsonb) - top priorities array
- `notes` (text) - notes/brain dump
- `gratitude_list` (jsonb) - gratitude items
- `monthly_reflection` (text) - end of month reflection
- `created_at`, `updated_at` (timestamp)

### `habit_tracker`
Tracks daily habits.

**Columns:**
- `id` (uuid, primary key)
- `user_id` (uuid, references profiles)
- `habit_name` (text) - habit name
- `habit_icon` (text) - emoji icon
- `month` (date) - tracking month
- `tracked_dates` (jsonb) - array of completed dates
- `target_days` (integer) - target days per week
- `created_at`, `updated_at` (timestamp)

### `schedule_tasks`
Stores scheduled tasks and events.

**Columns:**
- `id` (uuid, primary key)
- `user_id` (uuid, references profiles)
- `date` (date) - task date
- `time` (time) - task time (optional)
- `title` (text) - task title
- `description` (text) - task details
- `category` (text) - work, personal, health, study, etc
- `is_completed` (boolean) - completion status
- `priority` (integer) - 0=none, 1=low, 2=medium, 3=high
- `created_at`, `updated_at` (timestamp)

---

## 🔒 Security

- **RLS (Row Level Security)** enabled on all tables
- Policies use `USING (true)` for compatibility with custom auth
- Application-level filtering by `user_id` ensures data isolation
- Storage bucket is private (authenticated users only)

---

## ✅ Verification

After running both SQL files, verify in Supabase:

**Check tables exist:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('daily_journals', 'monthly_planners', 'habit_tracker', 'schedule_tasks');
```

**Check RLS policies:**
```sql
SELECT schemaname, tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('daily_journals', 'monthly_planners', 'habit_tracker', 'schedule_tasks');
```

You should see 4 policies per table (SELECT, INSERT, UPDATE, DELETE).

---

## 🚨 Troubleshooting

### Error: `new row violates row-level security policy`
**Solution:** Run `fix_rls_policies.sql` to update policies.

### Error: `404` or `406` when loading data
**Solution:** Check that tables exist and RLS policies are correct.

### Photo upload fails
**Solution:** Create `daily-journal-photos` storage bucket.

---

## 📝 Example Queries

**Get today's journal:**
```sql
SELECT * FROM daily_journals 
WHERE user_id = 'USER_ID_HERE' 
AND date = CURRENT_DATE;
```

**Get current month planner:**
```sql
SELECT * FROM monthly_planners 
WHERE user_id = 'USER_ID_HERE' 
AND month = date_trunc('month', CURRENT_DATE);
```

**Get this month's habits:**
```sql
SELECT * FROM habit_tracker 
WHERE user_id = 'USER_ID_HERE' 
AND month = date_trunc('month', CURRENT_DATE);
```
