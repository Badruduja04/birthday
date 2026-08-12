# Psychopomp --- Birthday Memory Website

> Interactive birthday / memory website built with Next.js, Supabase,
> and Vercel.

## 1. Project Overview

**Project name:** Psychopomp\
**Project type:** Personal interactive birthday / memory website\
**Primary target:** Mobile users, especially iPhone/Safari users\
**Deployment target:** Vercel\
**Backend:** Supabase\
**Database:** PostgreSQL via Supabase\
**Frontend:** Next.js + React + TypeScript\
**Styling:** Tailwind CSS\
**Animation:** Framer Motion\
**PWA:** Planned

The website is intended to feel like a small personal digital world
rather than a normal dashboard.

The user logs in and enters a private space containing:

-   Memories / photos
-   Diary
-   Music
-   Camera
-   Photo booth
-   Puzzle
-   Birthday messages
-   Surprise / Easter eggs
-   Other small interactive features

The project should be developed gradually. Do not implement all features
at once.

------------------------------------------------------------------------

# 2. Technology Stack

## Frontend

-   Next.js
-   React
-   TypeScript
-   Tailwind CSS
-   Framer Motion

## Backend / Cloud

-   Supabase
    -   Authentication
    -   PostgreSQL database
    -   Storage
    -   Row Level Security (RLS)

## Deployment

-   GitHub
-   Vercel

## Development

-   VS Code
-   Node.js LTS
-   npm
-   Git

------------------------------------------------------------------------

# 3. Current Supabase Project

A Supabase project has already been created.

**Supabase project name:** `Psychopomp`

The current database already contains these tables:

1.  `profiles`
2.  `memories`
3.  `diary_entries`
4.  `songs`

The database diagram currently connects these tables through `user_id`
to `profiles.id`, while `profiles.id` is connected to `auth.users.id`.

Do not recreate these tables automatically without checking the current
schema first.

------------------------------------------------------------------------

# 4. Current Database Structure

## 4.1 profiles

Purpose: Store user profile information.

Expected columns:

  Column           Type          Purpose
  ---------------- ------------- ------------------------------------
  `id`             uuid          User ID, linked to `auth.users.id`
  `username`       text          Unique username
  `display_name`   text          Name displayed in the website
  `avatar_url`     text          Profile image URL
  `birthday`       date          Birthday
  `created_at`     timestamptz   Creation timestamp

Relationship:

``` text
auth.users.id
      │
      │ 1 : 1
      ▼
profiles.id
```

------------------------------------------------------------------------

## 4.2 memories

Purpose: Store memories and photos.

Expected columns:

  Column          Type          Purpose
  --------------- ------------- --------------------
  `id`            uuid          Memory ID
  `user_id`       uuid          Owner
  `title`         text          Memory title
  `description`   text          Memory description
  `image_url`     text          Image/storage URL
  `memory_date`   date          Date of the memory
  `created_at`    timestamptz   Creation timestamp

Relationship:

``` text
profiles
   │
   └── memories
```

------------------------------------------------------------------------

## 4.3 diary_entries

Purpose: Store diary entries.

Expected columns:

  Column         Type          Purpose
  -------------- ------------- --------------------
  `id`           uuid          Diary entry ID
  `user_id`      uuid          Owner
  `title`        text          Diary title
  `content`      text          Diary content
  `image_url`    text          Optional image
  `created_at`   timestamptz   Creation timestamp
  `updated_at`   timestamptz   Last update

Relationship:

``` text
profiles
   │
   └── diary_entries
```

------------------------------------------------------------------------

## 4.4 songs

Purpose: Store music metadata.

Expected columns:

  Column         Type          Purpose
  -------------- ------------- --------------------
  `id`           uuid          Song ID
  `user_id`      uuid          Owner
  `title`        text          Song title
  `artist`       text          Artist
  `audio_url`    text          Audio file URL
  `cover_url`    text          Cover image URL
  `duration`     int4          Duration
  `created_at`   timestamptz   Creation timestamp

The actual audio files should be stored in **Supabase Storage**, not
directly inside PostgreSQL.

------------------------------------------------------------------------

# 5. Future Database Tables

These are planned but should NOT be created until the related feature is
actually needed.

## birthday_messages

For birthday letters and locked messages.

Possible structure:

``` text
id
user_id
title
content
is_locked
unlock_at
created_at
```

Example:

``` text
"Open this on your birthday 🎁"
```

------------------------------------------------------------------------

## puzzles

For photo-based puzzles.

Possible structure:

