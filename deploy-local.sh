#!/bin/bash
# Local Firebase deployment script
# This enables the webframeworks experiment and deploys

echo "🔐 Authenticating with Firebase..."
firebase login

echo "🔧 Enabling webframeworks experiment..."
firebase experiments:enable webframeworks --project tumbahub-prod

echo "🚀 Deploying to Firebase Hosting..."
firebase deploy --project tumbahub-prod --only hosting

echo "✅ Deployment complete!"
