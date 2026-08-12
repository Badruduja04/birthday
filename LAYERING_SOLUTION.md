# Solusi Layering Template Polaroid

## Masalah
Template `foto 1.png` adalah 1 file PNG yang berisi:
- Frame polaroid (border cream)
- Area putih di tengah (untuk foto)
- Dekorasi (bintang merah & jarum/pins) di sudut atas

Ketika kita composite foto + template, ada 2 masalah:
1. Jika draw template dulu → area putih menutupi foto
2. Jika draw foto dulu → foto menutupi dekorasi (bintang & jarum)

## Solusi yang Diimplementasikan

### Teknik: Template Masking
1. Buat canvas temporary dari template
2. Gunakan `globalCompositeOperation = 'destination-out'` untuk "membuat hole" di area foto
3. Draw foto ke canvas utama
4. Draw template (with hole) di atas foto

**Hasil:**
- Foto terlihat di tengah
- Frame & dekorasi tetap muncul
- Bintang & jarum di atas foto (tidak tertimpa)

### Jika Solusi Ini Gagal

Kemungkinan: Template PNG memiliki struktur yang kompleks atau dekorasi berada di layer yang sama dengan area putih.

**Solusi Alternatif:**

#### Opsi A: Edit Template PNG
Buat 2 file terpisah:
- `foto-1-base.png` - Frame + background TANPA dekorasi
- `foto-1-decorations.png` - HANYA bintang & jarum (transparan)

Composite order:
```javascript
ctx.drawImage(baseImg, 0, 0)        // Frame
ctx.drawImage(photoImg, x, y)       // Foto
ctx.drawImage(decorationsImg, 0, 0) // Dekorasi
```

#### Opsi B: CSS Overlay (untuk preview)
Gunakan CSS `position: absolute` dan `z-index` untuk overlay dekorasi di atas foto saat preview.

#### Opsi C: Kurangi Area Foto
Foto tidak sampai ke ujung atas, beri ruang 50-100px dari atas agar tidak menutupi dekorasi.

## Kesimpulan
Teknik masking yang digunakan sekarang **SEHARUSNYA** berhasil jika template memiliki struktur layer yang sederhana. Coba test dulu, jika gagal kita gunakan Opsi A atau C.
