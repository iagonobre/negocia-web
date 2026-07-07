import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { criarDevedor, atualizarDevedor, buscarDevedor } from '../../api/devedores'
import { useAuth } from '../../contexts/AuthContext'
import { Input } from '../../components/ui/Input'
import { Select } from '../../components/ui/Select'
import { Button } from '../../components/ui/Button'
import { Card, CardBody } from '../../components/ui/Card'
import { Spinner } from '../../components/ui/Spinner'

const tipoPessoaOpts = [
  { value: 'FISICA', label: 'Pessoa Física' },
  { value: 'JURIDICA', label: 'Pessoa Jurídica' },
]

const statusOpts = [
  { value: 'PENDENTE', label: 'Pendente' },
  { value: 'EM_NEGOCIACAO', label: 'Em negociação' },
  { value: 'ACORDADO', label: 'Acordado' },
  { value: 'PAGO', label: 'Pago' },
  { value: 'SEM_RESPOSTA', label: 'Sem resposta' },
  { value: 'RECUSADO', label: 'Recusado' },
]

export function DevedorForm() {
  const { id } = useParams()
  const editing = !!id
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    tipoPessoa: 'FISICA' as 'FISICA' | 'JURIDICA',
    cpf: '',
    cnpj: '',
    valorDivida: '',
    descricaoDivida: '',
    vencimento: '',
    status: 'PENDENTE' as string,
  })

  const { data: existing, isLoading: loadingExisting } = useQuery({
    queryKey: ['devedor', id],
    queryFn: () => buscarDevedor(id!),
    enabled: editing,
  })

  useEffect(() => {
    if (existing) {
      setForm({
        nome: existing.nome,
        email: existing.email ?? '',
        telefone: existing.telefone,
        tipoPessoa: existing.tipoPessoa,
        cpf: existing.cpf ?? '',
        cnpj: existing.cnpj ?? '',
        valorDivida: String(existing.valorDivida),
        descricaoDivida: existing.descricaoDivida ?? '',
        vencimento: existing.vencimento.slice(0, 10),
        status: existing.status,
      })
    }
  }, [existing])

  const { mutate: salvar, isPending } = useMutation({
    mutationFn: () => {
      const base = {
        nome: form.nome,
        email: form.email || undefined,
        telefone: form.telefone,
        tipoPessoa: form.tipoPessoa,
        cpf: form.cpf || undefined,
        cnpj: form.cnpj || undefined,
        valorDivida: parseFloat(form.valorDivida),
        descricaoDivida: form.descricaoDivida || undefined,
        vencimento: form.vencimento,
        status: form.status as 'PENDENTE',
        origem: 'API' as const,
        empresaId: user!.id,
      }
      if (editing) return atualizarDevedor(id!, base)
      return criarDevedor({ ...base, tentativas: 0 })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devedores'] })
      navigate('/devedores')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message
      setError(Array.isArray(msg) ? msg[0] : (msg ?? 'Erro ao salvar devedor.'))
    },
  })

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }))

  if (editing && loadingExisting) return <div className="flex justify-center py-20"><Spinner /></div>

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/devedores')} className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-semibold text-gray-900">{editing ? 'Editar devedor' : 'Novo devedor'}</h1>
      </div>

      <Card>
        <CardBody className="flex flex-col gap-4">
          <Input label="Nome completo" value={form.nome} onChange={(e) => set('nome', e.target.value)} required placeholder="João da Silva" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="E-mail" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="joao@email.com" />
            <Input label="Telefone" value={form.telefone} onChange={(e) => set('telefone', e.target.value)} required placeholder="5584999990001" hint="Formato internacional sem +" />
          </div>

          <Select
            label="Tipo de pessoa"
            options={tipoPessoaOpts}
            value={form.tipoPessoa}
            onChange={(e) => set('tipoPessoa', e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            {form.tipoPessoa === 'FISICA' ? (
              <Input label="CPF" value={form.cpf} onChange={(e) => set('cpf', e.target.value)} placeholder="12345678901" />
            ) : (
              <Input label="CNPJ" value={form.cnpj} onChange={(e) => set('cnpj', e.target.value)} placeholder="12345678000190" />
            )}
            <Input label="Valor da dívida (R$)" type="number" step="0.01" value={form.valorDivida} onChange={(e) => set('valorDivida', e.target.value)} required placeholder="300.00" />
          </div>

          <Input label="Vencimento" type="date" value={form.vencimento} onChange={(e) => set('vencimento', e.target.value)} required />

          <Input label="Descrição da dívida" value={form.descricaoDivida} onChange={(e) => set('descricaoDivida', e.target.value)} placeholder="Fatura em atraso (opcional)" />

          {editing && (
            <Select
              label="Status"
              options={statusOpts}
              value={form.status}
              onChange={(e) => set('status', e.target.value)}
            />
          )}

          {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => navigate('/devedores')}>Cancelar</Button>
            <Button loading={isPending} onClick={() => salvar()}>
              {editing ? 'Salvar alterações' : 'Cadastrar devedor'}
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
