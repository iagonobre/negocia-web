import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { criarConfigRetorno, atualizarConfigRetorno, buscarConfigRetorno } from '../../api/config-retorno'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Card, CardBody } from '../../components/ui/Card'
import { Spinner } from '../../components/ui/Spinner'

export function ConfigRetornoForm() {
  const { id } = useParams()
  const editing = !!id
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    descricao: '',
    diasParaRetorno: '',
    tomComunicacao: '',
    mensagemInicial: '',
  })

  const { data: existing, isLoading } = useQuery({
    queryKey: ['config-retorno', id],
    queryFn: () => buscarConfigRetorno(id!),
    enabled: editing,
  })

  useEffect(() => {
    if (existing) {
      setForm({
        descricao: existing.descricao,
        diasParaRetorno: String(existing.diasParaRetorno),
        tomComunicacao: existing.tomComunicacao,
        mensagemInicial: existing.mensagemInicial ?? '',
      })
    }
  }, [existing])

  const { mutate: salvar, isPending } = useMutation({
    mutationFn: () => {
      const payload = {
        descricao: form.descricao,
        diasParaRetorno: Number(form.diasParaRetorno),
        tomComunicacao: form.tomComunicacao,
        mensagemInicial: form.mensagemInicial || undefined,
      }
      if (editing) return atualizarConfigRetorno(id!, payload)
      return criarConfigRetorno(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config-retornos'] })
      navigate('/config-retorno')
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message
      setError(Array.isArray(msg) ? msg[0] : (msg ?? 'Erro ao salvar.'))
    },
  })

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }))

  if (editing && isLoading) return <div className="flex justify-center py-20"><Spinner /></div>

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/config-retorno')} className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-semibold text-gray-900">{editing ? 'Editar Regra' : 'Nova Regra'}</h1>
      </div>

      <Card>
        <CardBody className="flex flex-col gap-4">
          <Input label="Descrição" value={form.descricao} onChange={(e) => set('descricao', e.target.value)} required placeholder="Ex: Retorno pós-cirurgia" />
          
          <div className="grid grid-cols-2 gap-3">
            <Input label="Prazo para Retorno (dias)" type="number" value={form.diasParaRetorno} onChange={(e) => set('diasParaRetorno', e.target.value)} required placeholder="Ex: 30" />
            <Input label="Tom de Comunicação" value={form.tomComunicacao} onChange={(e) => set('tomComunicacao', e.target.value)} required placeholder="Ex: acolhedor e cuidadoso" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Mensagem Inicial (Opcional)</label>
            <textarea
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              rows={3}
              value={form.mensagemInicial}
              onChange={(e) => set('mensagemInicial', e.target.value)}
              placeholder="Ex: Olá! Está na hora do seu retorno..."
            />
          </div>

          {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => navigate('/config-retorno')}>Cancelar</Button>
            <Button loading={isPending} onClick={() => salvar()}>
              {editing ? 'Salvar alterações' : 'Criar regra'}
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}