# TumbaHub Deployment Guide

## Quick Start

**Recommended: Use GitHub Actions (automatic)**
- Push to `main` branch
- Deployment runs automatically
- App live at: **https://tumbahub-prod.web.app**

**Monitor:** https://github.com/Adiy2003/TumbaHub/actions

---

## GitHub Actions Deployment (Recommended)

The production app deploys automatically via GitHub Actions when you push to `main`.

### Prerequisites:
- ✅ Service account key in GitHub secrets (`PROD_FIREBASE_SERVICE_ACCOUNT_KEY`)
- ✅ All production secrets configured in GitHub
- ✅ IAM roles granted to service account
- ✅ Web app linked to Hosting site in Firebase Console

### Workflow:
1. **Push to main** → GitHub Actions triggered
2. **Build** → Next.js compilation
3. **Deploy** → Firebase Hosting update
4. **Live** → Available at https://tumbahub-prod.web.app

### Monitor Deployment:
```
https://github.com/Adiy2003/TumbaHub/actions
```

---

## Local Testing Deployment

**Only for local testing/debugging** - use GitHub Actions for production.

### Prerequisites:
1. Firebase CLI: `npm install -g firebase-tools@12.9.1`
2. Firebase login: `firebase login`

### Deploy (Windows PowerShell):
```powershell
.\deploy-local.ps1
```

### Deploy (Mac/Linux):
```bash
bash deploy-local.sh
```

### Manual Deploy:
```bash
firebase experiments:enable webframeworks --project tumbahub-prod
npm run build
firebase deploy --project tumbahub-prod --only hosting
```

---

## Environment Setup
   - **Firestore Database** → Create in production mode, region: us-central1
   - **Storage** → Create a bucket (default settings fine)

## Step 2: Get Production Firebase Credentials

### Get Service Account Key:
1. In Firebase Console → **Project Settings** (gear icon)
2. **Service Accounts** tab → **Generate New Private Key**
3. Download the JSON file - save it securely locally (don't commit!)

### Get Web App Config:
1. In Firebase Console → **Project Settings** (gear icon)
2. Scroll down to **Your apps** section
3. If no web app, click **"Add app"** and select web icon
4. Copy the Firebase config (you'll need this next)

## Step 3: Set Up GitHub Secrets

1. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Add these secrets with your **production** Firebase credentials:

```
PROD_NEXT_PUBLIC_FIREBASE_API_KEY=             # From Firebase config
PROD_NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=         # From Firebase config
PROD_NEXT_PUBLIC_FIREBASE_PROJECT_ID=tumbahub-prod
PROD_NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=      # From Firebase config
PROD_NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID= # From Firebase config
PROD_NEXT_PUBLIC_FIREBASE_APP_ID=              # From Firebase config
PROD_FIREBASE_PROJECT_ID=tumbahub-prod
PROD_FIREBASE_STORAGE_BUCKET=tumbahub-prod.appspot.com
PROD_FIREBASE_SERVICE_ACCOUNT_KEY=             # Entire JSON from service account key, as string
PROD_NEXTAUTH_SECRET=                          # Generate with: openssl rand -base64 32
PROD_NEXTAUTH_URL=https://yourdomain.com       # Will use Firebase URL like tumbahub-prod.web.app
FIREBASE_TOKEN=                                # Get from: firebase login:ci
```

### Getting FIREBASE_TOKEN:
```bash
firebase login:ci
# Opens browser, authorize, copy the token and paste into GitHub secret
```

### Getting PROD_FIREBASE_SERVICE_ACCOUNT_KEY:
The service account JSON needs to be converted to a single-line string:
```bash
cat firebase-service-account.json | jq -c . | tr -d '\n'
```
Copy the entire minified JSON and paste into the GitHub secret.

## Step 4: Create .env.production.local Locally (for testing)

```bash
cp .env.production.local.example .env.production.local
# Edit .env.production.local with your production credentials
```

## Step 5: Seed Production Database

1. Pull initial data from dev Firebase:
   ```bash
   npm run build
   # Make sure all users/shops/etc are set up
   ```

2. Export dev Firestore collections (optional):
   - Use Firebase Console export feature or
   - Export via script if you need exact copies

3. In prod Firebase Console:
   - Navigate to Firestore
   - Manually create the initial data structure:
     - Create `users` collection with admin user
     - Create `shop_items` collection with items
     - Create `actions` collection with predefined actions

   Example admin user to add:
   ```json
   {
     "email": "your_email@example.com",
     "name": "Admin",
     "balance": 1000,
     "isAdmin": true,
     "profilePicture": "",
     "createdAt": "2026-03-13T00:00:00Z",
     "updatedAt": "2026-03-13T00:00:00Z"
   }
   ```

## Step 6: Deploy!

### Local Test Deploy (Optional):
```bash
firebase deploy --only hosting --project tumbahub-prod
```

### Auto-Deploy via GitHub:
1. Push to `main` branch:
   ```bash
   git add .
   git commit -m "Deploy to production"
   git push origin main
   ```

2. GitHub Actions will:
   - Build the app
   - Create environment variables
   - Deploy to Firebase Hosting
   - Show status in PR/Actions tab

3. View deployed app at: `https://tumbahub-prod.web.app`

## Step 7: Point Domain (Optional)

If you have a domain, you can connect it to Firebase Hosting:
1. Firebase Console → Hosting → **Connect Domain**
2. Follow the DNS setup instructions for your domain registrar
3. Update `PROD_NEXTAUTH_URL` secret to your domain

---

## Local Development

Continue using dev environment:
```bash
npm run dev  # Uses .env.local (dev Firebase)
```

The app will use `tumbahub` Firebase project and your local data.

## Monitoring Deployments

- GitHub Actions: Go to **Actions** tab → see deployment status
- Firebase Hosting: Console shows recent deploys and analytics
- Real-time logs: GitHub Actions tab shows full build/deploy output

## Rollback

If something goes wrong:
```bash
firebase hosting:channels:list --project tumbahub-prod
firebase hosting:clone tumbahub-prod:live tumbahub-prod:previous
```

Or redeploy a previous commit via GitHub Actions manual trigger.

---

## Troubleshooting

**Deployment fails with "firebase-tools not found"**
- GitHub Actions installs it automatically, ensure `npx` is available

**env variables not being picked up**
- Verify secrets are named exactly as in the workflow file
- Check GitHub organization vs repo-level secrets

**404 errors on production site**
- Verify Firebase Hosting rules allow public access
- Check `firebase.json` public directory path

**Database connection errors**
- Verify Firestore is enabled in production Firebase project
- Check FIREBASE_SERVICE_ACCOUNT_KEY is valid JSON

---

## Next Steps

1. ✅ Set up this week
2. 🚀 Deploy to production
3. Share `https://tumbahub-prod.web.app` with friends
4. Continue development in dev environment
5. Deploy updates by pushing to main branch

Good luck! 🎉
