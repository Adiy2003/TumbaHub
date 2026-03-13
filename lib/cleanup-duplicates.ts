import { adminDb } from '@/lib/firebase-admin'

/**
 * Remove duplicate shop items and actions from Firestore
 * This happens when the seed script is run multiple times
 * Run with: npx tsx lib/cleanup-duplicates.ts
 */

export async function cleanupDuplicates() {
  try {
    console.log('🧹 Starting cleanup of duplicates...')

    // Cleanup shop items
    console.log('\n🛍️  Cleaning up shop items...')
    const itemsSnapshot = await adminDb.collection('shop_items').get()
    const itemsByName: { [key: string]: string[] } = {}

    // Group by name
    itemsSnapshot.docs.forEach(doc => {
      const name = doc.data().name
      if (!itemsByName[name]) {
        itemsByName[name] = []
      }
      itemsByName[name].push(doc.id)
    })

    // Delete duplicates, keep first one
    let itemsDeleted = 0
    for (const [name, ids] of Object.entries(itemsByName)) {
      if (ids.length > 1) {
        console.log(`   Found ${ids.length} copies of "${name}", keeping 1...`)
        for (let i = 1; i < ids.length; i++) {
          await adminDb.collection('shop_items').doc(ids[i]).delete()
          itemsDeleted++
        }
      }
    }
    console.log(`   ✓ Deleted ${itemsDeleted} duplicate items`)

    // Cleanup actions
    console.log('\n🎯 Cleaning up actions...')
    const actionsSnapshot = await adminDb.collection('actions').get()
    const actionsByName: { [key: string]: string[] } = {}

    // Group by name
    actionsSnapshot.docs.forEach(doc => {
      const name = doc.data().name
      if (!actionsByName[name]) {
        actionsByName[name] = []
      }
      actionsByName[name].push(doc.id)
    })

    // Delete duplicates, keep first one
    let actionsDeleted = 0
    for (const [name, ids] of Object.entries(actionsByName)) {
      if (ids.length > 1) {
        console.log(`   Found ${ids.length} copies of "${name}", keeping 1...`)
        for (let i = 1; i < ids.length; i++) {
          await adminDb.collection('actions').doc(ids[i]).delete()
          actionsDeleted++
        }
      }
    }
    console.log(`   ✓ Deleted ${actionsDeleted} duplicate actions`)

    console.log('\n✅ Cleanup completed successfully!')
  } catch (error) {
    console.error('❌ Error during cleanup:', error)
    process.exit(1)
  }
}

// Run cleanup if called directly
if (require.main === module) {
  cleanupDuplicates()
}
