# Photo Booth Template Guide

## ✅ What's New

Template sekarang menggunakan **placeholder karakter Toy Story** di sekitar frame foto!

### Template Baru:
1. **Buzz Adventure** 🚀 (1 foto) - dengan Buzz Lightyear & Rex
2. **Woody & Friends** 🤠 (2 foto) - dengan Woody, Jessie, Bullseye
3. **Toy Story Gang** 🎪 (3 foto) - dengan Buzz, Woody, Rex, Slinky
4. **Pizza Planet Party** 🍕 (4 foto) - dengan Aliens, Hamm, Rex

### Layout Template:
```
┌─────────────────────────────────────────┐
│        TOY STORY MEMORIES               │
│                                         │
│   [🚀]              [🦖]               │
│   Buzz              Rex                 │
│                                         │
│          ┌───────────┐                  │
│          │   FOTO    │                  │
│          │   USER    │                  │
│          └───────────┘                  │
│                                         │
│   [🤠]              [🐷]               │
│   Woody             Hamm                │
└─────────────────────────────────────────┘
```

## 🎨 Placeholder Karakter

Sekarang ada **4 kotak warna** di sekitar foto sebagai placeholder karakter:
- **Top-left** (Ungu) 🚀 - Buzz Lightyear / karakter pertama
- **Top-right** (Hijau) 🦖 - Rex / karakter kedua
- **Bottom-left** (Kuning) 🤠 - Woody / karakter ketiga
- **Bottom-right** (Pink) 🐷 - Hamm / karakter keempat

### Warna Placeholder:
- **Purple** (#7E57C2) - untuk Buzz/space themed
- **Green** (#8BC34A) - untuk Rex/dinosaur
- **Yellow** (#FFC107) - untuk Woody/cowboy
- **Pink** (#E91E63) - untuk Hamm/pig

## 📸 Cara Kerja

1. User pilih template (misal: "Woody & Friends" dengan 2 foto)
2. User ambil foto sesuai jumlah slot
3. Sistem generate composite dengan:
   - Background kuning kotak-kotak ✅
   - Border putih ✅
   - Title "TOY STORY MEMORIES" ✅
   - **4 kotak placeholder karakter dengan emoji** ✅ (BARU!)
   - Foto user di tengah dengan frame hitam putus-putus ✅
4. Auto-save ke gallery ✅
5. Toast notification kecil muncul ✅
6. Redirect ke `/memories` ✅

## 🔄 Cara Mengganti dengan Gambar Asli

Nanti kalau sudah ada file gambar karakter Toy Story:

### Langkah 1: Simpan gambar di folder
```
public/
  templates/
    buzz.png
    woody.png
    rex.png
    jessie.png
    hamm.png
    slinky.png
    aliens.png
```

### Langkah 2: Update kode di `generateComposite()`

Ganti emoji dengan gambar asli:

```typescript
// Contoh untuk top-left character
const buzzImg = new Image()
buzzImg.src = '/templates/buzz.png'
await new Promise<void>((resolve) => {
  buzzImg.onload = () => {
    ctx.drawImage(buzzImg, 80, 140, 120, 150)
    resolve()
  }
})
```

### Langkah 3: Hapus placeholder boxes

Hapus kode `ctx.fillRect()` dan `ctx.strokeRect()` untuk placeholder boxes, tinggal gambar saja.

## 📋 File yang Diubah

- ✅ `app/camera/photobooth/page.tsx` - Template dengan placeholder karakter
- ✅ `database/fix_complete_rls.sql` - Fix RLS untuk storage + database
- ✅ Toast notification kecil (bukan overlay besar)

## 🎯 Testing

1. Login ke aplikasi
2. Kamera → Photo Booth
3. Pilih "Buzz Adventure"
4. Ambil 1 foto
5. Lihat hasil:
   - ✅ Background kuning kotak-kotak
   - ✅ 4 kotak placeholder dengan emoji di corner
   - ✅ Foto user di tengah dengan border
   - ✅ Toast "Saving..." lalu "Saved Successfully!"
   - ✅ Auto-redirect ke gallery

## 💡 Next Steps

### Opsi A: Cari/Buat Gambar Karakter
- Download clipart Toy Story characters (pastikan legal/free to use)
- Atau buat ilustrasi sendiri dengan style Toy Story
- Format: PNG dengan transparent background
- Size: sekitar 200x250px per karakter

### Opsi B: Gunakan Placeholder Dulu
- Template sekarang sudah jalan dengan emoji placeholder
- Nanti tinggal ganti emoji dengan gambar asli
- Kode sudah siap untuk di-upgrade

## 🚨 Known Issues

### Warning: Prop `style` did not match
- Ini warning Next.js hydration (aman diabaikan)
- Tidak mempengaruhi functionality
- Disebabkan oleh animasi framer-motion dengan random positions

### Blob URL Error (ERR_FILE_NOT_FOUND)
- Blob URL sudah revoked setelah redirect
- Normal behavior, tidak error
- Gambar sudah tersimpan di Supabase

## 📝 Notes

- Template saat ini menggunakan emoji sebagai placeholder
- Layout sudah disesuaikan untuk memberi ruang pada karakter
- Photo area dipindah ke tengah (top: 320px, bottom: 280px from bottom)
- Character boxes ukuran: 100-120px width, 120-150px height
- Setiap template punya karakter berbeda (lihat `TEMPLATES` array)
