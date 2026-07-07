import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { criarCliente, atualizarCliente, buscarCliente } from '../../api/clientes'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Card, CardBody } from '../../components/ui/Card'
import { Spinner } from '../../components/ui/Spinner'

export function ClienteForm() {
  const { id } = useParams()
  const editing = !!id
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    nome: '', email: '', telefone: '', modeloVeiculo: '', placa: ''
  })

  const { data: existing, isLoading } = useQuery({
    queryKey: ['cliente', id], queryFn: () => buscarCliente(id!), enabled: editing,
  })

  useEffect(() => {
    if (existing) {
      setForm({
        nome: existing.nome, email: existing.email ?? '', telefone: existing.telefone,
        modeloVeiculo: existing.modeloVeiculo, placa: existing.placa
      })
    }
  }, [existing])

  const { mutate: salvar, isPending } = useMutation({
    mutationFn: () => {
      const payload = { ...form, email: form.email || undefined }
      if (editing) return atualizarCliente(id!, payload)
      return criarCliente(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] })
      navigate('/clientes')
    },
    onError: (err: any) => setError(err?.response?.data?.message ?? 'Erro ao salvar.')
  })

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }))

  if (editing && isLoading) return <div className="flex justify-center py-20"><Spinner /></div>

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/clientes')} className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
             <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-semibold text-gray-900">{editing ? 'Editar Cliente' : 'Novo Cliente'}</h1>
      </div>

      <Card>
        <CardBody className="flex flex-col gap-4">
          <Input label="Nome do proprietário" value={form.nome} onChange={(e) => set('nome', e.target.value)} required />
          
          <div className="grid grid-cols-2 gap-3">
            <Input label="Telefone (WhatsApp)" value={form.telefone} onChange={(e) => set('telefone', e.target.value)} required placeholder="Ex: 5584999999999" />
            <Input label="E-mail (Opcional)" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Modelo do Veículo" value={form.modeloVeiculo} onChange={(e) => set('modeloVeiculo', e.target.value)} required placeholder="Ex: Honda Civic 2021" />
            <Input label="Placa" value={form.placa} onChange={(e) => set('placa', e.target.value.toUpperCase())} required placeholder="Ex: ABC-1234" />
          </div>

          {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => navigate('/clientes')}>Cancelar</Button>
            <Button loading={isPending} onClick={() => salvar()}>{editing ? 'Salvar' : 'Cadastrar'}</Button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}