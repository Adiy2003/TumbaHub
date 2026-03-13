import { adminDb, adminAuth } from '@/lib/firebase-admin'

/**
 * Seed Firestore with initial data for TumbaHub
 * Run with: npx tsx lib/seed-firestore.ts
 */

export async function seedFirestore() {
  try {
    console.log('🌱 Starting Firestore seed...')

    // Create test users
    const users = [
      { email: 'alex@example.com', name: 'Alex', isAdmin: true },
      { email: 'jordan@example.com', name: 'Jordan', isAdmin: false },
      { email: 'casey@example.com', name: 'Casey', isAdmin: false },
      { email: 'morgan@example.com', name: 'Morgan', isAdmin: false },
      { email: 'taylor@example.com', name: 'Taylor', isAdmin: false },
    ]

    console.log('\n👥 Creating users...')
    for (const user of users) {
      try {
        // Create user in Firebase Auth
        const userRecord = await adminAuth.createUser({
          email: user.email,
          password: 'password123', // Change this for production!
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

        console.log(`   ✓ Created user: ${user.email}`)
      } catch (error: any) {
        if (error.code === 'auth/email-already-exists') {
          console.log(`   ℹ User ${user.email} already exists`)
        } else {
          console.error(`   ✗ Error creating ${user.email}:`, error.message)
        }
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

    console.log('\n🎯 Creating actions...')
    for (const action of actions) {
      const now = new Date()
      await adminDb.collection('actions').add({
        name: action.name,
        amount: action.amount,
        description: action.description,
        createdAt: now,
      })
      console.log(`   ✓ Created action: ${action.name}`)
    }

    // Create shop items
    const shopItems = [
      { name: 'Free Beer', price: 200, emoji: '🍺', description: 'One free beer on us!' },
      { name: 'Dinner Voucher', price: 500, emoji: '🍽️', description: 'Dinner for two' },
      { name: 'Movie Pick', price: 100, emoji: '🎬', description: 'Pick the next movie' },
      { name: 'Game Night Pass', price: 150, emoji: '🎮', description: 'Skip one game night' },
      { name: 'Skip Turn', price: 250, emoji: '⏭️', description: 'Skip your turn' },
      { name: 'Coffee', price: 50, emoji: '☕', description: 'Free coffee' },
    ]

    console.log('\n🛍️  Creating shop items...')
    for (const item of shopItems) {
      const now = new Date()
      await adminDb.collection('shop_items').add({
        name: item.name,
        price: item.price,
        emoji: item.emoji,
        description: item.description,
        createdAt: now,
      })
      console.log(`   ✓ Created item: ${item.name}`)
    }

    console.log('\n✅ Firestore seeded successfully!')
    console.log('\n📝 Test credentials:')
    console.log('   Admin: alex@example.com / password123')
    console.log('   User: jordan@example.com / password123')
  } catch (error) {
    console.error('❌ Error seeding Firestore:', error)
    process.exit(1)
  }
}

// Run seed if called directly
if (require.main === module) {
  seedFirestore()
}
