import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useNotifications } from '../context/NotificationContext'
import NotificationsPanel from '../components/NotificationsPanel'
import {
  LayoutDashboard,
  MessageSquare,
  Calendar,
  ClipboardList,
  BookOpen,
  Users,
  GraduationCap,
  Search,
  Bell,
  Settings,
  LogOut,
  BookOpenCheck,
  Sun,
  Moon,
  Menu,
  X,
  Award,
  Home,
} from 'lucide-react'
import { useState } from 'react'

// Role-based sidebar links
const adminLinks = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '__DASHBOARD__', id: 'dash' },
  { icon: GraduationCap, label: 'Students', path: '/dashboard/students', id: 'students' },
  { icon: Users, label: 'Instructors', path: '/dashboard/instructors', id: 'instructors' },
  { icon: BookOpen, label: 'Courses', path: '/dashboard/courses', id: 'courses' },
  { icon: ClipboardList, label: 'Enrollments', path: '/dashboard/enrollments', id: 'enrollments' },
  { icon: Award, label: 'Grades', path: '/dashboard/grades', id: 'grades' },
  { icon: MessageSquare, label: 'Messages', path: '/dashboard/messages', id: 'messages' },
  { icon: Calendar, label: 'Calendar', path: '/dashboard/calendar', id: 'calendar' },
]

const teacherLinks = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '__DASHBOARD__', id: 'dash' },
  { icon: BookOpen, label: 'My Subjects', path: '/dashboard/courses', id: 'subjects' },
  { icon: GraduationCap, label: 'Students', path: '/dashboard/students', id: 'students' },
  { icon: Award, label: 'Grades', path: '/dashboard/grades', id: 'grades' },
  { icon: MessageSquare, label: 'Messages', path: '/dashboard/messages', id: 'messages' },
  { icon: Calendar, label: 'Calendar', path: '/dashboard/calendar', id: 'calendar' },
]

const studentLinks = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '__DASHBOARD__', id: 'dash' },
  { icon: BookOpen, label: 'My Courses', path: '/dashboard/my-courses', id: 'courses' },
  { icon: Award, label: 'My Grades', path: '/dashboard/grades', id: 'grades' },
  { icon: ClipboardList, label: 'Assessments', path: '/dashboard/assessments', id: 'assessments' },
  { icon: MessageSquare, label: 'Messages', path: '/dashboard/messages', id: 'messages' },
  { icon: Calendar, label: 'Calendar', path: '/dashboard/calendar', id: 'calendar' },
]

export default function DashboardLayout() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const { unreadCount } = useNotifications()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!user) {
    navigate('/login')
    return null
  }

  const dashboardPath = `/dashboard/${user.role}`

  const sidebarLinks = user.role === 'admin' ? adminLinks : user.role === 'teacher' ? teacherLinks : studentLinks

  const resolvedLinks = sidebarLinks.map((link) => ({
    ...link,
    path: link.path === '__DASHBOARD__' ? dashboardPath : link.path,
  }))

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-dark-900 bg-pattern transition-colors duration-300">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-dark-800 border-r border-gray-100 dark:border-dark-600 flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <BookOpenCheck className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">CAS LMS</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {resolvedLinks.map((link) => {
            const isActive = location.pathname === link.path ||
              (link.id === 'dash' && location.pathname.match(/^\/dashboard\/(admin|teacher|student)$/))
            return (
              <Link
                key={link.id}
                to={link.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-dark-700 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                <link.icon className={`w-5 h-5 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'}`} />
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom links */}
        <div className="px-4 pb-6 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors w-full rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/10"
          >
            <Home className="w-5 h-5" />
            Home
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors w-full rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white dark:bg-dark-800 border-b border-gray-100 dark:border-dark-600 px-4 md:px-8 py-4 flex items-center justify-between transition-colors duration-300">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {getPageTitle(location.pathname)}
            </h1>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            {/* Search */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search anything"
                className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-dark-700 border border-gray-100 dark:border-dark-500 rounded-xl text-sm text-gray-600 dark:text-gray-300 placeholder:text-gray-400 focus:outline-none focus:border-primary-300 w-64 transition-colors"
              />
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              <NotificationsPanel isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
            </div>

            {/* Settings */}
            <Link
              to="/dashboard/settings"
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700"
            >
              <Settings className="w-5 h-5" />
            </Link>

            {/* User info */}
            <div className="flex items-center gap-3 pl-3 border-l border-gray-100 dark:border-dark-600">
              <div className="w-9 h-9 bg-primary-100 dark:bg-primary-900/40 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                  {user.name.charAt(0)}
                </span>
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                <p className="text-xs text-gray-400 capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-8 min-h-full">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Outlet />
            </motion.div>
          </div>
        </main>

        {/* Dashboard Footer - Fixed at bottom */}
        <footer className="border-t border-gray-100 dark:border-dark-600 px-8 py-3 bg-white dark:bg-dark-800 flex-shrink-0">
            <div className="flex flex-col md:flex-row items-center justify-between gap-2">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                © 2026 CAS Learning Management System. All rights reserved.
              </p>
              <div className="flex items-center gap-4">
                <a href="/team" className="text-xs text-gray-400 dark:text-gray-500 hover:text-primary-600 transition-colors">Developed by CAS Dev Team</a>
                <a href="#" className="text-xs text-gray-400 dark:text-gray-500 hover:text-primary-600 transition-colors">Privacy Policy</a>
                <a href="#" className="text-xs text-gray-400 dark:text-gray-500 hover:text-primary-600 transition-colors">Terms</a>
              </div>
            </div>
        </footer>
      </div>
    </div>
  )
}

function getPageTitle(pathname: string): string {
  const titles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/dashboard/admin': 'Admin Dashboard',
    '/dashboard/teacher': 'Teacher Dashboard',
    '/dashboard/student': 'Student Dashboard',
    '/dashboard/courses': 'Courses',
    '/dashboard/students': 'Students',
    '/dashboard/messages': 'Messages',
    '/dashboard/calendar': 'Calendar',
    '/dashboard/enrollments': 'Enrollments',
    '/dashboard/instructors': 'Instructors',
    '/dashboard/settings': 'Settings',
    '/dashboard/grades': 'Grades',
    '/dashboard/my-courses': 'My Courses',
    '/dashboard/assessments': 'Assessments',
  }
  return titles[pathname] || 'Dashboard'
}
