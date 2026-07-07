import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { criarServico, atualizarServico, buscarServico } from '../../api/servico-config'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Card, CardBody } from '../../components/ui/Card'
import { Spinner } from '../../components/ui/Spinner'

export function ServicoConfigForm() {
  const { id } = useParams()
  const editing = !!id
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [error, setError] = useState('')

  const [form, setForm] = useState({ descricao: '', prazoRevisaoDias: '', tomComunicacao: '', mensagemInicial: '' })

  const { data: existing, isLoading } = useQuery({ queryKey: ['servico', id], queryFn: () => buscarServico(id!), enabled: editing })

  useEffect(() => {
    if (existing) setForm({ descricao: existing.descricao, prazoRevisaoDias: String(existing.prazoRevisaoDias), tomComunicacao: existing.tomComunicacao, mensagemInicial: existing.mensagemInicial ?? '' })
  }, [existing])

  const { mutate: salvar, isPending } = useMutation({
    mutationFn: () => {
      const payload = { descricao: form.descricao, prazoRevisaoDias: Number(form.prazoRevisaoDias), tomComunicacao: form.tomComunicacao, mensagemInicial: form.mensagemInicial || undefined }
      if (editing) return atualizarServico(id!, payload)
      return criarServico(payload)
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['servico-configs'] }); navigate('/servico-config') },
    onError: (err: any) => setError(err?.response?.data?.message ?? 'Erro ao salvar.')
  })

  if (editing && isLoading) return <div className="flex justify-center py-20"><Spinner /></div>

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/servico-config')} className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="text-xl font-semibold text-gray-900">{editing ? 'Editar Serviço' : 'Novo Serviço'}</h1>
      </div>
      <Card>
        <CardBody className="flex flex-col gap-4">
          <Input label="Descrição do Serviço" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} required placeholder="Ex: Revisão de 10.000 km" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Prazo (dias)" type="number" value={form.prazoRevisaoDias} onChange={(e) => setForm({ ...form, prazoRevisaoDias: e.target.value })} required placeholder="Ex: 180" />
            <Input label="Tom da IA" value={form.tomComunicacao} onChange={(e) => setForm({ ...form, tomComunicacao: e.target.value })} required placeholder="Ex: amigável e prestativo" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Mensagem Inicial (Opcional)</label>
            <textarea className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100" rows={3} value={form.mensagemInicial} onChange={(e) => setForm({ ...form, mensagemInicial: e.target.value })} placeholder="Ex: Olá! Está na hora da revisão..." />
          </div>
          {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => navigate('/servico-config')}>Cancelar</Button>
            <Button loading={isPending} onClick={() => salvar()}>{editing ? 'Salvar' : 'Criar'}</Button>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}