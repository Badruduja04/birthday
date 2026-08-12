# Photo Booth Setup Guide

## ✅ What's Done

I've completely rewritten the photo booth page with the following features:

### 1. **Template Selection Screen**
   - 4 Toy Story themed templates:
     - Solo Shot (1 photo)
     - Duo Frame (2 photos)
     - Triple Play (3 photos)
     - Quad Squad (4 photos)
   - Beautiful card-based UI with hover animations

### 2. **Multi-Capture Flow**
   - Users take multiple photos based on template slots
   - Progress indicator shows which photo is being captured
   - Thumbnails of captured photos shown below camera
   - Countdown animation (3-2-1) before each capture

### 3. **Toy Story Template Rendering**
   - Yellow checkered background (iconic Toy Story style)
   - White border frame around entire image
   - "TOY STORY MEMORIES" title at top
   - Photos arranged based on template (1/2/3/4 layout)
   - White borders around each photo
   - Black dashed borders for authenticity
   - Date stamp at bottom

### 4. **Auto-Save to Gallery**
   - NO manual "Save" button
   - After all slots filled → auto-composite → auto-save → auto-redirect
   - Saves to Supabase Storage + memories table
   - Shows saving animation with spinner
   - Shows success checkmark before redirect
   - Redirects to `/memories` gallery after 2 seconds

### 5. **Clean UI**
   - Only "Retake" and "Change Template" buttons
   - NO Download button in photo booth
   - Download will be available in gallery page
   - Error handling with helpful messages

## 🔧 What You Need to Do

### **STEP 1: Fix BOTH Storage AND Database RLS Policies (CRITICAL)**

The error happens because:
1. ✅ Storage upload works (you see "Upload success")
2. ❌ Database insert fails with 401 error (memories table needs RLS policies)

**Run this SQL in your Supabase SQL Editor:**

1. Go to your Supabase dashboard
2. Click "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the contents of `database/fix_complete_rls.sql`
5. Click "Run" button

This will fix BOTH:
- ✅ Storage bucket policies (INSERT/SELECT/UPDATE/DELETE)
- ✅ Memories table policies (INSERT/SELECT/UPDATE/DELETE)

### **STEP 2: Test the Photo Booth**

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Login to your app

3. Go to Camera → Photo Booth

4. **Test flow:**
   - Select a template (try "Triple Play" with 3 photos)
   - Take photo 1 (countdown 3-2-1)
   - Take photo 2 (countdown 3-2-1)
   - Take photo 3 (countdown 3-2-1)
   - ✅ Should auto-composite with Toy Story border
   - ✅ Should auto-save to gallery
   - ✅ Should redirect to `/memories` page

5. Check your gallery to see the saved photo with Toy Story template

### **STEP 3: Verify in Supabase**

After taking a photo, verify:

1. **Storage Bucket**
   - Go to Supabase dashboard → Storage → `memories` bucket
   - Should see your uploaded file: `{user_id}/{timestamp}.jpg`

2. **Memories Table**
   - Go to Table Editor → `memories` table
   - Should see a new row with:
     - `user_id`: your user ID
     - `title`: "Triple Play Photo Booth" (or template name)
     - `image_url`: public URL to the image
     - `memory_date`: today's date

## 📝 Technical Details

### File Structure
- `app/camera/photobooth/page.tsx` - Complete rewrite with templates + small toast notification
- `database/fix_complete_rls.sql` - SQL to fix BOTH storage + database RLS policies
- `PHOTOBOOTH_SETUP.md` - This guide

### Flow Diagram
```
Select Template → Start Camera → Capture Photo 1 → Capture Photo 2 → ... 
→ All Slots Filled → Generate Composite → Auto-Save → Success → Redirect
```

### Template Layout Logic
- **1 slot**: Single centered photo
- **2 slots**: Two vertical photos side-by-side
- **3 slots**: Three vertical photos in a row
- **4 slots**: 2×2 grid layout

### Canvas Composition
1. Yellow checkered background (40px squares)
2. White border frame (60px)
3. Title text at top
4. Photos with white borders + black dashed outlines
5. Date stamp at bottom
6. Export as JPEG (95% quality)

## 🚨 Troubleshooting

### Error: "new row violates row-level security policy" OR 401 Database Error
**Solution**: Run the SQL fix in `database/fix_complete_rls.sql` - this fixes BOTH storage AND memories table policies

### Error: "Failed to access camera"
**Solution**: 
- Check browser permissions (allow camera access)
- Use HTTPS or localhost (camera requires secure context)

### Photos not showing in gallery
**Solution**:
- Check Supabase Storage bucket is public
- Verify `memories` table has the record
- Check console for errors

### Composite image looks wrong
**Solution**:
- Check canvas rendering code in `generateComposite()`
- Verify photos are loading (check `img.onload`)
- Check browser console for canvas errors

## 🎨 Customization

Want to change the template design?

Edit the `generateComposite()` function in `page.tsx`:

```typescript
// Change background colors
ctx.fillStyle = isEven ? '#FFD700' : '#FFA500'  // Yellow checkered

// Change border width
const borderWidth = 60

// Change title
ctx.fillText('TOY STORY MEMORIES', width / 2, 100)
```

## ✨ Next Steps

After fixing RLS and testing:

1. ✅ Photo booth with templates - DONE
2. ⏭️ Update gallery page to show download button
3. ⏭️ Add image lightbox in gallery
4. ⏭️ Add puzzle game feature

## 📞 Need Help?

If you encounter issues:
1. Check browser console for errors
2. Check Supabase logs in dashboard
3. Verify RLS policies are applied
4. Test with different templates
