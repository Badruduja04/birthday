# Panduan Setup Psychopomp

## Langkah 1: Install Node.js

Jika belum punya Node.js, download dan install dari:
- https://nodejs.org/ (pilih versi LTS)

Setelah install, restart terminal/command prompt Anda.

Cek instalasi dengan:
```bash
node --version
npm --version
```

## Langkah 2: Install Dependencies

Buka terminal di folder project ini (`d:\flutter\project`), lalu jalankan:

```bash
npm install
```

Tunggu hingga semua package terinstall (mungkin butuh beberapa menit).

## Langkah 3: Setup Supabase

1. Login ke Supabase: https://supabase.com
2. Buka project "Psychopomp" yang sudah dibuat
3. Pergi ke **Settings** → **API**
4. Copy **Project URL** dan **anon/public key**

## Langkah 4: Buat File Environment

1. Copy file `.env.local.example` dan rename menjadi `.env.local`
2. Isi dengan credentials Supabase:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **JANGAN** commit file `.env.local` ke Git!

## Langkah 5: Jalankan Development Server

```bash
npm run dev
```

Buka browser dan akses: **http://localhost:3000**

## Struktur Halaman yang Sudah Dibuat

### 1. Landing Page (`/`)
- Halaman sambutan dengan animasi
- Button "ENTER" ke halaman login
- Background gradient purple dengan animasi ambient

### 2. Login Page (`/login`)
- Form login dengan email & password
- Design purple yang elegan dan minimalis
- Animasi smooth dengan Framer Motion
- Responsive untuk mobile & desktop
- Glass morphism effect pada form

## Fitur Design Login:

✨ **Warna Purple yang Elegan:**
- Gradient purple dari gelap ke terang
- Border dengan opacity rendah (tidak mencolok)
- Shadow yang lembut

✨ **Animasi Halus:**
- Fade in saat page load
- Hover effect pada button
- Background ambient yang bergerak perlahan
- Loading spinner saat submit

✨ **User Experience:**
- Input fields dengan focus state yang jelas
- Placeholder yang soft
- Button dengan feedback visual
- Link "forgot password" dan "back to home"

## Cara Test Login (Sementara)

Login page saat ini belum terhubung ke Supabase Auth (akan diimplementasi nanti).

Untuk test UI:
1. Masukkan email dummy (contoh: test@email.com)
2. Masukkan password dummy (minimal 8 karakter)
3. Klik "Sign In"
4. Akan muncul loading animation

## Troubleshooting

### Error: "node is not recognized"
→ Install Node.js terlebih dahulu

### Error: "npm install" gagal
→ Hapus folder `node_modules` dan file `package-lock.json`, lalu coba lagi

### Port 3000 sudah digunakan
→ Ubah port dengan: `npm run dev -- -p 3001`

### Style tidak muncul
→ Pastikan Tailwind sudah terinstall dengan benar

## Next Steps

Setelah halaman login jalan:
1. Implement Supabase Authentication
2. Buat halaman Home
3. Implement protected routes
4. Buat profile management
5. Dan seterusnya sesuai PROJECT_PLAN.md

---

Kalau ada error atau pertanyaan, cek console browser (F12) untuk detail error.
