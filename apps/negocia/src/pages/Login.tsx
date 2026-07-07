import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login({ email, senha })
      navigate('/dashboard')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg ?? 'Email ou senha inválidos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-1 bg-blue-600 flex-col justify-between p-12">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-white font-semibold text-lg">NegocIA</span>
        </div>
        <div>
          <h1 className="text-white text-3xl font-semibold leading-tight mb-4">
            Recuperação de dívidas<br />com inteligência artificial
          </h1>
          <p className="text-blue-100 text-sm leading-relaxed">
            Automatize suas cobranças. O agente de IA negocia com seus clientes inadimplentes via WhatsApp, 24 horas por dia.
          </p>
        </div>
        <p className="text-blue-200 text-xs">© 2026 NegocIA. Todos os direitos reservados.</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6 lg:hidden">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-semibold text-gray-900">NegocIA</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Entrar</h2>
            <p className="text-sm text-gray-500 mt-1">Acesse o painel da sua empresa</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="E-mail"
              type="email"
              placeholder="empresa@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Senha"
              type="password"
              placeholder="••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />

            {error && (
              <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <Button type="submit" loading={loading} size="lg" className="mt-2">
              Entrar
            </Button>
          </form>

          <p className="mt-6 text-sm text-gray-500 text-center">
            Não tem conta?{' '}
            <Link to="/cadastro" className="text-blue-600 hover:underline font-medium">
              Cadastre sua empresa
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
