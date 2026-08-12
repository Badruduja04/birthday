# Design Notes - Login Page

## 🎨 Konsep Design

Halaman login Psychopomp dirancang dengan filosofi:
> "Elegant, personal, dan tidak norak"

## Color Palette

### Purple Gradients
```
Background: purple-900 → purple-800 → purple-950
Form background: white/10 dengan backdrop blur (glass effect)
Borders: purple-500/20-30 (subtle, tidak mencolok)
Text: white dengan purple-200 untuk secondary text
Button: purple-600 → purple-500 gradient
```

### Opacity Levels
- Form container: `bg-white/10` (10% opacity - subtle)
- Border: `border-purple-500/20` (20% opacity - very soft)
- Shadows: `shadow-purple-500/30` (30% opacity - gentle glow)
- Background orbs: `bg-purple-500/20` (20% - atmospheric)

## Layout Structure

```
┌─────────────────────────────────────┐
│                                     │
│           [Animated Orb 1]          │
│                                     │
│         Psychopomp                  │
│    Enter your little world          │
│                                     │
│    ┌─────────────────────┐         │
│    │                     │         │
│    │  Email              │         │
│    │  [input field]      │         │
│    │                     │         │
│    │  Password           │         │
│    │  [input field]      │         │
│    │                     │         │
│    │   [Sign In Button]  │         │
│    │                     │         │
│    │  Forgot password?   │         │
│    └─────────────────────┘         │
│                                     │
│      ← Back to home                 │
│                                     │
│   [Animated Orb 2]                  │
└─────────────────────────────────────┘
```

## Typography

- **Heading (Psychopomp)**: 
  - Size: `text-4xl` (36px)
  - Weight: `font-light` (300)
  - Tracking: `tracking-wide`
  
- **Subtitle**:
  - Size: `text-sm`
  - Color: `text-purple-300`
  
- **Input Labels**:
  - Size: `text-sm`
  - Weight: `font-medium`
  - Color: `text-purple-200`

## Component Details

### Form Container
```css
Background: white/10 opacity
Backdrop: blur-lg (strong blur effect)
Border: 1px purple-500/20
Border-radius: 24px (rounded-3xl)
Padding: 32px (p-8)
Shadow: 2xl
```

### Input Fields
```css
Background: purple-950/50
Border: purple-500/30
Border-radius: 12px (rounded-xl)
Padding: 12px 16px (py-3 px-4)
Placeholder: purple-400
Focus ring: purple-500 (2px)
Transition: 300ms
```

### Button
```css
Background: gradient purple-600 to purple-500
Hover: gradient purple-500 to purple-400
Border-radius: 12px (rounded-xl)
Padding: 12px (py-3)
Shadow: purple-500/30 glow effect
Hover scale: 1.02
Active scale: 0.98
Transition: 300ms
```

### Loading State
- Spinning animation
- "Entering..." text
- Button disabled state dengan opacity 50%

## Animations

### Page Load Sequence
1. **Container** (0s): Fade in + slide up (y: 30 → 0)
2. **Title** (0.2s): Fade in
3. **Form** (0.3s): Fade in + scale (0.95 → 1)
4. **Back link** (0.5s): Fade in

### Background Orbs
- **Orb 1** (top-right):
  - Movement: x, y, scale
  - Duration: 8 seconds
  - Opacity: 0.3 → 0.5 → 0.3
  
- **Orb 2** (bottom-left):
  - Movement: opposite direction
  - Duration: 10 seconds
  - Delay: 1 second
  
- **Orb 3** (center-left):
  - Smaller, faster
  - Duration: 7 seconds
  - Delay: 2 seconds

### Interactive Elements
- **Button hover**: Scale 1.02, brighter gradient
- **Button tap**: Scale 0.98
- **Input focus**: Ring glow effect, border color change
- **Link hover**: Color transition from purple-300 to purple-200

## Responsive Behavior

### Mobile (default)
- Max width: 448px (max-w-md)
- Padding: 24px (p-6)
- Title: 36px (text-4xl)
- Form padding: 32px (p-8)

### Desktop (md:)
- Title: 48px (md:text-6xl) - hanya di landing page
- Semua proporsi tetap sama
- Centered dengan backdrop orbs yang lebih besar

## Accessibility

- Labels untuk semua input fields
- Required attributes pada form
- Focus states yang jelas
- Keyboard navigation support
- Loading state dengan disabled button
- Color contrast yang memadai (white on purple)

## Kenapa Tidak Norak?

❌ **Dihindari:**
- Warna neon yang mencolok
- Border yang tebal
- Shadow yang terlalu kuat
- Animasi yang terlalu cepat/bouncy
- Terlalu banyak gradient
- Efek glow yang berlebihan

✅ **Yang Digunakan:**
- Opacity rendah untuk softness
- Blur untuk depth
- Smooth transitions (300ms - 1s)
- Subtle shadows
- Glass morphism effect
- Slow, ambient animations
- Minimal elements
- Breathing space

## Design Philosophy

```
Simple > Complex
Subtle > Loud
Smooth > Snappy
Personal > Professional
Elegant > Fancy
```

---

Hasil akhir: Login page yang terasa premium, personal, dan menenangkan - seperti masuk ke ruang pribadi yang dibuat khusus untuk seseorang. 💜
