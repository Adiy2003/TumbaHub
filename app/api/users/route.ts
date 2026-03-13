import { NextResponse } from 'next/server'

// Mock database - in production, this would be a real database
const USERS = [
  { id: '1', name: 'You', balance: 5250 },
  { id: '2', name: 'Alex', balance: 3840 },
  { id: '3', name: 'Jordan', balance: 2100 },
  { id: '4', name: 'Casey', balance: 1560 },
  { id: '5', name: 'Morgan', balance: 4200 },
  { id: '6', name: 'Taylor', balance: 2890 },
]

export async function GET() {
  try {
    return NextResponse.json(
      {
        success: true,
        users: USERS,
      },
      { status: 200 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
