# 🔧 Fix Error 406 - Supabase RLS

## ❌ Error Yang Muncul:
```
Failed to load resource: the server responded with a status of 406 ()
Profile not found: Object
```

## 🎯 Root Cause:
**Row Level Security (RLS)** di Supabase **memblokir** public access ke tabel `profiles`.

Error 406 = Supabase menolak request karena:
1. RLS enabled
2. Tidak ada policy yang allow public read
3. User belum authenticated

---

## ✅ Solution: Setup RLS Policies

### Step 1: Buka Supabase SQL Editor

1. Go to: https://supabase.com/dashboard
2. Pilih project: **Psychopomp**
3. Klik: **SQL Editor** (di sidebar kiri)
4. Klik: **New Query**

### Step 2: Run SQL Script

Copy-paste SQL ini ke editor:

```sql
-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (clean slate)
DROP POLICY IF EXISTS "Allow public read access to profiles" ON profiles;

-- Create policy untuk PUBLIC READ
-- Ini memungkinkan login dengan username + birthday
CREATE POLICY "Allow public read access to profiles"
ON profiles
FOR SELECT
TO public
USING (true);
```

### Step 3: Click "RUN" 

Wait sampai muncul: **Success. No rows returned**

### Step 4: Verify

Test query ini:
```sql
SELECT * FROM profiles WHERE username = 'lolla' AND birthday = '2002-07-27';
```

Should return:
```
✅ 1 row dengan data profile
```

---

## 🔄 Alternative: Disable RLS (Untuk Testing)

**⚠️ WARNING: Hanya untuk development/testing!**

Jika mau test cepat tanpa RLS:

```sql
-- Disable RLS temporarily
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
```

Tapi **JANGAN** di-disable di production!

---

## 📝 Yang Sudah Diperbaiki di Code:

### 1. Supabase Client Config
```typescript
// lib/supabase/client.ts
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    headers: {
      apikey: supabaseAnonKey,  // ← Added!
    },
  },
})
```

### 2. Auth Function
```typescript
// Tidak pakai .single() lagi
// Karena .single() throw error jika tidak ada data
const { data: profiles } = await supabase
  .from('profiles')
  .select('*')
  .eq('username', username)
  .eq('birthday', birthday)

// Check manually
if (!profiles || profiles.length === 0) {
  return { success: false, error: 'Not found' }
}

const profile = profiles[0]
```

---

## 🧪 Test Setelah Fix

### Test 1: Manual Query di Supabase
```sql
-- Di SQL Editor
SELECT * FROM profiles 
WHERE username = 'lolla' 
AND birthday = '2002-07-27';

-- Expected: 1 row
```

### Test 2: Browser Console
```javascript
// Di login page, buka console (F12)
// Paste ini:

const testQuery = async () => {
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(
    'YOUR_SUPABASE_URL',  // From .env.local
    'YOUR_SUPABASE_ANON_KEY'  // From .env.local
  );
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', 'lolla')
    .eq('birthday', '2002-07-27');
  
  console.log('Test result:', { data, error });
};

testQuery();
```

Expected console:
```
Test result: {
  data: [{ id: "...", username: "lolla", ... }],
  error: null
}
```

### Test 3: Login Flow
1. Refresh page: `http://localhost:3000/login`
2. Username: `lolla`
3. Birthday: `27/07/2002`
4. Click: "ENTER MY WORLD 🎁"
5. Check console:
   ```
   Login attempt: { username: "lolla", birthday: "2002-07-27" }
   Query result: { profiles: [...], profileError: null }
   ```
6. ✅ Redirect to `/home`

---

## 🔒 Security Notes

### Current Setup (Development)
```
✅ RLS Enabled
✅ Public READ allowed (untuk login)
❌ Public WRITE tidak allowed (secure)
```

### For Production
Nanti bisa upgrade ke:
```typescript
// Pakai Supabase Auth proper
const { data, error } = await supabase.auth.signInWithOtp({
  email: user.email,
  options: {
    data: {
      username: username,
      birthday: birthday
    }
  }
})
```

Dengan RLS policy:
```sql
CREATE POLICY "Users can read own profile"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);
```

---

## 📊 Checklist

Sebelum test lagi, pastikan:

- [x] Code updated (Supabase client + auth function)
- [ ] SQL script RUN di Supabase
- [ ] Verify policy exists
- [ ] Test query manual works
- [ ] Refresh browser
- [ ] Clear console
- [ ] Test login

---

## 🐛 Masih Error?

### Check 1: RLS Policy
```sql
-- Di SQL Editor
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- Should show:
-- policyname: "Allow public read access to profiles"
-- permissive: true
-- roles: {public}
-- cmd: SELECT
```

### Check 2: Network Tab
1. Buka DevTools (F12)
2. Go to **Network** tab
3. Try login
4. Look for request: `profiles?select=*&username=eq.lolla...`
5. Check response:
   - ✅ Status: **200 OK**
   - ❌ Status: **406** → RLS still blocking

### Check 3: Headers
Click request → **Headers** tab:
```
Request Headers:
✅ apikey: eyJhbGc...
✅ Authorization: Bearer eyJhbGc...
```

---

## 🚀 After Fix Works:

Expected flow:
```
Input: lolla + 27/07/2002
  ↓
Query Supabase (200 OK)
  ↓
Profile found ✅
  ↓
Save to localStorage
  ↓
Redirect to /home
  ↓
Greeting: "Good morning, caramel! 💚"
```

---

Setelah run SQL script di Supabase, **RESTART** development server:
```bash
# Stop (Ctrl+C)
npm run dev
```

Lalu refresh browser dan test lagi! 🎯
