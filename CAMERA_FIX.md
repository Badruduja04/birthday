# Camera Fix - Debug Version

## Changes Made

### 1. Template Transparency Fixed ✅
- Changed from 0.2 (20% opacity) to **0.7 (70% opacity)**
- Character boxes now much more visible
- Emoji text color changed to white for better contrast

### 2. Camera Freeze Debug Added ✅
- Added console.log to track camera state
- Added video.play() restart if paused
- Optimized canvas redrawing (only resize if needed)
- Proper cleanup of animation frames

### 3. Console Logs to Watch

Open browser console (F12) and look for:

```
Taking photo, video ready: 4, paused: false
Photo 1 captured, total slots: 3
Moving to slot 2, camera stays on
```

If you see:
```
Video was paused, restarting...
```
Then we know the video is pausing and we're trying to restart it.

## Testing Steps

1. **Clear browser cache** (Ctrl + Shift + Delete)
2. **Refresh page** (Ctrl + F5)
3. Open **Developer Console** (F12)
4. Go to Camera → Photo Booth
5. Select template with 3 photos
6. **Watch console for logs**
7. Take photo 1
8. Check if video still shows (should stay on)
9. Check console logs
10. Take photo 2

## Expected Console Output

```
Taking photo, video ready: 4, paused: false
Photo 1 captured, total slots: 3
Moving to slot 2, camera stays on
```

(video should still be showing)

```
Taking photo, video ready: 4, paused: false
Photo 2 captured, total slots: 3
Moving to slot 3, camera stays on
```

(video should still be showing)

```
Taking photo, video ready: 4, paused: false
Photo 3 captured, total slots: 3
All slots filled, stopping camera
Uploading to Supabase Storage...
```

## If Camera Still Goes Black

Kemungkinan penyebab:
1. **Video element ter-hide** - Check dengan inspect element
2. **Stream ter-stop** - Check di console error
3. **Canvas overlay menutupi** - Check z-index
4. **Browser permission** - Re-allow camera access

## Template Visibility Now

Before: `rgba(126, 87, 194, 0.2)` = 20% opacity (terlalu transparan)
After: `rgba(126, 87, 194, 0.7)` = 70% opacity (lebih visible)

Character boxes sekarang:
- ✅ Purple box (Buzz) - 70% opacity
- ✅ Green box (Rex) - 70% opacity  
- ✅ Yellow box (Woody) - 70% opacity
- ✅ Pink box (Hamm) - 70% opacity
- ✅ White emoji text untuk kontras lebih baik

## Next Steps

1. Test with console open
2. Share console logs kalau masih error
3. Kalau masih black, screenshot console logs
4. Kita bisa adjust lebih lanjut berdasarkan logs
