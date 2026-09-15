import { createContext, useContext, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from './api'
import type { User } from './types'

interface AuthContextValue {
  user: User | null
  login: (email: string, password: string) => Promise<User>
  register: (fullName: string, email: string, password: string) => Promise<User>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('cloud-campus-user')
    return saved ? JSON.parse(saved) as User : null
  })

  const save = (data: { accessToken: string; user: User }) => {
    localStorage.setItem('cloud-campus-token', data.accessToken)
    localStorage.setItem('cloud-campus-user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  const login = async (email: string, password: string) => save((await authApi.login(email, password)).data.data)
  const register = async (fullName: string, email: string, password: string) => save((await authApi.register(fullName, email, password)).data.data)
  const logout = () => {
    localStorage.removeItem('cloud-campus-token')
    localStorage.removeItem('cloud-campus-user')
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside AuthProvider')
  return value
}

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  if (!user) {
    navigate('/login', { replace: true })
    return null
  }
  return children
}