``` text
id
user_id
title
image_url
difficulty
created_at
```

------------------------------------------------------------------------

## playlists

Optional.

Only create this if the music feature needs multiple playlists.

Possible structure:

``` text
id
user_id
name
description
cover_url
created_at
```

If one song can belong to multiple playlists, a junction table such as
`playlist_songs` will also be needed.

------------------------------------------------------------------------

# 6. Supabase Storage

Files should be stored in Supabase Storage.

Planned buckets/folders:

``` text
memories/
diary/
music/
covers/
puzzles/
avatars/
```

Example:

``` text
music/
  golden-brown.mp3

covers/
  golden-brown.jpg

memories/
  memory-001.jpg
```

The database stores the file URL/path, while Storage stores the actual
file.

------------------------------------------------------------------------

# 7. Application Concept

The website should feel like:

> "A small digital world made for someone."

It should NOT look like an administration dashboard.

The main experience should be visual, emotional, interactive, and
personal.

Possible opening:

``` text
Welcome.

I made a little something
for you.

        [ ENTER ]
```

After entering:

``` text
Good morning, [Name] ♡

"A little place made for you."

   📸 Memories
   📔 Diary
   🎵 Music
   🧩 Puzzle
   🎁 Surprise
```

------------------------------------------------------------------------

# 8. Main Application Flow

``` text
Landing Page
     │
     ▼
Login
     │
     ▼
Welcome / Intro
     │
     ▼
Home
     │
     ├── Memories
     │
     ├── Diary
     │
     ├── Music
     │
     ├── Camera
     │
     ├── Photo Booth
     │
     ├── Puzzle
     │
     ├── Birthday Letter
     │
     └── Surprise / Easter Eggs
```

------------------------------------------------------------------------

# 9. Planned Routes

Initial routes:

``` text
/
 /login
 /welcome
 /home
 /memories
 /memories/[id]
 /diary
 /diary/new
 /diary/[id]
 /music
 /camera
 /photobooth
 /puzzle
 /puzzle/[id]
 /letter
 /surprise
```

Routes can be changed as development progresses.

------------------------------------------------------------------------

# 10. Feature Roadmap

## Phase 1 --- Foundation

Goal: Get the website running.

-   [ ] Create Next.js project
-   [ ] Configure TypeScript
-   [ ] Configure Tailwind CSS
-   [ ] Install Framer Motion
-   [ ] Configure Git
-   [ ] Create GitHub repository
-   [ ] Connect project to Supabase
-   [ ] Configure environment variables
-   [ ] Test Supabase connection

------------------------------------------------------------------------

## Phase 2 --- Authentication

Goal: User can securely enter the website.

-   [ ] Login page
-   [ ] Supabase Auth
-   [ ] Session handling
-   [ ] Protected routes
-   [ ] Logout
-   [ ] Profile loading
-   [ ] RLS policies

------------------------------------------------------------------------

## Phase 3 --- Home

Goal: Create the main personal experience.

-   [ ] Welcome screen
-   [ ] Home page
-   [ ] User display name
-   [ ] Birthday information
-   [ ] Navigation cards
-   [ ] Background animation
-   [ ] Responsive mobile layout

------------------------------------------------------------------------

## Phase 4 --- Memories

-   [ ] Memory gallery
-   [ ] Memory detail
-   [ ] Image upload
-   [ ] Supabase Storage
-   [ ] Memory date
-   [ ] Memory description
-   [ ] Lightbox / image viewer

------------------------------------------------------------------------

## Phase 5 --- Diary

-   [ ] Diary list
-   [ ] Diary detail
-   [ ] Create diary
-   [ ] Edit diary
-   [ ] Delete diary
-   [ ] Optional image
-   [ ] Timeline design

------------------------------------------------------------------------

## Phase 6 --- Music

-   [ ] Music list
-   [ ] Audio player
-   [ ] Play / pause
-   [ ] Previous / next
-   [ ] Progress bar
-   [ ] Volume
-   [ ] Cover image
-   [ ] Background/global player
-   [ ] Supabase Storage integration

------------------------------------------------------------------------

## Phase 7 --- Camera & Photo Booth

-   [ ] Camera permission
-   [ ] Camera preview
-   [ ] Capture photo
-   [ ] Countdown
-   [ ] Frame
-   [ ] Sticker
-   [ ] Text
-   [ ] Save photo
-   [ ] Upload to Storage

Important: camera functionality must be tested on HTTPS/mobile browsers.

------------------------------------------------------------------------

