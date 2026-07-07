import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'

export function Cadastro() {
  const { cadastrar } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState<1 | 2>(1)

  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    cnpj: '',
    telefone: '',
    endereco: {
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      estado: '',
    },
  })

  const set = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }))

  const setEnd = (field: string, value: string) =>
    setForm((f) => ({ ...f, endereco: { ...f.endereco, [field]: value } }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 1) { setStep(2); return }
    setLoading(true)
    setError('')
    try {
      await cadastrar({
        ...form,
        endereco: {
          ...form.endereco,
          complemento: form.endereco.complemento || undefined,
        },
      })
      navigate('/login')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message
      setError(Array.isArray(msg) ? msg[0] : (msg ?? 'Erro ao cadastrar. Tente novamente.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="font-semibold text-gray-900">NegocIA</span>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>1</div>
            <div className={`h-0.5 flex-1 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-100'}`} />
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>2</div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            {step === 1 ? 'Dados da empresa' : 'Endereço'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {step === 1 ? 'Passo 1 de 2 — Informações básicas' : 'Passo 2 de 2 — Localização da empresa'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {step === 1 && (
            <>
              <Input label="Nome da empresa" value={form.nome} onChange={(e) => set('nome', e.target.value)} required placeholder="Minha Empresa Ltda" />
              <Input label="E-mail" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} required placeholder="empresa@email.com" />
              <Input label="Senha" type="password" value={form.senha} onChange={(e) => set('senha', e.target.value)} required placeholder="Mínimo 6 caracteres" minLength={6} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="CNPJ" value={form.cnpj} onChange={(e) => set('cnpj', e.target.value)} required placeholder="00000000000000" />
                <Input label="Telefone" value={form.telefone} onChange={(e) => set('telefone', e.target.value)} required placeholder="5584999990000" />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Input label="CEP" value={form.endereco.cep} onChange={(e) => setEnd('cep', e.target.value)} required placeholder="59000-000" />
                <Input label="Número" value={form.endereco.numero} onChange={(e) => setEnd('numero', e.target.value)} required placeholder="100" />
              </div>
              <Input label="Logradouro" value={form.endereco.logradouro} onChange={(e) => setEnd('logradouro', e.target.value)} required placeholder="Rua das Flores" />
              <Input label="Complemento" value={form.endereco.complemento} onChange={(e) => setEnd('complemento', e.target.value)} placeholder="Sala 1 (opcional)" />
              <Input label="Bairro" value={form.endereco.bairro} onChange={(e) => setEnd('bairro', e.target.value)} required placeholder="Centro" />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Cidade" value={form.endereco.cidade} onChange={(e) => setEnd('cidade', e.target.value)} required placeholder="Natal" />
                <Input label="Estado (UF)" value={form.endereco.estado} onChange={(e) => setEnd('estado', e.target.value)} required placeholder="RN" maxLength={2} />
              </div>
            </>
          )}

          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-3 mt-2">
            {step === 2 && (
              <Button type="button" variant="secondary" onClick={() => setStep(1)} className="flex-1">
                Voltar
              </Button>
            )}
            <Button type="submit" loading={loading} size="lg" className="flex-1">
              {step === 1 ? 'Próximo' : 'Criar conta'}
            </Button>
          </div>
        </form>

        <p className="mt-6 text-sm text-gray-500 text-center">
          Já tem conta?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">Entrar</Link>
        </p>
      </div>
    </div>
  )
}
