'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
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
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to create account')
        return
      }

      // Redirect to login after successful signup
      router.push('/login?success=Account created successfully')
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
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
          <p className="text-dark-400 mt-2">Create your account</p>
        </div>

        {/* Form */}
        <div className="bg-dark-800 rounded-xl border border-dark-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-900/20 border border-red-700 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-dark-400 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full bg-dark-700 border border-dark-600 rounded-lg px-4 py-2 text-white placeholder-dark-600 focus:outline-none focus:border-coins focus:ring-1 focus:ring-coins"
                required
              />
            </div>

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

            <div>
              <label className="block text-sm font-medium text-dark-400 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
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
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-dark-400 mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-coins hover:text-yellow-300 font-medium">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
