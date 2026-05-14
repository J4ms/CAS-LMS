import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { BookOpen, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      const user = await login(email, password)
      // Route based on role
      if (user.role === 'admin') {
        navigate('/dashboard/admin')
      } else if (user.role === 'teacher') {
        navigate('/dashboard/teacher')
      } else {
        navigate('/dashboard/student')
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'Network Error') {
        setError('Cannot connect to server. Make sure to run: npm run server')
      } else {
        setError('Invalid email or password. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 bg-white dark:bg-dark-800 bg-pattern"
      >
        <div className="max-w-md w-full mx-auto">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 mb-16"
          >
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">CAS</span>
          </motion.div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
              Hello,
              <br />
              Welcome Back
            </h1>
            <p className="text-gray-400 dark:text-gray-500 mb-10">
              Hey, welcome back to your learning space
            </p>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-lg"
              >
                {error}
              </motion.div>
            )}

            <div>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 border border-gray-200 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 border border-gray-200 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">Remember me</span>
              </label>
              <a href="/forgot-password" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600">
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-fit bg-primary-600 text-white px-8 py-3 rounded-xl text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Sign In
            </button>
          </motion.form>

          {/* Demo credentials */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 p-4 bg-gray-50 dark:bg-dark-700 rounded-xl"
          >
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-2">Demo Accounts:</p>
            <div className="space-y-1 text-xs text-gray-400 dark:text-gray-500">
              <p><span className="text-gray-600 dark:text-gray-300">Admin:</span> admin@cas.edu / admin123</p>
              <p><span className="text-gray-600 dark:text-gray-300">Teacher:</span> teacher@cas.edu / teacher123</p>
              <p><span className="text-gray-600 dark:text-gray-300">Student:</span> student@cas.edu / student123</p>
            </div>
          </motion.div>

          <p className="mt-8 text-sm text-gray-400 dark:text-gray-500">
            Don't have an account?{' '}
            <Link to="/" className="text-primary-600 font-medium hover:text-primary-700">
              Sign Up
            </Link>
          </p>

          {/* Developed by */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-8 pt-6 border-t border-gray-100 dark:border-dark-600">
            <Link to="/team" className="flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              <span>Developed by</span>
              <span className="font-semibold text-gray-600 dark:text-gray-300">CAS Dev Team</span>
              <span>→</span>
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Right side - Illustration */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-500 via-primary-700 to-dark-800 items-center justify-center p-12 relative overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <motion.div
            animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-20 left-10 w-32 h-16 bg-white/10 rounded-full blur-xl"
          />
          <motion.div
            animate={{ y: [0, 15, 0], x: [0, -10, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-32 right-10 w-40 h-20 bg-white/10 rounded-full blur-xl"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/3 right-16 w-20 h-10 bg-white/5 rounded-full blur-md"
          />
        </div>

        {/* Central content */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="relative z-10 text-center"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="w-48 h-48 bg-white/10 backdrop-blur-sm rounded-3xl mx-auto mb-8 flex items-center justify-center border border-white/20"
          >
            <BookOpen className="w-20 h-20 text-white/80" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-3">CAS Learning</h2>
          <p className="text-white/60 text-sm max-w-xs mx-auto">
            Access your courses, track your progress, and connect with your learning community.
          </p>

          {/* Lock icon */}
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            className="absolute -right-4 top-1/2 w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20"
          >
            <svg className="w-8 h-8 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
