# 🎁 Psychopomp - Personal Love App

A beautiful, interactive web application built with Next.js 14 and Supabase, featuring personalized experiences for loved ones.

## ✅ Build Status

**Last Build:** Success ✓  
**Vercel Ready:** Yes ✓  
**ESLint Errors:** 0  
**Build Warnings:** 60+ (non-critical)

---

## ✨ Features

### 🏠 Landing & Authentication
- Animated landing page with purple gradient theme
- Custom login system (username + birthday)
- Session management with localStorage
- Protected routes

### 📅 Diary - Calendar of Us
- Interactive calendar with event management
- 3 view modes: Timeline, Book, and Highlights
- Event types: Date, Gift, Special, Memory
- Photo attachments for events
- Audio recordings for special moments
- Music track associations
- Search functionality
- Beautiful animations with Framer Motion

### 🎵 Music Library
- Upload and manage music collection
- Search by title or artist
- Sort options: Date, Title, Artist, Duration, Size, Manual
- Drag-and-drop manual ordering
- Edit song metadata
- Audio playback with progress bar
- Custom notification modals
- Portal-based UI for proper z-index layering

### 📸 Photobooth
- 4 template options (Buzz Lightyear theme):
  - Single Photo (1 photo)
  - Stamp Template (2 photos)
  - Polaroid 1 (1 photo)
  - Polaroid 4 (4 photos vertical)
- Real-time camera feed
- Photo preview with thumbnails
- 12px rounded corners on all photos
- Download as JPEG with high quality
- Auto-save to Memories gallery

### 🖼️ Memories Gallery
- Grid layout with masonry effect
- Filter by date range
- View full-size images
- Download individual photos
- Animated loading states

### 🎁 Surprise Page
- Interactive flower animation (tap to grow)
- Love letter in envelope with open animation
- Personalized message reveal
- Beautiful particle effects
- Romantic music background

### 🧩 Puzzle Game
- Image-based jigsaw puzzle
- Drag-and-drop pieces
- Victory animation
- Random piece positioning

---

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage
- **Authentication:** Custom (Supabase RLS)
- **Animation:** Framer Motion
- **Icons:** Emoji-based

---

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Setup

1. **Clone repository:**
```bash
git clone <your-repo-url>
cd project
```

2. **Install dependencies:**
```bash
npm install
```

3. **Environment variables:**

Create `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

4. **Database setup:**

Run SQL migrations in `database/` folder (in order):
- `setup_storage.sql` - Setup storage buckets
- `create_diary_entries_table.sql` - Create diary table
- `setup_calendar_events.sql` - Create calendar events
- `setup_music_table.sql` - Create music table
- `add_manual_order_to_music.sql` - Add manual ordering
- Other fixes as needed

5. **Run development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
project/
├── app/                      # Next.js app directory
│   ├── page.tsx             # Landing page
│   ├── login/               # Login page
│   ├── home/                # Home page
│   ├── diary/               # Diary/Calendar feature
│   │   ├── CalendarOfUs.tsx
│   │   ├── tabs/            # Timeline, Book, Highlights
│   │   └── components/      # Event modals, pickers
│   ├── music/               # Music library
│   ├── camera/              # Camera features
│   │   ├── photobooth/      # Photobooth templates
│   │   └── puzzle/          # Puzzle game
│   ├── memories/            # Photo gallery
│   └── surprise/            # Surprise page
├── lib/
│   ├── auth/                # Authentication logic
│   └── supabase/            # Supabase client
├── database/                # SQL migrations
├── public/                  # Static assets
│   ├── buzz/                # Buzz Lightyear images
│   ├── body_box/            # Body box decorations
│   └── *.png                # Templates & assets
└── .env.local               # Environment variables (not in git)
```

---

## 🗄️ Database Schema

### Tables:
- **profiles** - User profiles (username, birthday, display_name)
- **diary_entries** - Calendar events with photos, audio, music
- **music** - Music library with metadata
- **diary_images** - Photo storage for memories

### Storage Buckets:
- **diary-images** - Event photos and memories
- **diary-audio** - Audio recordings
- **music** - Music files

---

## 🎨 Design Features

### Color Scheme:
- Purple gradients (primary)
- Blue accents
- White/transparent overlays
- Glass morphism effects

### Animations:
- Framer Motion for smooth transitions
- Hover effects on interactive elements
- Loading states with spinners
- Success/error notifications with Portal rendering

### Responsive:
- Mobile-first design
- Adaptive layouts
- Touch-friendly controls
- Works on all screen sizes

---

## 🔒 Security

- ✅ Environment variables for credentials
- ✅ Row Level Security (RLS) enabled
- ✅ `.env.local` in `.gitignore`
- ✅ No hardcoded secrets in code
- ✅ Public read with RLS policies
- ✅ Secure authentication flow

---

## 🚀 Deployment

### Vercel (Recommended):
1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy automatically

### Environment Variables in Vercel:
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

---

## 📝 Recent Updates

### Latest (2026-08-12):
- ✅ Enhanced music page notifications (custom modals)
- ✅ Added 12px border-radius to photobooth photos
- ✅ Portal rendering for z-index fixes
- ✅ Removed backup files from repository
- ✅ Security audit passed (no hardcoded secrets)

### Previous:
- Music library with drag-drop ordering
- Calendar search and filter
- Photobooth with 4 templates
- Surprise page with animations
- Memory gallery with date filter

---

## 🐛 Known Issues

None currently! 🎉

---

## 📄 License

Private project - Not for public use

---

## 👤 Author

Personal project for loved ones ❤️

---

## 🙏 Acknowledgments

- Next.js team for amazing framework
- Supabase for backend infrastructure
- Framer Motion for smooth animations
- Tailwind CSS for styling
