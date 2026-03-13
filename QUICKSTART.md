# Firebase Integration Quick Start Checklist

Complete these steps to get TumbaHub running with Firebase:

## Phase 1: Firebase Project Setup (5-10 minutes)

- [ ] Go to [Firebase Console](https://console.firebase.google.com)
- [ ] Create new project named "tumbahub"
- [ ] Wait for project creation to complete
- [ ] Create a Web App in Firebase
  - [ ] Copy the Firebase config (you'll need this)
  - [ ] Save it somewhere safe
- [ ] Verify you're in the Firebase project dashboard

## Phase 2: Firestore Database (5 minutes)

- [ ] Go to **Firestore Database** in left menu
- [ ] Click **Create database**
- [ ] Select **Production mode**
- [ ] Choose region (e.g., us-central1)
- [ ] Click **Create**
- [ ] Wait for database to initialize

## Phase 3: Firebase Authentication (2 minutes)

- [ ] Go to **Authentication** in left menu
- [ ] Click **Get started**
- [ ] Find **Email/Password** provider
- [ ] Click **Email/Password**
- [ ] Toggle **Enabled** ON
- [ ] Click **Save**

## Phase 4: Service Account Setup (5 minutes)

- [ ] Click settings icon (gear) → **Project Settings**
- [ ] Go to **Service Accounts** tab
- [ ] Select **Node.js** as language
- [ ] Click **Generate new private key**
- [ ] A JSON file downloads
- [ ] Move it to your project root as `firebase-service-account.json`
- [ ] Verify it's in `.gitignore` (never commit this!)

## Phase 5: Local Setup (10 minutes)

- [ ] Copy `.env.local.example` to `.env.local`:
  ```bash
  cp .env.local.example .env.local
  ```

- [ ] Open `.env.local` in your editor

- [ ] Fill in Firebase config from Step 1:
  ```
  NEXT_PUBLIC_FIREBASE_API_KEY="your-key"
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-domain"
  NEXT_PUBLIC_FIREBASE_PROJECT_ID="tumbahub"
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="..."
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
  NEXT_PUBLIC_FIREBASE_APP_ID="..."
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="..."
  ```

- [ ] Set reference to service account key:
  ```
  FIREBASE_SERVICE_ACCOUNT_KEY="./firebase-service-account.json"
  ```

- [ ] Generate NextAuth secret:
  - On macOS/Linux:
    ```bash
    openssl rand -base64 32
    ```
  - On Windows (PowerShell):
    ```powershell
    [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((1..24|ForEach-Object{Get-Random -Maximum 256}|%{[char]$_})-join''))
    ```
  - Paste output into `.env.local` as `NEXTAUTH_SECRET`

## Phase 6: Dependencies (3 minutes)

- [ ] Install npm packages:
  ```bash
  npm install
  ```

- [ ] Wait for installation to complete

## Phase 7: Seed Database (2 minutes)

- [ ] Initialize Firestore with test data:
  ```bash
  npx tsx lib/seed-firestore.ts
  ```

- [ ] You should see output like:
  ```
  🌱 Starting Firestore seed...
  👥 Creating users...
  ✓ Created user: alex@example.com
  ...
  ✅ Firestore seeded successfully!
  ```

- [ ] If you see errors, check FIREBASE_SETUP.md troubleshooting section

## Phase 8: Run the App (2 minutes)

- [ ] Start development server:
  ```bash
  npm run dev
  ```

- [ ] Open browser to `http://localhost:3000`

- [ ] You should see TumbaHub home page or redirect to login

## Phase 9: Test It Works (5 minutes)

- [ ] Click **Sign Up** or **Log In**
- [ ] Use test credentials:
  - Email: `alex@example.com`
  - Password: `password123`
- [ ] Log in successfully
- [ ] Verify you see your balance (1000 TumbaCoins)
- [ ] Go to **Leaderboard** - see all users
- [ ] Go to **Admin** (if logged in as admin)
- [ ] Try sending coins or buying items

## Phase 10: Troubleshooting

If something doesn't work:

1. **Check Firestore collections exist**:
   - Firebase Console → Firestore Database
   - Should see: users, transactions, actions, shop_items

2. **Check service account key**:
   - File `firebase-service-account.json` in project root
   - File should NOT be in git (check `.gitignore`)

3. **Check environment variables**:
   - File `.env.local` has all Firebase keys
   - Project ID matches Firebase console

4. **Check logs**:
   - Look at terminal where `npm run dev` is running
   - Look for error messages

5. **Still stuck?**:
   - Read FIREBASE_SETUP.md - Troubleshooting section
   - Check Firebase Console for errors
   - Verify Firestore rules aren't blocking access

##Success Indicators

When everything works, you'll see:

✅ Login page loads
✅ Can create account or log in with existing credentials
✅ Home page shows TumbaCoins balance
✅ Leaderboard shows all users and balances
✅ Transactions page works
✅ Shop page works (if logged in)
✅ Admin panel works (if logged in as alex@example.com)

## Next Steps

After getting it working locally:

1. Run more transactions to test
2. Create new users and test
3. Test admin functionality
4. Read [FIREBASE_MIGRATION.md](./FIREBASE_MIGRATION.md) for technical details
5. Deploy to Firebase Hosting or Vercel
6. Share with your friend group!

## Time Estimate

Total time to complete: **40-50 minutes** (first time)

## Support

- Firebase Setup Issues → See FIREBASE_SETUP.md
- Technical Details → See FIREBASE_MIGRATION.md
- App Features → See README.md
