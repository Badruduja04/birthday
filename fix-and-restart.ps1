# Emergency Fix Script
# Run this to clear all caches and restart

Write-Host "🔧 Starting emergency fix..." -ForegroundColor Cyan

# Stop any running processes (optional)
Write-Host "1. Clearing Next.js cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next
    Write-Host "   ✅ .next folder deleted" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  .next folder not found" -ForegroundColor Gray
}

if (Test-Path "node_modules/.cache") {
    Remove-Item -Recurse -Force "node_modules/.cache"
    Write-Host "   ✅ node_modules cache deleted" -ForegroundColor Green
}

Write-Host ""
Write-Host "2. Next steps:" -ForegroundColor Yellow
Write-Host "   ⚠️  IMPORTANT: Clear browser cache manually!" -ForegroundColor Red
Write-Host "   → Press F12 → Application → Local Storage → Clear" -ForegroundColor White
Write-Host "   → Or run in Console: localStorage.clear(); sessionStorage.clear(); location.reload(true);" -ForegroundColor White
Write-Host ""
Write-Host "3. Starting development server..." -ForegroundColor Yellow

# Start dev server
npm run dev
