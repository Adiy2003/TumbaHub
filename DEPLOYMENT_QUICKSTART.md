# 🚀 Quick Start: Deploy TumbaHub to Production

Complete these steps to get your app live for your friends!

## Phase 1: Firebase Setup (30 minutes)

### ✅ Step 1: Create Production Firebase Project
- [ ] Go to [Firebase Console](https://console.firebase.google.com)
- [ ] Create new project named `tumbahub-prod`
- [ ] Enable: Authentication (Email/Password), Firestore, Storage

### ✅ Step 2: Get Production Credentials
- [ ] Download service account key JSON
- [ ] Copy Firebase web config (API key, project ID, etc.)
- [ ] Keep both files safe - you'll need them next

## Phase 2: GitHub Setup (20 minutes)

### ✅ Step 3: Add GitHub Secrets
Go to **GitHub repo → Settings → Secrets and variables → Actions**

Add these 11 secrets:
```
PROD_NEXT_PUBLIC_FIREBASE_API_KEY
PROD_NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
PROD_NEXT_PUBLIC_FIREBASE_PROJECT_ID=tumbahub-prod
PROD_NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
PROD_NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
PROD_NEXT_PUBLIC_FIREBASE_APP_ID
PROD_FIREBASE_PROJECT_ID=tumbahub-prod
PROD_FIREBASE_STORAGE_BUCKET
PROD_FIREBASE_SERVICE_ACCOUNT_KEY=    (paste entire JSON minified)
PROD_NEXTAUTH_SECRET=                 (generate: openssl rand -base64 32)
PROD_NEXTAUTH_URL=https://tumbahub-prod.web.app
FIREBASE_TOKEN=                       (run: firebase login:ci)
```

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed instructions.

## Phase 3: Database Seeding (10 minutes)

### ✅ Step 4: Initialize Production Database
1. Go to Firebase Console → Project `tumbahub-prod` → Firestore
2. Create these collections with starting data:

**users** collection:
- Add admin user first (must exist for login)
- Example admin document:
  ```json
  {
    "email": "your_email@example.com",
    "name": "Admin",
    "balance": 1000,
    "isAdmin": true,
    "profilePicture": "",
    "createdAt": new Date(),
    "updatedAt": new Date()
  }
  ```

**shop_items** collection:
- Copy items from dev Firebase or create fresh ones

**actions** collection:
- Add predefined actions (Ride, Hosting, No-show, etc.)

## Phase 4: Deploy! (5 minutes)

### ✅ Step 5: Push to Production
```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

GitHub Actions will automatically:
1. Build the app
2. Run tests
3. Deploy to Firebase Hosting
4. Show you the live URL

### ✅ Step 6: Verify Live App
- Check deployment status in GitHub → Actions tab
- Visit `https://tumbahub-prod.web.app`
- Log in with your admin account
- Test creating a user and checking balances

---

## 🎉 You're Live!

Share the URL with your friends: **https://tumbahub-prod.web.app**

### Future Updates
Just push to `main` branch and it auto-deploys:
```bash
git push origin main
```

The production database is completely separate from your dev database, so you can keep building without affecting your friends' data!

---

## Need Help?
See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for detailed troubleshooting and advanced topics.

---

## Environment Separation Summary

| | **Development** | **Production** |
|---|---|---|
| **Local Command** | `npm run dev` | N/A (via GitHub) |
| **Environment File** | `.env.local` | `.env.production.local` (in Secrets) |
| **Firebase Project** | `tumbahub` | `tumbahub-prod` |
| **Database** | Dev Firestore | Prod Firestore |
| **URL** | localhost:3000 | tumbahub-prod.web.app |
| **Your Data** | Only you | Your + friends' data |

This keeps everything completely separate! 🎯
