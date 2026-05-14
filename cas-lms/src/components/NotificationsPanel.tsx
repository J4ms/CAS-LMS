import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, Check, CheckCheck, AlertTriangle, BookOpen, MessageSquare, Clock, UserPlus } from 'lucide-react'
import { useNotifications } from '../context/NotificationContext'

const typeIcons: Record<string, typeof Bell> = {
  enrollment: UserPlus,
  flag: AlertTriangle,
  completion: BookOpen,
  message: MessageSquare,
  deadline: Clock,
  system: Bell,
}

const typeColors: Record<string, string> = {
  enrollment: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  flag: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  completion: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  message: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  deadline: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  system: 'bg-gray-100 dark:bg-dark-600 text-gray-600 dark:text-gray-400',
}

interface Props {
  isOpen: boolean
  onClose: () => void
}

export default function NotificationsPanel({ isOpen, onClose }: Props) {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications()

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return date.toLocaleDateString()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
          />
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-12 w-96 bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-dark-600 shadow-xl z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-dark-600">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-primary-600 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 font-medium flex items-center gap-1"
                  >
                    <CheckCheck className="w-3 h-3" />
                    Mark all read
                  </button>
                )}
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-400 dark:text-gray-500">
                  No notifications yet
                </div>
              ) : (
                notifications.map((notification) => {
                  const Icon = typeIcons[notification.type] || Bell
                  const colorClass = typeColors[notification.type] || typeColors.system
                  return (
                    <div
                      key={notification.id}
                      className={`flex items-start gap-3 p-4 border-b border-gray-50 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors ${
                        !notification.read ? 'bg-primary-50/30 dark:bg-primary-900/10' : ''
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{notification.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{notification.message}</p>
                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{formatTime(notification.createdAt)}</p>
                      </div>
                      {!notification.read && (
                        <button
                          onClick={() => markRead(notification.id)}
                          className="text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 flex-shrink-0"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