## Phase 8 --- Puzzle

-   [ ] Select image
-   [ ] Generate puzzle pieces
-   [ ] Shuffle
-   [ ] Drag/tap interaction
-   [ ] Completion detection
-   [ ] Completion animation
-   [ ] Birthday message after solving

------------------------------------------------------------------------

## Phase 9 --- Birthday Letter

-   [ ] Letter page
-   [ ] Opening animation
-   [ ] Typing/reveal animation
-   [ ] Optional locked state
-   [ ] Unlock date
-   [ ] Music integration
-   [ ] Confetti animation

------------------------------------------------------------------------

## Phase 10 --- Easter Eggs

Possible ideas:

-   "Do not click this"
-   Random compliments
-   Hidden messages
-   Secret button
-   Mini game
-   Click counter
-   Secret room
-   Surprise animation

These should be added only after the main features are stable.

------------------------------------------------------------------------

# 11. PWA

The website should eventually support PWA.

Goal:

``` text
iPhone Safari
      │
      ▼
Add to Home Screen
      │
      ▼
Psychopomp icon
      │
      ▼
Website opens like an app
```

PWA is planned after the core website works.

------------------------------------------------------------------------

# 12. Responsive Design

Primary priority:

1.  iPhone/mobile
2.  Android/mobile
3.  Desktop

The UI should be designed mobile-first.

Test at least:

``` text
Mobile portrait
Mobile landscape
Tablet
Desktop
```

Avoid designing only for desktop and shrinking it afterward.

------------------------------------------------------------------------

# 13. Environment Variables

Create:

``` text
.env.local
```

Expected variables:

``` env
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Never commit `.env.local` to GitHub.

Do NOT put:

-   Supabase service role key
-   private API keys
-   passwords
-   secret tokens

into client-side code.

------------------------------------------------------------------------

# 14. Recommended Next.js Project Structure

``` text
psychopomp/
│
├── app/
│   ├── login/
│   ├── welcome/
│   ├── home/
│   ├── memories/
│   ├── diary/
│   ├── music/
│   ├── camera/
│   ├── photobooth/
│   ├── puzzle/
│   ├── letter/
│   └── surprise/
│
├── components/
│   ├── ui/
│   ├── navigation/
│   ├── music-player/
│   ├── memory/
│   ├── diary/
│   ├── camera/
│   ├── photobooth/
│   ├── puzzle/
│   └── animations/
│
├── lib/
│   ├── supabase/
│   ├── auth/
│   └── utils/
│
├── types/
│
├── public/
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── database/
│   ├── schema.sql
│   ├── policies.sql
│   └── seed.sql
│
├── .env.local
├── .gitignore
├── package.json
└── README.md
```

------------------------------------------------------------------------

# 15. Initial Dependencies

Do not install every possible package immediately.

Start with:

``` bash
npm install @supabase/supabase-js
npm install framer-motion
```

Additional packages should only be added when a feature requires them.

For example, camera/photo functionality may require a browser API or a
specific package after we decide exactly how the photo booth will work.

------------------------------------------------------------------------

# 16. Development Rules

## Rule 1 --- Build feature by feature

Do not implement:

``` text
Login + Music + Camera + Puzzle + Diary
```

at the same time.

Recommended order:

``` text
Project
  ↓
Supabase connection
  ↓
Login
  ↓
Home
  ↓
Memories
  ↓
Diary
  ↓
Music
  ↓
Camera
  ↓
Photo Booth
  ↓
Puzzle
  ↓
Letter
  ↓
Easter Eggs
  ↓
PWA
  ↓
Vercel
```

## Rule 2 --- Test after every major feature

After implementing a feature:

``` text
Code
 ↓
Run
 ↓
Test
 ↓
Fix
 ↓
Commit
```

## Rule 3 --- Do not expose secrets

Never put sensitive keys in:

``` text
GitHub
Frontend code
README
Screenshots
Public files
```

## Rule 4 --- Use Supabase RLS

User-specific data should be protected by Row Level Security.

For example:

``` text
User A
  ↓
Only User A's memories

User B
  ↓
Only User B's memories
```

------------------------------------------------------------------------

# 17. Initial Git Workflow

After creating the project:

``` bash
git init
git add .
git commit -m "Initial Next.js project"
```

Then create a GitHub repository and connect it:

``` bash
git remote add origin YOUR_GITHUB_REPOSITORY
git branch -M main
git push -u origin main
```

------------------------------------------------------------------------

# 18. Local Development

Start the development server:

``` bash
npm run dev
```

Then open:

``` text
http://localhost:3000
```

The website should first show a simple landing page.

Do not start with the full dashboard.

------------------------------------------------------------------------

# 19. First Milestone

The first milestone is intentionally small.

### Milestone 1

``` text
Next.js
   │
   ├── Landing page
   │
   ├── Login
   │
   └── Home
          │
          └── User name from Supabase
