# TumbaHub Setup Instructions

## 🚀 Quick Start (Recommended)

### Windows Users:
1. Open Command Prompt or PowerShell in the TumbaHub folder
2. Double-click `setup.bat` or run:
   ```bash
   setup.bat
   ```

### macOS/Linux Users:
1. Open Terminal in the TumbaHub folder
2. Run:
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

The setup script will:
- Install all dependencies
- Set up the SQLite database
- Seed sample data
- Show you test account credentials

## ⚙️ Manual Setup Steps

If the automated scripts don't work, follow these steps:

### 1. Install Dependencies
```bash
npm install
```

### 2. Generate Prisma Client
```bash
npx prisma generate
```

### 3. Create & Migrate Database
```bash
npx prisma migrate dev --name init
```

This will:
- Create `prisma/dev.db` (SQLite database)
- Run the migration
- Automatically generate Prisma client

### 4. Seed Sample Data
```bash
npx tsx prisma/seed.ts
```

You'll see output like:
```
🌱 Seeding database...
✅ Database seeded successfully!
Test credentials:
  📧 alex@example.com / 🔑 password123
  📧 jordan@example.com / 🔑 password123
  ...
```

### 5. Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

## 🧪 Test Accounts

After setup, log in with any of these:

| Email | Password |
|-------|----------|
| alex@example.com | password123 |
| jordan@example.com | password123 |
| casey@example.com | password123 |
| morgan@example.com | password123 |
| taylor@example.com | password123 |

Or create your own account using the **Sign Up** page!

## 📁 Database Files

- `prisma/dev.db` - Your SQLite database (created after first migration)
- `prisma/migrations/` - Migration history (tracked in git)

**Note:** The database file (`dev.db`) is in `.gitignore` - don't commit it!

## 🛠️ Useful Commands

```bash
# View database in GUI
npm run prisma:studio

# Re-seed database
npx tsx prisma/seed.ts

# Create new migration after schema changes
npx prisma migrate dev --name <migration_name>

# Reset database (⚠️ deletes all data!)
npx prisma migrate reset
```

## 🐛 Troubleshooting

### "npx: command not found"
- You need Node.js installed. Download from [nodejs.org](https://nodejs.org/)

### "Cannot find module @prisma/client"
- Run: `npm install` and then `npx prisma generate`

### "Database file not found"
- Run: `npx prisma migrate dev --name init`

### "NEXTAUTH_SECRET not found"
- Check your `.env.local` file exists and has `NEXTAUTH_SECRET` set

## ✅ Verification

After setup, you should see:

1. ✅ `prisma/dev.db` file created
2. ✅ You can log in with test accounts
3. ✅ Balance and leaderboard data loads from database
4. ✅ You can see all users' balances

## 🚀 Next Steps

Once the app is running:

1. **Explore the app:**
   - Home: View your balance and friends
   - Leaderboard: See rankings
   - Profile: View account info

2. **Play around:**
   - Try logging out and creating a new account
   - Check how the leaderboard ranks users

3. **Next features to build:**
   - Coin transfers between users
   - Transaction history
   - Bets and challenges

Happy coding! 🎉
