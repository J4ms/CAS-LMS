import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Send, Loader2, Plus, X, Users, GraduationCap, BookOpen } from 'lucide-react'
import { getMessages, getUsers, createMessage } from '../../services/api'
import { useAuth } from '../../context/AuthContext'

interface Message {
  id: number
  senderId: number
  receiverId: number
  content: string
  timestamp: string
  read: boolean
}

interface User {
  id: number
  name: string
  email: string
  role: string
}

const roleIcons: Record<string, typeof Users> = {
  admin: Users,
  teacher: BookOpen,
  student: GraduationCap,
}

const roleColors: Record<string, string> = {
  admin: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  teacher: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  student: 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300',
}

export default function MessagesPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [showNewConvo, setShowNewConvo] = useState(false)
  const [searchUsers, setSearchUsers] = useState('')
  const [searchConvo, setSearchConvo] = useState('')
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchData()
  }, [user])

  const fetchData = async () => {
    if (!user) return
    try {
      const [messagesRes, usersRes] = await Promise.all([getMessages(), getUsers()])
      setMessages(messagesRes.data)
      setUsers(usersRes.data.filter((u: User) => u.id !== user.id))
    } catch (err) {
      console.error('Failed to fetch messages:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, selectedUser])

  const getConversations = () => {
    const convMap = new Map<number, { user: User; lastMessage: Message; unread: number }>()

    messages.forEach((msg) => {
      if (msg.senderId !== user?.id && msg.receiverId !== user?.id) return
      const otherId = msg.senderId === user?.id ? msg.receiverId : msg.senderId
      const otherUser = users.find((u) => u.id === otherId)
      if (!otherUser) return

      const existing = convMap.get(otherId)
      if (!existing || new Date(msg.timestamp) > new Date(existing.lastMessage.timestamp)) {
        const unreadCount = messages.filter(
          (m) => m.senderId === otherId && m.receiverId === user?.id && !m.read
        ).length
        convMap.set(otherId, { user: otherUser, lastMessage: msg, unread: unreadCount })
      }
    })

    return Array.from(convMap.values()).sort(
      (a, b) => new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime()
    )
  }

  const getConversationMessages = () => {
    if (!selectedUser) return []
    return messages.filter(
      (m) =>
        (m.senderId === user?.id && m.receiverId === selectedUser.id) ||
        (m.senderId === selectedUser.id && m.receiverId === user?.id)
    ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
  }

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedUser || !user) return
    try {
      const msg = {
        senderId: user.id,
        receiverId: selectedUser.id,
        content: newMessage.trim(),
        timestamp: new Date().toISOString(),
        read: false,
      }
      const res = await createMessage(msg)
      setMessages([...messages, res.data])
      setNewMessage('')
    } catch (err) {
      console.error('Failed to send message:', err)
    }
  }

  const startConversation = (targetUser: User) => {
    setSelectedUser(targetUser)
    setShowNewConvo(false)
    setSearchUsers('')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    )
  }

  const conversations = getConversations()
  const chatMessages = getConversationMessages()

  const filteredConversations = searchConvo
    ? conversations.filter((c) => c.user.name.toLowerCase().includes(searchConvo.toLowerCase()))
    : conversations

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchUsers.toLowerCase()) ||
    u.email.toLowerCase().includes(searchUsers.toLowerCase())
  )

  const formatTime = (ts: string) => {
    const d = new Date(ts)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    if (diff < 60000) return 'now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
    if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex h-[calc(100vh-200px)] bg-white dark:bg-dark-800 rounded-2xl border border-gray-100 dark:border-dark-600 overflow-hidden"
    >
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-100 dark:border-dark-600 flex flex-col">
        <div className="p-4 border-b border-gray-100 dark:border-dark-600">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Messages</h3>
            <button
              onClick={() => setShowNewConvo(true)}
              className="p-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
              title="New conversation"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchConvo}
              onChange={(e) => setSearchConvo(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-dark-700 border border-gray-100 dark:border-dark-500 rounded-lg text-sm dark:text-gray-300 focus:outline-none focus:border-primary-300"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 && (
            <div className="p-6 text-center">
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-3">No conversations yet</p>
              <button
                onClick={() => setShowNewConvo(true)}
                className="text-xs text-primary-600 dark:text-primary-400 font-medium"
              >
                Start a new conversation
              </button>
            </div>
          )}
          {filteredConversations.map((conv) => {
            const RoleIcon = roleIcons[conv.user.role] || Users
            return (
              <div
                key={conv.user.id}
                onClick={() => setSelectedUser(conv.user)}
                className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-dark-700 cursor-pointer transition-colors ${
                  selectedUser?.id === conv.user.id ? 'bg-primary-50/50 dark:bg-primary-900/20' : ''
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${roleColors[conv.user.role]}`}>
                  <RoleIcon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{conv.user.name}</span>
                    <span className="text-[10px] text-gray-400">{formatTime(conv.lastMessage.timestamp)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400 truncate max-w-[160px]">{conv.lastMessage.content}</p>
                    <span className="text-[9px] text-gray-400 capitalize bg-gray-100 dark:bg-dark-600 px-1.5 py-0.5 rounded">{conv.user.role}</span>
                  </div>
                </div>
                {conv.unread > 0 && (
                  <span className="w-5 h-5 bg-primary-600 text-white text-[10px] font-medium rounded-full flex items-center justify-center flex-shrink-0">
                    {conv.unread}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            <div className="p-4 border-b border-gray-100 dark:border-dark-600 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${roleColors[selectedUser.role]}`}>
                <span className="text-sm font-medium">{selectedUser.name.charAt(0)}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedUser.name}</p>
                <p className="text-xs text-gray-400 capitalize">{selectedUser.role}</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-gray-400 dark:text-gray-500">No messages yet. Say hello!</p>
                </div>
              )}
              {chatMessages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${
                    msg.senderId === user?.id
                      ? 'bg-primary-600 text-white rounded-br-md'
                      : 'bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-bl-md'
                  }`}>
                    <p>{msg.content}</p>
                    <p className={`text-[10px] mt-1 ${msg.senderId === user?.id ? 'text-white/60' : 'text-gray-400'}`}>
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </motion.div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="p-4 border-t border-gray-100 dark:border-dark-600">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-dark-700 border border-gray-100 dark:border-dark-500 rounded-xl text-sm dark:text-gray-300 focus:outline-none focus:border-primary-300"
                />
                <button
                  onClick={handleSend}
                  disabled={!newMessage.trim()}
                  className="bg-primary-600 text-white p-2.5 rounded-xl hover:bg-primary-700 disabled:opacity-50 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 bg-gray-100 dark:bg-dark-700 rounded-full flex items-center justify-center">
              <Send className="w-7 h-7 text-gray-300 dark:text-gray-600" />
            </div>
            <p className="text-sm text-gray-400 dark:text-gray-500">Select a conversation or start a new one</p>
            <button
              onClick={() => setShowNewConvo(true)}
              className="text-xs text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700"
            >
              New Conversation
            </button>
          </div>
        )}
      </div>

      {/* New Conversation Modal */}
      <AnimatePresence>
        {showNewConvo && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNewConvo(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="bg-white dark:bg-dark-800 rounded-2xl border border-gray-200 dark:border-dark-600 shadow-xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-dark-600">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">New Conversation</h3>
                  <button onClick={() => setShowNewConvo(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-4">
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      value={searchUsers}
                      onChange={(e) => setSearchUsers(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-50 dark:bg-dark-700 border border-gray-100 dark:border-dark-500 rounded-xl text-sm dark:text-gray-300 focus:outline-none focus:border-primary-300"
                      autoFocus
                    />
                  </div>
                  <div className="max-h-72 overflow-y-auto space-y-1">
                    {filteredUsers.map((u) => {
                      const RoleIcon = roleIcons[u.role] || Users
                      return (
                        <button
                          key={u.id}
                          onClick={() => startConversation(u)}
                          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors text-left"
                        >
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center ${roleColors[u.role]}`}>
                            <RoleIcon className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{u.name}</p>
                            <p className="text-xs text-gray-400">{u.email}</p>
                          </div>
                          <span className="text-[10px] text-gray-400 capitalize bg-gray-100 dark:bg-dark-600 px-2 py-0.5 rounded-full">{u.role}</span>
                        </button>
                      )
                    })}
                    {filteredUsers.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-4">No users found</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