```

Success criteria:

-   Project runs on localhost
-   Supabase connection works
-   User can log in
-   User session is maintained
-   Home page can read the user's profile
-   Logout works

Only after this milestone is stable should Memories and Diary be
implemented.

------------------------------------------------------------------------

# 20. Important Decisions

Current decisions:

-   [x] Website instead of native mobile app
-   [x] Next.js
-   [x] TypeScript
-   [x] Supabase
-   [x] PostgreSQL
-   [x] Vercel
-   [x] GitHub
-   [x] Mobile-first
-   [ ] PWA
-   [ ] Camera
-   [ ] Photo Booth
-   [ ] Puzzle
-   [ ] Music
-   [ ] Diary
-   [ ] Birthday Letter
-   [ ] Easter Eggs

------------------------------------------------------------------------

# 21. Current Database Status

At the time this document was created:

``` text
Supabase Project
Name: Psychopomp
Status: Healthy

Existing tables:
✓ profiles
✓ memories
✓ diary_entries
✓ songs

Planned:
○ birthday_messages
○ puzzles
○ playlists
```

The planned tables should only be added when their features are ready.

------------------------------------------------------------------------

# 22. Immediate Next Steps

Do these in order:

### Step 1

Check Node.js:

``` bash
node --version
npm --version
```

### Step 2

Create the Next.js project in the D: drive if C: storage is limited.

Example:

``` bash
D:
cd D:\Projects
npx create-next-app@latest psychopomp
```

Recommended answers:

``` text
TypeScript: Yes
ESLint: Yes
Tailwind CSS: Yes
src/: Yes or No — keep one convention consistently
App Router: Yes
Turbopack: Yes
Import alias: Yes
```

### Step 3

Enter the project:

``` bash
cd D:\Projects\psychopomp
```

### Step 4

Install Supabase:

``` bash
npm install @supabase/supabase-js
```

### Step 5

Install animation:

``` bash
npm install framer-motion
```

### Step 6

Create:

``` text
.env.local
```

### Step 7

Connect Supabase.

### Step 8

Run:

``` bash
npm run dev
```

### Step 9

Confirm the blank/default Next.js site works.

### Step 10

Only then start implementing the Psychopomp UI.

------------------------------------------------------------------------

# 23. Project Philosophy

Psychopomp should not feel like:

> "Another CRUD application."

It should feel like:

> "A small world someone made especially for me."

Prioritize:

1.  Emotional experience
2.  Visual design
3.  Smooth interactions
4.  Mobile usability
5.  Privacy
6.  Reliability
7.  Performance
8.  Features

A simple feature that feels special is better than ten unfinished
features.

------------------------------------------------------------------------

# 24. Future Ideas

Possible future additions:

-   Interactive room
-   Polaroid wall
-   Animated envelope
-   Memory timeline
-   Secret codes
-   Birthday countdown
-   Virtual gift
-   Random compliment generator
-   Mini games
-   Hidden buttons
-   Custom cursor for desktop
-   Ambient background music
-   Sound effects
-   Confetti
-   Fireworks
-   Interactive stars
-   "Do not click" Easter egg
-   Secret photo gallery
-   Memory map
-   Mood diary
-   Love/compliment counter
-   Daily message
-   Countdown to birthday

These ideas are intentionally not part of the first milestone.

------------------------------------------------------------------------

# 25. Definition of Done

The project is considered ready for its first public release when:

-   [ ] Authentication works
-   [ ] Home page works
-   [ ] Memories work
-   [ ] Diary works
-   [ ] Music works
-   [ ] Mobile layout is polished
-   [ ] Supabase RLS is configured
-   [ ] Storage permissions are configured
-   [ ] No secrets are exposed
-   [ ] Error/loading states exist
-   [ ] Website works on iPhone Safari
-   [ ] Website works on Android Chrome
-   [ ] PWA is configured
-   [ ] Vercel deployment works
-   [ ] Production environment variables are configured

------------------------------------------------------------------------

# End

This document is the initial project blueprint for **Psychopomp**.

The implementation should proceed incrementally. Database schema,
routes, components, and features may be revised as the project becomes
more concrete.
