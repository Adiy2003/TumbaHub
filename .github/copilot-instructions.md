<!-- Use this file to provide workspace-specific custom instructions to Copilot. -->

# TumbaHub Project Setup and Development

## Project Overview
TumbaHub is a friend group currency system where users can track TumbaCoins balances and see other users' balances on a modern, dark-themed interface. Now with Firebase Firestore backend!

## Tech Stack
- **Frontend**: Next.js 14+ with React, TypeScript, and Tailwind CSS
- **Backend**: Next.js API Routes
- **Authentication**: NextAuth.js + Firebase Auth
- **Styling**: Tailwind CSS with dark theme
- **Database**: Firebase Firestore (cloud-based)
- **Hosting Ready**: Firebase Hosting

## Setup Steps

- [x] Create project directories
- [x] Initialize Next.js project with TypeScript and Tailwind
- [x] Build home page with dark theme UI
- [x] Implement user balance display
- [x] Implement user list with balances
- [x] Create API endpoints for user data
- [x] Set up authentication with NextAuth.js
- [x] Create login and signup pages
- [x] Add route protection middleware
- [x] Create admin panel for coin management
- [x] Implement coin transfers between users
- [x] Create TumbaShop with purchasable items
- [x] Add transaction history tracking
- [x] Migrate database from SQLite → Firebase Firestore
- [x] Implement bets and challenges (Bets page)
- [x] Add photo album functionality (Album page)
- [x] Deploy to Firebase Hosting (GitHub Actions + separate dev/prod)
- [ ] Set up real-time listeners
- [ ] Implement rate limiting on API endpoints
- [ ] Replace polling with WebSocket for real-time updates

## Firebase Collections
- `users` - User profiles with balances and admin status
- `transactions` - All coin transfers and purchases
- `actions` - Predefined admin actions (rides, hosting, no-shows, etc.)
- `shop_items` - Purchasable items in TumbaShop

## Development Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run linting
- `npx tsx lib/seed-firestore.ts` - Initialize Firebase with test data

## Design Requirements
- Modern, minimalistic dark theme
- Slick UI with good UX
- User can see their TumbaCoins balance
- User can see list of other users and their balances
- Firebase-backed persistence (no local database needed)

## Important Notes
- Firebase config is in `lib/firebase.ts` (client-side)
- Firebase Admin SDK is in `lib/firebase-admin.ts` (server-side)
- Service account key must be in `.env.local` and `.gitignore`
- All API routes use Firestore (no Prisma)
- Test credentials: alex@example.com / password123 (admin)

## Deployment

**Development Environment:**
- Firebase Project: `tumbahub` (dev)
- Local testing with `npm run dev`
- Uses `.env.local` file
- Database: dev Firestore instance

**Production Environment:**
- Firebase Project: `tumbahub-prod` (separate prod database)
- Hosted on Firebase Hosting
- GitHub Actions auto-deploys from `main` branch push
- Uses `.env.production.local` (in GitHub Secrets)
- Database: prod Firestore instance (completely separate from dev)

**Deployment Workflow:**
1. Push to `main` branch → GitHub Actions triggered
2. GitHub builds the app with production environment
3. Automatically deploys to Firebase Hosting
4. Live at: `https://tumbahub-prod.web.app`

See [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md) for complete setup instructions.
