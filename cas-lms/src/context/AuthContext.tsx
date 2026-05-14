import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { loginUser } from '../services/api'

export type UserRole = 'admin' | 'teacher' | 'student'

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
  avatar?: string
  studentId?: string
  department?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<User>
  logout: () => void
  isAuthenticated: boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for saved session
    const saved = localStorage.getItem('cas-user')
    if (saved) {
      try {
        setUser(JSON.parse(saved))
      } catch {
        localStorage.removeItem('cas-user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<User> => {
    const userData = await loginUser(email, password)
    const userObj: User = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      avatar: userData.avatar,
      studentId: userData.studentId,
      department: userData.department,
    }
    setUser(userObj)
    localStorage.setItem('cas-user', JSON.stringify(userObj))
    return userObj
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('cas-user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
