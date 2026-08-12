# 🏠 Home Page / Dashboard Documentation

## Overview

Halaman Home adalah dashboard utama setelah user login. Menampilkan menu navigasi ke berbagai fitur dengan tema Buzz Lightyear.

---

## 🎨 Design Concept

### Theme
- **Buzz Lightyear colors**: Hijau, Ungu, dengan accent warna lainnya
- **Personal greeting**: "Good morning, [Name]! 💚"
- **Tagline**: "A little place made for you"
- **Interactive cards**: Setiap menu dengan warna berbeda

### Layout
```
┌──────────────────────────────────────┐
│  ●●●● (animated buttons)      ✨✨✨ │
│                                      │
│          [Buzz Image]                │
│       Good morning, Name! 💚         │
│   A little place made for you        │
│                                      │
│  ┌─────┐  ┌─────┐  ┌─────┐         │
│  │ 📸  │  │ 📔  │  │ 🎵  │         │
│  │Memo │  │Diary│  │Music│         │
│  └─────┘  └─────┘  └─────┘         │
│                                      │
│  ┌─────┐  ┌─────┐  ┌─────┐         │
│  │ 🧩  │  │ 📷  │  │ 🎁  │         │
│  │Puzz │  │Cam  │  │Surp │         │
│  └─────┘  └─────┘  └─────┘         │
│                                      │
│          [Logout]                    │
└──────────────────────────────────────┘
```

---

## 📋 Menu Items

### 1. **Memories** 📸
- **Color**: Green gradient (Buzz primary color)
- **Description**: "Photo gallery"
- **Route**: `/memories`
- **Purpose**: Photo collection & memories

### 2. **Diary** 📔
- **Color**: Purple gradient (Buzz accent color)
- **Description**: "Your thoughts"
- **Route**: `/diary`
- **Purpose**: Personal diary entries

### 3. **Music** 🎵
- **Color**: Blue gradient
- **Description**: "Your playlist"
- **Route**: `/music`
- **Purpose**: Music player & playlists

### 4. **Puzzle** 🧩
- **Color**: Yellow gradient
- **Description**: "Fun games"
- **Route**: `/puzzle`
- **Purpose**: Interactive puzzle games

### 5. **Camera** 📷
- **Color**: Pink gradient
- **Description**: "Take photos"
- **Route**: `/camera`
- **Purpose**: Photo booth & camera features

### 6. **Surprise** 🎁
- **Color**: Red gradient
- **Description**: "Something special"
- **Route**: `/surprise`
- **Purpose**: Easter eggs & surprises

---

## 🎭 Animations

### Header Animations
```javascript
// Buzz floating
y: [0, -15, 0]
duration: 4s, infinite

// Buttons around Buzz
scale: [1, 1.3, 1]
opacity: [0.7, 1, 0.7]
duration: 1.5s, staggered delays
```

### Card Animations
```javascript
// Entry animation
initial: { opacity: 0, scale: 0.8 }
animate: { opacity: 1, scale: 1 }
delay: 0.8 + index * 0.1

// Hover effects
whileHover: { scale: 1.05, y: -5 }
whileTap: { scale: 0.95 }
```

### Background Elements
```javascript
// Orbs floating
duration: 8-10s, infinite
movement: x & y axis

// Stars twinkling
25 stars total
random positions
opacity & scale pulse
```

---

## 🎨 Color Mapping

### Menu Colors
```javascript
memories: 'from-buzz-green to-buzz-green-dark'     // #8BC34A → #689F38
diary:    'from-buzz-purple to-buzz-purple-dark'   // #7E57C2 → #5E35B1
music:    'from-blue-500 to-blue-700'              // Blue
puzzle:   'from-yellow-400 to-yellow-600'          // Yellow
camera:   'from-pink-500 to-pink-700'              // Pink
surprise: 'from-buzz-red to-red-600'               // #E53935 → Red
```

---

## 📱 Responsive Design

### Mobile (default)
```css
grid-cols-2          /* 2 columns */
gap-4                /* 1rem gap */
p-6 md:p-8           /* Padding */
text-5xl md:text-6xl /* Icon size */
```

