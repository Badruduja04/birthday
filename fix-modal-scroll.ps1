# PowerShell Script to Fix Modal Scroll Issue in CalendarOfUs.tsx

$file = "d:\flutter\project\app\diary\CalendarOfUs.tsx"
$content = Get-Content $file -Raw

# Fix 1: Add overflow-hidden to outer modal container
$content = $content -replace `
    'className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"', `
    'className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-hidden"'

# Fix 2: Add max-h and overflow-y-auto to inner modal container + fix animate
$content = $content -replace `
    'animate=\{\{ scale: 1, opacity: 1 \}\}(\s+)exit=\{\{ scale: 0\.9, opacity: 0 \}\}(\s+)transition=\{\{ type: ''spring'', stiffness: 300, damping: 30 \}\}(\s+)className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-2xl w-full border-2 border-white/20"', `
    'animate={{ opacity: 1 }}$1exit={{ scale: 0.9, opacity: 0 }}$2transition={{ type: ''spring'', stiffness: 300, damping: 30 }}$3className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-2xl w-full border-2 border-white/20 max-h-[90vh] overflow-y-auto"'

# Fix 3: Add inline style for scrollbar
$content = $content -replace `
    '(className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-2xl w-full border-2 border-white/20 max-h-\[90vh\] overflow-y-auto")(\s+)onClick=\{\(e\) => e\.stopPropagation\(\)\}', `
    '$1$2onClick={(e) => e.stopPropagation()}$2style={{ scrollbarWidth: ''thin'', scrollbarColor: ''rgba(236, 72, 153, 0.5) transparent'' }}'

# Save the fixed content
Set-Content $file -Value $content -NoNewline

Write-Host "✅ Modal scroll fix applied to CalendarOfUs.tsx" -ForegroundColor Green
Write-Host "Changes:" -ForegroundColor Yellow
Write-Host "  - Added 'overflow-hidden' to outer modal container" -ForegroundColor Cyan
Write-Host "  - Added 'max-h-[90vh] overflow-y-auto' to inner modal" -ForegroundColor Cyan
Write-Host "  - Added custom scrollbar styling" -ForegroundColor Cyan
Write-Host "  - Fixed animate prop to prevent re-render issues" -ForegroundColor Cyan
