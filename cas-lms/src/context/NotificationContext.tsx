import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { getNotifications, markNotificationRead, markAllNotificationsRead, createNotification } from '../services/api'
import { useAuth } from './AuthContext'

interface Notification {
  id: number
  userId: number
  title: string
  message: string
  type: string
  read: boolean
  createdAt: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  markRead: (id: number) => Promise<void>
  markAllRead: () => Promise<void>
  addNotification: (data: { title: string; message: string; type: string }) => Promise<void>
  refresh: () => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])

  const refresh = useCallback(async () => {
    if (!user) return
    try {
      const res = await getNotifications(user.id)
      setNotifications(res.data)
    } catch {
      // silent fail
    }
  }, [user])

  useEffect(() => {
    refresh()
    // Poll every 30 seconds
    const interval = setInterval(refresh, 30000)
    return () => clearInterval(interval)
  }, [refresh])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markRead = async (id: number) => {
    try {
      await markNotificationRead(id)
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n))
    } catch (err) {
      console.error('Failed to mark notification read:', err)
    }
  }

  const markAllRead = async () => {
    if (!user) return
    try {
      await markAllNotificationsRead(user.id)
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch (err) {
      console.error('Failed to mark all read:', err)
    }
  }

  const addNotification = async (data: { title: string; message: string; type: string }) => {
    if (!user) return
    try {
      const res = await createNotification({
        userId: user.id,
        ...data,
        read: false,
        createdAt: new Date().toISOString(),
      })
      setNotifications((prev) => [res.data, ...prev])
    } catch (err) {
      console.error('Failed to create notification:', err)
    }
  }

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markRead, markAllRead, addNotification, refresh }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}
