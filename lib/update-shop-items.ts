import { adminDb } from '@/lib/firebase-admin'

/**
 * Update shop items to the new set
 * Run with: npx tsx lib/update-shop-items.ts
 */

export async function updateShopItems() {
  try {
    console.log('🛍️  Updating shop items...')

    // Delete all existing shop items
    console.log('\n🧹 Clearing old items...')
    const snapshot = await adminDb.collection('shop_items').get()
    let deletedCount = 0
    for (const doc of snapshot.docs) {
      await doc.ref.delete()
      deletedCount++
    }
    console.log(`   ✓ Deleted ${deletedCount} old items`)

    // Add new shop items
    const newItems = [
      {
        name: 'Free Beer',
        price: 300,
        emoji: '🍺',
        description: 'One free beer of your choice',
      },
      {
        name: 'Free Coffee',
        price: 200,
        emoji: '☕',
        description: 'One free coffee on us',
      },
      {
        name: 'No Driving for the Weekend',
        price: 100,
        emoji: '🚫',
        description: 'Skip driving duties this weekend',
      },
      {
        name: 'A Night with Mazal',
        price: 2000,
        emoji: '🌙',
        description: 'Exclusive time with Mazal',
      },
    ]

    console.log('\n✨ Adding new items...')
    for (const item of newItems) {
      const now = new Date()
      await adminDb.collection('shop_items').add({
        name: item.name,
        price: item.price,
        emoji: item.emoji,
        description: item.description,
        createdAt: now,
      })
      console.log(`   ✓ Added: ${item.name} (${item.price} coins)`)
    }

    console.log('\n✅ Shop items updated successfully!')
  } catch (error) {
    console.error('❌ Error updating shop items:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  updateShopItems()
}
