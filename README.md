# TumbaHub 🪙

A modern web app for friend groups to track TumbaCoins - a custom currency system where friends can earn, lose, and exchange coins for favors and fun bets.

## Features

- 👤 View your TumbaCoin balance
- 👥 See all friends' balances at a glance
- 🎨 Modern, minimalistic dark-themed UI
- ⚡ Real-time updates (coming soon)
- 💾 Transaction history
- 🔥 Firebase-backed storage and authentication

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Next.js API Routes
- **Authentication**: NextAuth.js + Firebase Auth
- **Database**: Firebase Firestore
- **Styling**: Tailwind CSS
- **Hosting**: Firebase Hosting (ready for deployment)

## Getting Started

### Prerequisites

- Node.js 18+ ([download here](https://nodejs.org/))
- npm, yarn, or pnpm
- Firebase Account ([create one here](https://console.firebase.google.com))

### Firebase Setup

Before running the app locally, you need to set up Firebase:

1. **Follow the Firebase setup guide:**
   See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed instructions

2. **Quick Summary:**
   - Create a Firebase project
   - Enable Firestore Database
   - Enable Email/Password authentication
   - Create a service account key
   - Download the service account JSON file

### Installation & Setup

**On Windows (simplest method):**

1. Open Command Prompt or PowerShell in the TumbaHub folder
2. Run:
   ```bash
   setup.bat
   ```

**On macOS/Linux:**

1. Open Terminal in the TumbaHub folder
2. Make the script executable and run:
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

**Manual Setup:**

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create .env.local file:**
   ```bash
   cp .env.local.example .env.local
   ```

3. **Add your Firebase credentials to .env.local**
   (See FIREBASE_SETUP.md for details)

4. **Copy your service account JSON:**
   ```bash
   # Place your firebase-service-account.json in the project root
   # (Add this file to .gitignore - never commit credentials!)
   ```

5. **Seed Firestore with initial data:**
   ```bash
   npx tsx lib/seed-firestore.ts
   ```

6. **Start the development server:**
   ```bash
   npm run dev
   ```

7. **Open your browser and navigate to:**
   ```
   http://localhost:3000
   ```

### Test Accounts

After seeding, use any of these test accounts to log in:
- 📧 `alex@example.com` - Password: `password123` (Admin)
- 📧 `jordan@example.com` - Password: `password123`
- 📧 `casey@example.com` - Password: `password123`
- 📧 `morgan@example.com` - Password: `password123`
- 📧 `taylor@example.com` - Password: `password123`

Or create your own account using the **Sign Up** page!

## Project Structure

```
TumbaHub/
├── app/
│   ├── api/
│   │   ├── auth/                # Authentication routes
│   │   ├── transactions/        # Transaction API
│   │   ├── admin/               # Admin management API
│   │   ├── shop/                # Shop API
│   │   └── users/               # User data API
│   ├── auth/
│   │   ├── login/               # Login page
│   │   └── signup/              # Signup page
│   ├── admin/                   # Admin dashboard
│   ├── transactions/            # Transactions page
│   ├── shop/                    # Shop page
│   ├── leaderboard/             # Leaderboard page
│   ├── bets/                    # Bets page (placeholder)
│   ├── album/                   # Photo album page (placeholder)
│   ├── profile/                 # User profile page
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page
│   ├── globals.css              # Global styles
│   └── favicon.ico
├── components/
│   ├── BalanceCard.tsx          # Single user balance card
│   ├── UsersList.tsx            # Grid of user balances
│   ├── BottomNav.tsx            # Bottom navigation bar
│   ├── CoinIcon.tsx             # Coin SVG icon
│   ├── AuthProvider.tsx         # NextAuth session provider
│   └── ProtectedLayout.tsx      # Protected route wrapper
├── lib/
│   ├── firebase.ts              # Firebase client initialization
│   ├── firebase-admin.ts        # Firebase Admin SDK
│   ├── firestore.ts             # Firestore helper functions
│   └── seed-firestore.ts        # Firestore seed script
├── public/                      # Static assets
├── auth.ts                      # NextAuth configuration (Firebase Auth)
├── middleware.ts                # Route protection middleware
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── setup.bat                    # Windows setup script
├── setup.sh                     # Unix setup script
├── FIREBASE_SETUP.md            # Firebase setup guide
├── .env.local.example
└── firebase-service-account.json # (⚠️ Keep in .gitignore)
```

## Available Scripts

- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Build for production
- `npm start` - Run production server
- `npm run lint` - Run ESLint

## Design Features

- **Dark Theme**: Minimalistic design with custom dark color palette
- **Responsive**: Works on desktop, tablet, and mobile
- **Smooth Animations**: Subtle transitions and hover effects
- **Gradient Accents**: Gold/yellow accent color for TumbaCoins

## Current Features

✅ User authentication (Sign Up / Log In)
✅ Secure password hashing with bcryptjs
✅ JWT session management
✅ SQLite database with Prisma ORM
✅ Display current user's balance
✅ Display list of friends' balances
✅ Leaderboard with rankings
✅ User profile page with logout
✅ **Admin panel** - Manage user coins with predefined actions
✅ **Transactions** - Send coins to other users
✅ **TumbaShop** - Buy items with coins
✅ Transaction history tracking
✅ Responsive dark-themed UI
✅ Bottom navigation bar
✅ Protected routes (authentication required)

## Planned Features

⏳ More predefined actions and customization
⏳ Bet placement and settlement
⏳ Photo uploads for album
⏳ Real-time notifications
⏳ User profiles with custom avatars
⏳ Export transaction reports
⏳ Email notifications
⏳ Analytics and statistics dashboard
⏳ Recurring transactions
⏳ Two-factor authentication

## Contributing

To add features or fix bugs:

1. Create a new branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT

## Support

For issues or questions, open an issue on GitHub or contact the TumbaHub team.

---

**Made with ❤️ for friend groups everywhere**
