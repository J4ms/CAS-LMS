import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, ArrowLeft, Loader2, CheckCircle } from 'lucide-react'
import { getUsers, createNotification } from '../services/api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email) {
      setError('Please enter your email address')
      return
    }

    setLoading(true)
    try {
      // Check if user exists
      const res = await getUsers()
      const user = res.data.find((u: { email: string }) => u.email === email)

      if (!user) {
        setError('No account found with this email address.')
        setLoading(false)
        return
      }

      // Find admin to notify
      const admin = res.data.find((u: { role: string }) => u.role === 'admin')
      if (admin) {
        await createNotification({
          userId: admin.id,
          title: 'Password Reset Request',
          message: `${user.name} (${user.email}) is requesting a password reset.`,
          type: 'system',
          read: false,
          createdAt: new Date().toISOString(),
        })
      }

      setSent(true)
    } catch {
      setError('Cannot connect to server. Make sure the server is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-900 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-100 dark:border-dark-600 p-8 shadow-sm">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">CAS</span>
          </div>

          {sent ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Request Sent</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Your password reset request has been sent to the administrator. They will contact you with further instructions.
              </p>
              <Link to="/login" className="inline-flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700">
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </Link>
            </motion.div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Forgot Password?</h2>
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
                Enter your email and we'll notify the administrator to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                    placeholder="Enter your email"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-600 text-white py-3 rounded-xl text-sm font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Send Reset Request
                </button>
              </form>

              <Link to="/login" className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 hover:text-primary-600 mt-6">
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
