/**
 * Environment variable validation
 * Runs on application startup to ensure all required vars are set
 */

export function validateEnvironmentVariables() {
  const requiredVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_STORAGE_BUCKET',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
  ]

  const missingVars = requiredVars.filter((varName) => !process.env[varName])

  if (missingVars.length > 0) {
    console.error(
      '❌ Missing required environment variables:',
      missingVars.join(', ')
    )
    console.error(
      'Please check your .env.local file and ensure all required variables are set.'
    )

    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`)
    }
  } else {
    console.log('✅ All required environment variables are configured')
  }
}