### Desktop (md:)
```css
grid-cols-3          /* 3 columns */
gap-6                /* 1.5rem gap */
```

---

## 🔧 Interactive Features

### Hover State
- **Scale up**: 1.05
- **Move up**: -5px
- **Border color**: Changes to buzz-green
- **Background**: Gradient overlay appears (10% opacity)
- **Glow effect**: Green border glow
- **Icon animation**: Wiggle effect (rotate -10° → 10°)

### Click/Tap
- **Scale down**: 0.95 (feedback)
- **Navigate**: To respective page

---

## 🎯 User Flow

```
Login Page
    ↓
  Enter username + birthday
    ↓
 [ENTER MY WORLD 🎁]
    ↓
  Home/Dashboard
    ↓
┌───────────────────────┐
│  Click menu card      │
│    ↓                  │
│  Navigate to feature  │
│    ↓                  │
│  [Coming soon page]   │
│    ↓                  │
│  ← Back to Home       │
└───────────────────────┘
```

---

## 🚀 Features Status

### Current Status
- ✅ Home page layout
- ✅ Menu navigation cards
- ✅ Animations (floating, hover, entrance)
- ✅ Buzz Lightyear theme integration
- ✅ Responsive design
- ✅ Placeholder pages untuk semua menu

### Next Steps
1. **Implement Supabase Auth**
   - Real login dengan username + birthday
   - Session management
   - Protected routes

2. **User Profile Loading**
   - Load display_name from profiles table
   - Show avatar (optional)
   - Birthday information

3. **Implement Features**
   - Memories gallery
   - Diary entries
   - Music player
   - Camera/Photo booth
   - Puzzle games
   - Surprise content

---

## 🎁 Personal Touch Elements

### Greeting
```javascript
// Dynamic greeting based on time
Good morning,  // 00:00 - 11:59
Good afternoon, // 12:00 - 17:59
Good evening,   // 18:00 - 23:59
```

### Customization
- User's display_name from database
- Birthday countdown (future feature)
- Personalized messages
- Custom avatars

---

## 🔒 Security Notes

### Authentication
- Login required to access `/home`
- Protected routes (implement middleware)
- Session validation
- Automatic redirect to login if not authenticated

### Data Privacy
- User-specific content only
- RLS policies on Supabase
- No data sharing between users

---

## 🎨 Theme Consistency

### Buzz Lightyear Elements
- ✅ Character image (floating animation)
- ✅ Manik-manik buttons (4 corners, animated)
- ✅ Green & Purple color scheme
- ✅ Space/star background
- ✅ Glow effects
- ✅ Smooth animations

### Birthday Theme Integration
- "Good morning, [Name]!" - Personal greeting
- "A little place made for you" - Gift feeling
- 🎁 Surprise section
- Warm, welcoming atmosphere
- Not space mission, but birthday celebration

---

## 📊 Performance

### Optimization
- Framer Motion for GPU-accelerated animations
- CSS transforms (not position changes)
- Lazy loading for images (future)
- Minimal re-renders
- Efficient state management

### Load Time
- Initial page load: Fast
- Animation smooth: 60fps target
- Navigation instant: Client-side routing

---

## 🎮 User Experience

### Feel
- **Welcoming**: Personal greeting
- **Interactive**: Hover effects & animations
- **Playful**: Buzz theme & icons
- **Organized**: Clear menu structure
- **Responsive**: Works on all devices

### Navigation
- **Clear**: Icon + title + description
- **Intuitive**: Standard card layout
- **Feedback**: Visual response on interaction
- **Consistent**: Same pattern throughout

---

## 🔮 Future Enhancements

Possible additions:
- [ ] Quick actions (recent memories, latest diary)
- [ ] Notification badges (new content)
- [ ] User stats (total memories, diary entries)
- [ ] Daily quote/message
- [ ] Weather widget
- [ ] Birthday countdown
- [ ] Quick search
- [ ] Recent activity timeline
- [ ] Profile settings shortcut
- [ ] Theme customization

---

Made with 💚 following Psychopomp PROJECT_PLAN.md
