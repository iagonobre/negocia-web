import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { criarPaciente, atualizarPaciente, buscarPaciente } from '../../api/pacientes'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Card, CardBody } from '../../components/ui/Card'
import { Spinner } from '../../components/ui/Spinner'

export function PacienteForm() {
  const { id } = useParams()
  const editing = !!id
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf: '',
    convenio: '',
  })

  const { data: existing, isLoading: loadingExisting } = useQuery({
    queryKey: ['paciente', id],
    queryFn: () => buscarPaciente(id!),
    enabled: editing,
  })

  useEffect(() => {
    if (existing) {
      setForm({
        nome: existing.nome,
        email: existing.email ?? '',
        telefone: existing.telefone,
        cpf: existing.cpf ?? '',
        convenio: existing.convenio ?? '',
      })
    }
  }, [existing])

  const { mutate: salvar, isPending } = useMutation({
    mutationFn: () => {
      const payload = {
        nome: form.nome,
        email: form.email || undefined,
        telefone: form.telefone,
        cpf: form.cpf || undefined,
        convenio: form.convenio || undefined,
      }
      if (editing) return atualizarPaciente(id!, payload)
      return criarPaciente(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pacientes'] })
      navigate('/pacientes')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message
      setError(Array.isArray(msg) ? msg[0] : (msg ?? 'Erro ao salvar paciente.'))
    },
  })

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }))

  if (editing && loadingExisting) return <div className="flex justify-center py-20"><Spinner /></div>

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/pacientes')} className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-semibold text-gray-900">{editing ? 'Editar paciente' : 'Novo paciente'}</h1>
      </div>

      <Card>
        <CardBody className="flex flex-col gap-4">
          <Input label="Nome completo" value={form.nome} onChange={(e) => set('nome', e.target.value)} required placeholder="Maria Silva" />
          
          <div className="grid grid-cols-2 gap-3">
            <Input label="E-mail" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="maria@email.com" />
            <Input label="Telefone" value={form.telefone} onChange={(e) => set('telefone', e.target.value)} required placeholder="5584999990001" hint="Formato internacional sem +" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="CPF" value={form.cpf} onChange={(e) => set('cpf', e.target.value)} placeholder="12345678901" />
            <Input label="Convênio Médico" value={form.convenio} onChange={(e) => set('convenio', e.target.value)} placeholder="Unimed, Hapvida..." hint="Deixe em branco se particular" />
          </div>

          {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => navigate('/pacientes')}>Cancelar</Button>
            <Button loading={isPending} onClick={() => salvar()}>
              {editing ? 'Salvar alterações' : 'Cadastrar paciente'}
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}