import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { criarFaixa, atualizarFaixa, buscarFaixa } from '../../api/faixas'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Card, CardBody } from '../../components/ui/Card'
import { Spinner } from '../../components/ui/Spinner'

export function FaixaForm() {
  const { id } = useParams()
  const editing = !!id
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    descricao: '',
    valorMinimo: '',
    valorMaximo: '',
    prazoMaximoDias: '',
    parcelasMaximas: '',
    descontoMaximo: '',
    tomComunicacao: 'formal',
    mensagemInicial: '',
  })

  const { data: existing, isLoading } = useQuery({
    queryKey: ['faixa', id],
    queryFn: () => buscarFaixa(id!),
    enabled: editing,
  })

  useEffect(() => {
    if (existing) {
      setForm({
        descricao: existing.descricao,
        valorMinimo: String(existing.valorMinimo),
        valorMaximo: String(existing.valorMaximo),
        prazoMaximoDias: String(existing.prazoMaximoDias),
        parcelasMaximas: String(existing.parcelasMaximas),
        descontoMaximo: String(existing.descontoMaximo),
        tomComunicacao: existing.tomComunicacao,
        mensagemInicial: existing.mensagemInicial ?? '',
      })
    }
  }, [existing])

  const { mutate: salvar, isPending } = useMutation({
    mutationFn: () => {
      const payload = {
        descricao: form.descricao,
        valorMinimo: parseFloat(form.valorMinimo),
        valorMaximo: parseFloat(form.valorMaximo),
        prazoMaximoDias: parseInt(form.prazoMaximoDias),
        parcelasMaximas: parseInt(form.parcelasMaximas),
        descontoMaximo: parseFloat(form.descontoMaximo),
        tomComunicacao: form.tomComunicacao,
        mensagemInicial: form.mensagemInicial || undefined,
      }
      return editing ? atualizarFaixa(id!, payload) : criarFaixa(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faixas'] })
      navigate('/faixas')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message
      setError(Array.isArray(msg) ? msg[0] : (msg ?? 'Erro ao salvar faixa.'))
    },
  })

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }))

  if (editing && isLoading) return <div className="flex justify-center py-20"><Spinner /></div>

  return (
    <div className="flex flex-col gap-6 max-w-xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/faixas')} className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-semibold text-gray-900">{editing ? 'Editar faixa' : 'Nova faixa de critério'}</h1>
      </div>

      <Card>
        <CardBody className="flex flex-col gap-4">
          <Input label="Descrição" value={form.descricao} onChange={(e) => set('descricao', e.target.value)} required placeholder="ex: Dívidas pequenas" />

          <div className="grid grid-cols-2 gap-3">
            <Input label="Valor mínimo (R$)" type="number" step="0.01" value={form.valorMinimo} onChange={(e) => set('valorMinimo', e.target.value)} required placeholder="0" />
            <Input label="Valor máximo (R$)" type="number" step="0.01" value={form.valorMaximo} onChange={(e) => set('valorMaximo', e.target.value)} required placeholder="1000" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input label="Desconto máx. (%)" type="number" min="0" max="100" value={form.descontoMaximo} onChange={(e) => set('descontoMaximo', e.target.value)} required placeholder="20" />
            <Input label="Parcelas máx." type="number" min="1" value={form.parcelasMaximas} onChange={(e) => set('parcelasMaximas', e.target.value)} required placeholder="3" />
            <Input label="Prazo máx. (dias)" type="number" min="1" value={form.prazoMaximoDias} onChange={(e) => set('prazoMaximoDias', e.target.value)} required placeholder="30" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Tom de comunicação</label>
            <div className="flex gap-3">
              {['formal', 'informal', 'neutro'].map((tom) => (
                <label key={tom} className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="tom"
                    value={tom}
                    checked={form.tomComunicacao === tom}
                    onChange={() => set('tomComunicacao', tom)}
                    className="accent-blue-600"
                  />
                  <span className="text-sm capitalize text-gray-700">{tom}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Mensagem inicial (opcional)</label>
            <textarea
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
              rows={3}
              placeholder="Template de abertura da negociação..."
              value={form.mensagemInicial}
              onChange={(e) => set('mensagemInicial', e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => navigate('/faixas')}>Cancelar</Button>
            <Button loading={isPending} onClick={() => salvar()}>
              {editing ? 'Salvar alterações' : 'Criar faixa'}
            </Button>
          </div>
        </CardBody>
      </Card>

      <div className="bg-blue-50 rounded-xl px-4 py-3 text-xs text-blue-700">
        <p className="font-medium mb-1">Regras importantes</p>
        <ul className="list-disc list-inside space-y-0.5 text-blue-600">
          <li>Faixas devem ser contíguas — sem lacunas de valor entre elas</li>
          <li>Não pode haver sobreposição entre faixas</li>
          <li>O valor mínimo deve ser menor que o valor máximo</li>
        </ul>
      </div>
    </div>
  )
}
