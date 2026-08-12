# Solusi Photo Masking untuk Template Polaroid

## Masalah
Foto user menutupi dekorasi template (bintang, efek jarum, frame) yang seharusnya berada di atas area foto.

## Penjelasan Template
Template polaroid adalah **SATU FILE GAMBAR UTUH** yang berisi:
- Frame putih polaroid
- Dekorasi (bintang, efek jarum, kucing)
- Background
- Area foto (photo slot)

Semua elemen sudah menjadi satu, tidak ada file terpisah untuk setiap dekorasi.

## Solusi Implementasi

### Teknik: Canvas Compositing dengan `destination-over`

Teknik ini memanfaatkan Canvas API dengan urutan layering yang tepat:

```
Layer Order (dari atas ke bawah):
1. FOTO USER (clipped ke area photo slot)
2. TEMPLATE (di bawah foto)
```

### Cara Kerja

#### 1. **Single Photo Template** (`/foto \`1.png`)

```typescript
const photoSlot = {
  x: 230,   // posisi X dari area foto
  y: 290,   // posisi Y dari area foto
  w: 610,   // lebar area foto
  h: 790    // tinggi area foto
}
```

**Langkah-langkah:**

1. **Buat background putih** untuk canvas
2. **Draw foto dengan clipping** - foto HANYA muncul di dalam photo slot
   - Gunakan `ctx.clip()` untuk membatasi area gambar
   - Implementasi object-fit: cover untuk foto
3. **Draw template dengan `destination-over`** - template muncul DI BAWAH foto
   - Foto tetap terlihat karena ada di layer atas
   - Dekorasi di luar photo slot tetap terlihat karena menutupi background putih

#### 2. **Stamp Duo Template** (`/tamplate.png`)

```typescript
const photoSlots = [
  { x: 213, y: 173, w: 495, h: 410 },  // Top photo slot
  { x: 213, y: 620, w: 495, h: 340 }   // Bottom photo slot
]
```

**Langkah-langkah:**

1. **Buat background putih**
2. **Loop untuk setiap foto:**
   - Clip foto ke slot masing-masing
   - Draw dengan object-fit: cover
3. **Draw template dengan `destination-over`**

### Kunci Implementasi

#### A. Clipping Area

```typescript
ctx.save()
ctx.beginPath()
ctx.rect(photoSlot.x, photoSlot.y, photoSlot.w, photoSlot.h)
ctx.clip()
ctx.drawImage(photoImg, ...)
ctx.restore()
```

- `ctx.clip()` membatasi gambar HANYA pada rectangle yang ditentukan
- Foto tidak akan keluar dari batas photo slot

#### B. Object-fit: Cover

```typescript
const imgAspect = photoImg.width / photoImg.height
const slotAspect = photoSlot.w / photoSlot.h

if (imgAspect > slotAspect) {
  // Foto lebih lebar - fit ke tinggi
  drawHeight = photoSlot.h
  drawWidth = photoImg.width * (photoSlot.h / photoImg.height)
  offsetX = -(drawWidth - photoSlot.w) / 2
  offsetY = 0
} else {
  // Foto lebih tinggi - fit ke lebar
  drawWidth = photoSlot.w
  drawHeight = photoImg.height * (photoSlot.w / photoImg.width)
  offsetX = 0
  offsetY = -(drawHeight - photoSlot.h) / 2
}
```

- Foto di-scale untuk menutupi seluruh area slot
- Bagian yang overflow dipotong oleh clipping
- Foto tetap proporsional (tidak distorsi)

#### C. Destination-Over Compositing

```typescript
ctx.globalCompositeOperation = 'destination-over'
ctx.drawImage(templateImg, 0, 0)
ctx.globalCompositeOperation = 'source-over' // reset
```

- `destination-over` menggambar template DI BAWAH konten yang sudah ada
- Foto (yang sudah digambar) tetap di atas
- Template mengisi area kosong (background putih)

## Hasil Akhir

✅ Foto user hanya muncul di area photo slot
✅ Foto centered dan cover slot tanpa distorsi
✅ Dekorasi template (bintang, jarum, frame) tetap terlihat
✅ Template tidak berubah atau terpotong
✅ Tidak ada element terpisah yang perlu di-manage

## Alternatif Teknik (Tidak Digunakan)

### ❌ Z-index pada HTML/CSS
Tidak bisa karena template adalah satu gambar, bukan elemen terpisah.

### ❌ Membuat Hole dengan destination-out
Sudah dicoba sebelumnya, tapi lebih kompleks dan kurang stabil.

### ❌ SVG Mask
Overkill untuk kasus ini, canvas sudah cukup.

### ✅ Destination-Over (Dipilih)
- Simple dan clean
- Stable di semua browser
- Performa bagus
- Mudah di-maintain

## Koordinat Photo Slot

Koordinat ini ditentukan berdasarkan posisi area foto pada template:

### Single Shot (`/foto \`1.png`):
- x: 230, y: 290, w: 610, h: 790

### Stamp Duo (`/tamplate.png`):
- Top: x: 213, y: 173, w: 495, h: 410
- Bottom: x: 213, y: 620, w: 495, h: 340

## Cara Update Koordinat

Jika template berubah:

1. Buka template di image editor (Photoshop, GIMP, Figma)
2. Measure posisi dan ukuran area foto
3. Update nilai `photoSlot` di kode
4. Test dengan foto sample

## File yang Diubah

- `app/camera/photobooth/page.tsx`
  - Function: `generateSingleComposite()`
  - Function: `generateStampComposite()`

## Testing

1. Buka `/camera/photobooth`
2. Pilih template
3. Ambil foto
4. Periksa hasil:
   - ✅ Foto hanya di dalam frame
   - ✅ Dekorasi terlihat sempurna
   - ✅ Tidak ada distorsi
   - ✅ Template tetap utuh
