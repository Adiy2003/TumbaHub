'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const successMessage = searchParams.get('success')

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (!result?.ok || result?.error) {
        // Show meaningful error messages
        if (result?.error === 'No user found with this email') {
          setError('No account found with this email address')
        } else if (result?.error === 'Invalid password') {
          setError('Invalid password. Please try again.')
        } else if (result?.error === 'Email and password are required') {
          setError('Email and password are required')
        } else if (result?.error === 'User data not found') {
          setError('Account configuration error. Please contact support.')
        } else if (result?.error === 'Authentication service not configured') {
          setError('Service temporarily unavailable. Please try again.')
        } else if (result?.error?.includes('configuration')) {
          setError('Service temporarily unavailable. Please try again.')
        } else {
          setError(result?.error || 'Invalid email or password')
        }
        setLoading(false)
        return
      }

      // Wait a moment to ensure session is established
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Redirect to home
      router.push('/')
      router.refresh()
    } catch (err) {
      console.error('Login error:', err)
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-coins to-yellow-400 bg-clip-text text-transparent">
            TumbaHub
          </h1>
          <p className="text-dark-400 mt-2">Welcome back</p>
        </div>

        {/* Form */}
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-8">
          {successMessage && (
            <div className="bg-green-900/20 border border-green-700 text-green-400 px-4 py-3 rounded-lg text-sm mb-6">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-900/20 border border-red-700 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-dark-400 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white placeholder-dark-600 focus:outline-none focus:border-coins focus:ring-1 focus:ring-coins"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-dark-400 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white placeholder-dark-600 focus:outline-none focus:border-coins focus:ring-1 focus:ring-coins"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-coins text-dark-900 font-semibold py-2 rounded-lg hover:bg-yellow-300 transition-colors disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>

          <p className="text-center text-dark-400 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="text-coins hover:text-yellow-300 font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}
