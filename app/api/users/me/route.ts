import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { adminDb, adminStorage } from '@/lib/firebase-admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userDoc = await adminDb.collection('users').doc(session.user.id).get()

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const user = {
      id: userDoc.id,
      ...userDoc.data(),
    }

    return NextResponse.json(
      { user },
      { status: 200 }
    )
  } catch (error) {
    console.error('Failed to fetch current user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const contentType = request.headers.get('content-type')
    const updateData: any = { updatedAt: new Date() }

    if (contentType?.includes('multipart/form-data')) {
      // Handle file upload
      try {
        const formData = await request.formData()
        const file = formData.get('profilePicture') as File
        const name = formData.get('name') as string

        if (!file) {
          return NextResponse.json(
            { error: 'No file provided' },
            { status: 400 }
          )
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
          return NextResponse.json(
            { error: 'File must be an image' },
            { status: 400 }
          )
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          return NextResponse.json(
            { error: 'File size cannot exceed 5MB' },
            { status: 400 }
          )
        }

        // Upload to Firebase Storage
      const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;

      if (!bucketName) {
        throw new Error("Storage bucket name is missing!");
     }

      const bucket = adminStorage.bucket(bucketName);
      const fileName = `profile-pictures/${session.user.id}-${Date.now()}`;
      const file_ref = bucket.file(fileName);

        const buffer = await file.arrayBuffer()
        
        // Save file to storage
        await file_ref.save(Buffer.from(buffer), {
          metadata: {
            contentType: file.type,
          },
        })

        // Make file public (set the download token)
        await file_ref.makePublic()

        // Construct public URL using the bucket name
        const downloadUrl = `https://storage.googleapis.com/${bucketName}/${fileName}`

        updateData.profilePicture = downloadUrl

        if (name && name.trim()) {
          if (name.length > 50) {
            return NextResponse.json(
              { error: 'Name cannot exceed 50 characters' },
              { status: 400 }
            )
          }
          updateData.name = name.trim()
        }
      } catch (uploadError) {
        console.error('File upload error:', uploadError)
        return NextResponse.json(
          { error: 'Failed to upload file: ' + (uploadError instanceof Error ? uploadError.message : 'Unknown error') },
          { status: 400 }
        )
      }
    } else {
      // Handle JSON body (name only)
      const body = await request.json()
      const { name } = body

      if (!name || name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Name cannot be empty' },
          { status: 400 }
        )
      }

      if (name.length > 50) {
        return NextResponse.json(
          { error: 'Name cannot exceed 50 characters' },
          { status: 400 }
        )
      }

      updateData.name = name.trim()
    }

    // Update user in Firestore
    await adminDb.collection('users').doc(session.user.id).update(updateData)

    const userDoc = await adminDb.collection('users').doc(session.user.id).get()
    const user = {
      id: userDoc.id,
      ...userDoc.data(),
    }

    return NextResponse.json(
      { user, message: 'Profile updated successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Failed to update user:', error)
    return NextResponse.json(
      { error: 'Failed to update profile: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}
