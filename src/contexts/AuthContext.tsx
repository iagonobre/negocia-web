import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { login as apiLogin, cadastrar as apiCadastrar, type LoginPayload, type CadastroPayload } from '../api/auth'

interface EmpresaUser {
  id: string
  nome: string
  email: string
}

interface AuthContextValue {
  user: EmpresaUser | null
  token: string | null
  isLoading: boolean
  login: (payload: LoginPayload) => Promise<void>
  cadastrar: (payload: CadastroPayload) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<EmpresaUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedToken = localStorage.getItem('access_token')
    const savedUser = localStorage.getItem('empresa')
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (payload: LoginPayload) => {
    const data = await apiLogin(payload)
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('empresa', JSON.stringify(data.empresa))
    setToken(data.access_token)
    setUser(data.empresa)
  }

  const cadastrar = async (payload: CadastroPayload) => {
    await apiCadastrar(payload)
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('empresa')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, cadastrar, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
