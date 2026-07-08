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
    e.preventDefault(); setLoading(true); setError('')
    try { await login({ email, senha }); navigate('/clientes') }
    catch (err: any) { setError(err?.response?.data?.message ?? 'Email ou senha inválidos') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-1 bg-amber-600 flex-col justify-between p-12">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </div>
          <span className="text-white font-semibold text-lg">OficinaIA</span>
        </div>
        <div>
          <h1 className="text-white text-3xl font-semibold leading-tight mb-4">Revisões agendadas<br />com inteligência artificial</h1>
          <p className="text-amber-100 text-sm leading-relaxed">Automatize sua oficina. O agente de IA entra em contato com seus clientes via WhatsApp quando o prazo de revisão chega.</p>
        </div>
        <p className="text-amber-200 text-xs">© 2026 OficinaIA. Todos os direitos reservados.</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900">Entrar</h2>
            <p className="text-sm text-gray-500 mt-1">Acesse o painel da sua oficina</p>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input label="E-mail" type="email" placeholder="oficina@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input label="Senha" type="password" placeholder="••••••" value={senha} onChange={(e) => setSenha(e.target.value)} required />
            {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
            <Button type="submit" loading={loading} size="lg" className="mt-2">Entrar</Button>
          </form>
          <p className="mt-6 text-sm text-gray-500 text-center">Não tem conta? <Link to="/cadastro" className="text-amber-600 hover:underline font-medium">Cadastre sua oficina</Link></p>
        </div>
      </div>
    </div>
  )
}