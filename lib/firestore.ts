import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  increment,
} from 'firebase/firestore'
import { db } from './firebase'

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  TRANSACTIONS: 'transactions',
  ACTIONS: 'actions',
  SHOP_ITEMS: 'shop_items',
}

// User document types
export interface User {
  id: string
  email: string
  name: string
  balance: number
  isAdmin: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Transaction {
  id: string
  fromId: string
  toId: string
  amount: number
  action: string
  description?: string
  createdAt: Date
}

export interface Action {
  id: string
  name: string
  amount: number
  description?: string
  createdAt: Date
}

export interface ShopItem {
  id: string
  name: string
  price: number
  description?: string
  emoji: string
  createdAt: Date
}

// User operations
export async function getUserById(userId: string): Promise<User | null> {
  try {
    const docSnap = await getDoc(doc(db, COLLECTIONS.USERS, userId))
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as User
    }
    return null
  } catch (error) {
    console.error('Error getting user:', error)
    throw error
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const q = query(
      collection(db, COLLECTIONS.USERS),
      where('email', '==', email)
    )
    const querySnapshot = await getDocs(q)
    if (querySnapshot.empty) {
      return null
    }
    const docSnap = querySnapshot.docs[0]
    return { id: docSnap.id, ...docSnap.data() } as User
  } catch (error) {
    console.error('Error getting user by email:', error)
    throw error
  }
}

export async function getAllUsers(): Promise<User[]> {
  try {
    const q = query(
      collection(db, COLLECTIONS.USERS),
      orderBy('email', 'asc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as User[]
  } catch (error) {
    console.error('Error getting users:', error)
    throw error
  }
}

export async function createUser(
  userId: string,
  data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>
): Promise<User> {
  try {
    const now = new Date()
    const userData = {
      ...data,
      createdAt: now,
      updatedAt: now,
    }
    await setDoc(doc(db, COLLECTIONS.USERS, userId), userData)
    return { id: userId, ...userData } as User
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

export async function updateUserBalance(userId: string, amount: number): Promise<void> {
  try {
    await updateDoc(doc(db, COLLECTIONS.USERS, userId), {
      balance: increment(amount),
      updatedAt: new Date(),
    })
  } catch (error) {
    console.error('Error updating user balance:', error)
    throw error
  }
}

// Transaction operations
export async function createTransaction(data: Omit<Transaction, 'id'>): Promise<Transaction> {
  try {
    const now = new Date()
    const transactionData = {
      ...data,
      createdAt: now,
    }
    const newDocRef = doc(collection(db, COLLECTIONS.TRANSACTIONS))
    await setDoc(newDocRef, transactionData)
    return { id: newDocRef.id, ...transactionData } as Transaction
  } catch (error) {
    console.error('Error creating transaction:', error)
    throw error
  }
}

export async function getUserTransactions(userId: string): Promise<Transaction[]> {
  try {
    const q = query(
      collection(db, COLLECTIONS.TRANSACTIONS),
      where('fromId', '==', userId),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Transaction[]
  } catch (error) {
    console.error('Error getting transactions:', error)
    throw error
  }
}

export async function getAllTransactions(): Promise<Transaction[]> {
  try {
    const q = query(
      collection(db, COLLECTIONS.TRANSACTIONS),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Transaction[]
  } catch (error) {
    console.error('Error getting all transactions:', error)
    throw error
  }
}

// Action operations
export async function getActions(): Promise<Action[]> {
  try {
    const q = query(
      collection(db, COLLECTIONS.ACTIONS),
      orderBy('createdAt', 'asc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Action[]
  } catch (error) {
    console.error('Error getting actions:', error)
    throw error
  }
}

// Shop item operations
export async function getShopItems(): Promise<ShopItem[]> {
  try {
    const q = query(
      collection(db, COLLECTIONS.SHOP_ITEMS),
      orderBy('name', 'asc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ShopItem[]
  } catch (error) {
    console.error('Error getting shop items:', error)
    throw error
  }
}
