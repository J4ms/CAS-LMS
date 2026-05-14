import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Lock, Sun, Moon, Monitor, Save, Loader2, Check } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { updateUser } from '../../services/api'

export default function SettingsPage() {
  const { user, login } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'appearance'>('profile')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Profile form
  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')

  // Password form
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  const handleSaveProfile = async () => {
    if (!user) return
    setSaving(true)
    try {
      await updateUser(user.id, { name, email })
      // Update local storage
      const updatedUser = { ...user, name, email }
      localStorage.setItem('cas-user', JSON.stringify(updatedUser))
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error('Failed to save profile:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    setPasswordError('')
    setPasswordSuccess('')

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Please fill in all fields')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return
    }
    if (!user) return

    setSaving(true)
    try {
      // Verify current password by trying to login
      await login(user.email, currentPassword)
      await updateUser(user.id, { password: newPassword })
      setPasswordSuccess('Password updated successfully')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      setPasswordError('Current password is incorrect')
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'password' as const, label: 'Password', icon: Lock },
    { id: 'appearance' as const, label: 'Appearance', icon: Sun },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Settings</h2>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Manage your account preferences</p>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex gap-1 bg-gray-100 dark:bg-dark-700 p-1 rounded-xl w-fit"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-white dark:bg-dark-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </motion.div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-100 dark:border-dark-600 p-6"
      >
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Profile Information</h3>
              <p className="text-sm text-gray-400 dark:text-gray-500">Update your personal details</p>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-primary-700 dark:text-primary-300">
                  {name.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{name}</p>
                <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>
        )}

        {activeTab === 'password' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Change Password</h3>
              <p className="text-sm text-gray-400 dark:text-gray-500">Update your password to keep your account secure</p>
            </div>

            {passwordError && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-lg">
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-sm px-4 py-3 rounded-lg">
                {passwordSuccess}
              </div>
            )}

            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-dark-500 dark:bg-dark-700 dark:text-white rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>

            <button
              onClick={handleChangePassword}
              disabled={saving}
              className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              Update Password
            </button>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">Appearance</h3>
              <p className="text-sm text-gray-400 dark:text-gray-500">Customize how CAS LMS looks for you</p>
            </div>

            <div className="grid grid-cols-3 gap-4 max-w-lg">
              <button
                onClick={() => { if (theme === 'dark') toggleTheme() }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  theme === 'light' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-dark-500 hover:border-gray-300'
                }`}
              >
                <Sun className={`w-6 h-6 mx-auto mb-2 ${theme === 'light' ? 'text-primary-600' : 'text-gray-400'}`} />
                <p className={`text-xs font-medium ${theme === 'light' ? 'text-primary-700 dark:text-primary-300' : 'text-gray-500 dark:text-gray-400'}`}>Light</p>
              </button>
              <button
                onClick={() => { if (theme === 'light') toggleTheme() }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  theme === 'dark' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-dark-500 hover:border-gray-300'
                }`}
              >
                <Moon className={`w-6 h-6 mx-auto mb-2 ${theme === 'dark' ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400'}`} />
                <p className={`text-xs font-medium ${theme === 'dark' ? 'text-primary-700 dark:text-primary-300' : 'text-gray-500 dark:text-gray-400'}`}>Dark</p>
              </button>
              <button
                className="p-4 rounded-xl border-2 border-gray-200 dark:border-dark-500 hover:border-gray-300 opacity-50 cursor-not-allowed"
              >
                <Monitor className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">System</p>
              </button>
            </div>

            <p className="text-xs text-gray-400 dark:text-gray-500">
              Current theme: <span className="font-medium capitalize text-gray-600 dark:text-gray-300">{theme}</span>
            </p>
          </div>
        )}
      </motion.div>
    </div>
  )
}
