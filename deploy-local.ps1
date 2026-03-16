# Local Firebase deployment script (Windows PowerShell)
# This enables the webframeworks experiment and deploys

Write-Host "🔐 Authenticating with Firebase..." -ForegroundColor Cyan
firebase login

Write-Host "🔧 Enabling webframeworks experiment..." -ForegroundColor Cyan
firebase experiments:enable webframeworks --project tumbahub-prod

Write-Host "🚀 Deploying to Firebase Hosting..." -ForegroundColor Cyan
firebase deploy --project tumbahub-prod --only hosting

Write-Host "✅ Deployment complete!" -ForegroundColor Green
