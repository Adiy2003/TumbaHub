# Firebase Setup Guide for TumbaHub

This guide will help you set up Firebase for TumbaHub's backend infrastructure.

## Prerequisites

- Firebase Account: https://console.firebase.google.com
- Node.js and npm installed
- TumbaHub project cloned

##Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a project"
3. Enter project name: `tumbahub` (or your preferred name)
4. Disable "Enable Google Analytics" for now
5. Click "Create project"
6. Wait for the project to be created (~5 minutes)

## Step 2: Create a Web App

1. In Firebase Console, click the Web icon (</>) to create a web app
2. Register the app with nickname "TumbaHub Web"
3. Copy the Firebase config (you'll need this for `.env.local`)
4. The app is ready - no need to install firebase-cli

## Step 3: Set Up Firestore Database

1. Go to **Firestore Database** in the left sidebar
2. Click **Create database**
3. Choose **Start in production mode**
4. Select the location closest to you (or `us-central1`)
5. Click **Create**

### Create Collections

Firestore needs the following collections. You can create them through the console or via API:

#### a) users collection
- Create collection named `users`
- Go to `lib/seed-firestore.ts` (create this file if needed) to bulk load data
- Document IDs: Use the User UID from Firebase Auth
- Fields per document:
  ```
  {
    email: string
    name: string
    balance: number (starting value: 1000)
    isAdmin: boolean
    createdAt: timestamp
    updatedAt: timestamp
  }
  ```

#### b) transactions collection
- Create collection named `transactions`
- Document IDs: Auto-generate
- Fields per document:
  ```
  {
    fromId: string (reference to user ID)
    toId: string (reference to user ID)
    amount: number
    action: string
    description: string
    createdAt: timestamp
  }
  ```

#### c) actions collection
- Create collection named `actions`
- Document IDs: Auto-generate or use custom IDs
- Fields per document:
  ```
  {
    name: string (e.g., "Long ride", "Short ride")
    amount: number (positive/negative)
    description: string
    createdAt: timestamp
  }
  ```

#### d) shop_items collection
- Create collection named `shop_items`
- Document IDs: Auto-generate or use custom IDs
- Fields per document:
  ```
  {
    name: string
    price: number
    description: string
    emoji: string (default: "🛍️")
    createdAt: timestamp
  }
  ```

## Step 4: Set Up Firebase Authentication

1. Go to **Authentication** in the left sidebar
2. Click **Get started**
3. Enable **Email/Password** authentication method:
   - Click **Email/Password**
   - Toggle **Enabled** on
   - Disable **Email link (passwordless sign-in)** 
   - Click **Save**

## Step 5: Create Service Account Key

For server-side operations (NextAuth, API routes), you need a service account:

1. Go to **Project Settings** (gear icon) → **Service Accounts**
2. Select "Node.js" as the language
3. Click **Generate new private key**
4. Save the JSON file as `firebase-service-account.json` in your project root
5. Add this file to `.gitignore`:
   ```
   firebase-service-account.json
   ```

## Step 6: Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Update `.env.local` with your Firebase config:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
   NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project"
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
   NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-xxxxxxxxxx"
   
   FIREBASE_SERVICE_ACCOUNT_KEY="./firebase-service-account.json"
   NEXTAUTH_SECRET="generate-a-random-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   NEXT_PUBLIC_API_URL="http://localhost:3000/api"
   ```

3. Generate a secure `NEXTAUTH_SECRET`:
   ```bash
   openssl rand -base64 32
   ```

## Step 7: Initialize Firestore Data

Create a seed script to populate initial data. Create `lib/seed-firestore.ts`:

```typescript
import { adminDb, adminAuth } from '@/lib/firebase-admin'

export async function seedFirestore() {
  try {
    // Create test users
    const users = [
      { email: 'alex@example.com', name: 'Alex', isAdmin: true },
      { email: 'jordan@example.com', name: 'Jordan', isAdmin: false },
      { email: 'casey@example.com', name: 'Casey', isAdmin: false },
      { email: 'morgan@example.com', name: 'Morgan', isAdmin: false },
      { email: 'taylor@example.com', name: 'Taylor', isAdmin: false },
    ]

    for (const user of users) {
      try {
        // Create user in Firebase Auth
        const userRecord = await adminAuth.createUser({
          email: user.email,
          password: 'password123', // Change in production!
          displayName: user.name,
        })

        // Create user doc in Firestore
        const now = new Date()
        await adminDb.collection('users').doc(userRecord.uid).set({
          email: user.email,
          name: user.name,
          balance: 1000,
          isAdmin: user.isAdmin,
          createdAt: now,
          updatedAt: now,
        })

        console.log(`Created user: ${user.email}`)
      } catch (error: any) {
        console.log(`User ${user.email} already exists`)
      }
    }

    // Create actions
    const actions = [
      { name: 'Long ride', amount: 50, description: 'Gave someone a long ride' },
      { name: 'Short ride', amount: 20, description: 'Gave someone a short ride' },
      { name: 'Regular host', amount: 40, description: 'Hosted regular event' },
      { name: 'Special host', amount: 80, description: 'Hosted special event' },
      { name: 'No-show', amount: -60, description: 'No-showed to event' },
      { name: 'Last minute', amount: -30, description: 'Cancelled last minute' },
    ]

    for (const action of actions) {
      const now = new Date()
      await adminDb.collection('actions').add({
        name: action.name,
        amount: action.amount,
        description: action.description,
        createdAt: now,
      })
    }

    // Create shop items
    const shopItems = [
      { name: 'Free Beer', price: 200, emoji: '🍺' },
      { name: 'Dinner Voucher', price: 500, emoji: '🍽️' },
      { name: 'Movie Pick', price: 100, emoji: '🎬' },
      { name: 'Game Night Pass', price: 150, emoji: '🎮' },
      { name: 'Skip Turn', price: 250, emoji: '⏭️' },
      { name: 'Coffee', price: 50, emoji: '☕' },
    ]

    for (const item of shopItems) {
      const now = new Date()
      await adminDb.collection('shop_items').add({
        name: item.name,
        price: item.price,
        emoji: item.emoji,
        description: `Buy ${item.name.toLowerCase()}`,
        createdAt: now,
      })
    }

    console.log('Firestore seeded successfully!')
  } catch (error) {
    console.error('Error seeding Firestore:', error)
    throw error
  }
}
```

Run the seed script once after setting up:
```bash
npx tsx lib/seed-firestore.ts
```

## Step 8: Start Development Server

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` and test the authentication flow:

1. Sign up with a new account
2. Verify the user is created in Firebase Authentication
3. Check Firestore to confirm the user document is created
4. Log in with your credentials
5. Test balance display and transactions

## Firestore Security Rules (Optional but Recommended)

Go to **Firestore Database** → **Rules** and update with:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read their own data
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId && resource.data.isAdmin == false;
    }

    // Transactions are read-only after creation
    match /transactions/{document=**} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
    }

    // Actions and shop items are public read
    match /{document=**} {
      allow read: if request.auth != null;
    }
  }
}
```

## Troubleshooting

### Service Account Key Error
- Ensure `firebase-service-account.json` exists in project root
- Check that `FIREBASE_SERVICE_ACCOUNT_KEY` env var is set correctly

### Firestore Not Found
- Verify Firestore Database is created in Firebase Console
- Check that collections exist with correct names

### Authentication Failing
- Verify Email/Password is enabled in Firebase Authentication
- Check that users are created in Firebase Auth Console

### Users Not Appearing in Firestore
- Confirm the service account has permissions to write to Firestore
- Check Firestore Security Rules are not blocking writes

## Next Steps

1. Set up Firestore Backups (Firebase Console → Backup and Restore)
2. Enable Firebase Monitoring and Analytics
3. Set up Firebase Hosting for production deployment
4. Configure custom domain and SSL certificate
