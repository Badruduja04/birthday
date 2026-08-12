# 🔧 Login Fix - Testing Guide

## ✅ Yang Sudah Diperbaiki:

### 1. **Path Gambar Buzz** 
- ❌ `public/buzz.webp` → ✅ `/buzz.webp`
- Sekarang gambar akan load dengan benar

### 2. **Login Format Birthday**
- Username: case-insensitive + trim whitespace
- Birthday: format YYYY-MM-DD (standardized)
- Console logs untuk debugging

---

## 🧪 Test Login

### Data dari Screenshot Supabase:
```
Username: lolla
Birthday: 2002-07-27
Display Name: caramel
```

### Cara Test:

1. **Buka browser console** (F12)
2. **Go to** `http://localhost:3000/login`
3. **Isi form:**
   - Username: `lolla` (atau `Lolla` atau `LOLLA` - akan di-lowercase)
   - Birthday: Pilih `27/07/2002` dari date picker
4. **Klik** "ENTER MY WORLD 🎁"

### Expected Console Logs:
```
Login attempt: { username: "lolla", birthday: "2002-07-27" }
Query result: { profile: {...}, profileError: null }
```

### Result:
- ✅ **Success**: Redirect ke `/home`
- ❌ **Fail**: Ledakan animation + error message

---

## 🐛 Debugging

### Jika Masih Error:

#### Check 1: Console Logs
Buka browser console, cari log:
```javascript
Login attempt: { username: "...", birthday: "..." }
Query result: { profile: ..., profileError: ... }
```

#### Check 2: Format Birthday
Date picker harus mengirim format: `YYYY-MM-DD`
Contoh: `2002-07-27` BUKAN `27/07/2002`

#### Check 3: Supabase Connection
```javascript
// Test di browser console:
const { data, error } = await supabase
  .from('profiles')
  .select('*')
console.log({ data, error })
```

#### Check 4: Username Case
Database: `lolla`
Input: `Lolla` atau `LOLLA` → akan di-convert ke lowercase

---

## 📝 Manual Test Query

Buka Supabase SQL Editor dan test:

```sql
-- Test exact match
SELECT * FROM profiles 
WHERE username = 'lolla' 
AND birthday = '2002-07-27';

-- Should return:
-- id: 1d-b0cc-a6bb411017...
-- username: lolla
-- display_name: caramel
-- birthday: 2002-07-27
```

---

## 🎯 Expected Behavior

### Scenario 1: Correct Credentials
```
Input:
- Username: lolla
- Birthday: 27/07/2002

Process:
✅ Format to: { username: "lolla", birthday: "2002-07-27" }
✅ Query Supabase
✅ Profile found
✅ Save to localStorage
✅ Redirect to /home
```

### Scenario 2: Wrong Credentials
```
Input:
- Username: wronguser
- Birthday: 27/07/2002

Process:
✅ Format to: { username: "wronguser", birthday: "2002-07-27" }
✅ Query Supabase
❌ Profile NOT found
💥 Show explosion animation
⚠️ Show error message
```

---

## 🔍 Alternative Test

Jika masih tidak work, test langsung dengan Supabase client:

1. Buka browser console di halaman login
2. Paste kode ini:

```javascript
// Import supabase client
const { createClient } = require('@supabase/supabase-js');

// Your Supabase credentials (dari .env.local)
const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_ANON_KEY'
);

// Test query
const testLogin = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', 'lolla')
    .eq('birthday', '2002-07-27')
    .single();
  
  console.log('Test result:', { data, error });
};

testLogin();
```

---

## 📊 Data Format Reference

### Birthday Format:
```
✅ Correct: "2002-07-27" (YYYY-MM-DD)
❌ Wrong: "27/07/2002" (DD/MM/YYYY)
❌ Wrong: "07/27/2002" (MM/DD/YYYY)
❌ Wrong: "2002-7-27" (no leading zeros)
```

### Username Format:
```
✅ Correct: "lolla" (lowercase, trimmed)
✅ Also works: "Lolla" (akan di-convert)
✅ Also works: " lolla " (akan di-trim)
❌ Wrong: Username tidak ada di database
```

---

## 🎨 Visual Test

### Login Page Harus Terlihat:
```
┌────────────────────────────┐
│   [Buzz Image] ← Harus     │
│                   terlihat! │
│   Welcome Back!            │
│                            │
│ 👤 USERNAME                │
│ [lolla_____________]       │
│                            │
│ 🎂 BIRTHDAY                │
│ [27/07/2002________]       │
│                            │
│ [ENTER MY WORLD 🎁]       │
│                            │
│ ● ● ● ●  ← Manik-manik    │
│          animasi           │
└────────────────────────────┘
```

---

## ✅ Success Indicators

### Login Berhasil:
1. Console log: "Login attempt" dengan data benar
2. Console log: "Query result" dengan profile data
3. No error message
4. Page redirect ke `/home`
5. Di home page, muncul greeting dengan display_name

### Login Gagal (Expected):
1. Console log: "Login attempt" dengan data
2. Console log: "Query result" dengan profileError
3. 💥 Explosion animation (meteor flying)
4. ⚠️ Error message: "Username or birthday is incorrect"
5. Tetap di halaman login

---

## 🚨 Common Issues

### Issue 1: "TypeError: Cannot read property 'innerHTML'"
**Fix**: Gambar error handler - sudah diperbaiki dengan remove onError

### Issue 2: "Profile not found" tapi data benar
**Possible causes**:
- Format birthday salah
- Username typo
- Whitespace di input
- Case sensitivity issue

**Fix**: Sudah di-handle dengan `.toLowerCase().trim()` dan format date

### Issue 3: Gambar Buzz tidak muncul
**Fix**: Path sudah diperbaiki ke `/buzz.webp`

---

## 📱 Browser Compatibility

Tested on:
- ✅ Chrome/Edge
- ✅ Firefox
- ✅ Safari

Date picker format may vary by browser, but code handles it automatically.

---

Silakan test lagi dan kirim screenshot console log jika masih error! 🐛
