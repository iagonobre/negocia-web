import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { buscarProposta, enviarMensagem, fecharAcordo, type StatusProposta } from '../../api/propostas'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Spinner } from '../../components/ui/Spinner'

function fmt(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

const statusBadge: Record<string, { variant: 'blue' | 'green' | 'yellow' | 'red' | 'gray'; label: string }> = {
  PENDENTE: { variant: 'yellow', label: 'Pendente' },
  ACEITA: { variant: 'green', label: 'Aceita' },
  RECUSADA: { variant: 'red', label: 'Recusada' },
}

export function PropostaDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [mensagem, setMensagem] = useState('')
  const [acordoModal, setAcordoModal] = useState(false)
  const [valorAcordado, setValorAcordado] = useState('')
  const [parcelas, setParcelas] = useState('1')
  const chatEndRef = useRef<HTMLDivElement>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['proposta', id],
    queryFn: () => buscarProposta(id!),
    enabled: !!id,
  })

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [data?.historico])

  useEffect(() => {
    if (data) setValorAcordado(String(data.limites.valorOriginal))
  }, [data])

  const { mutate: enviar, isPending: enviando } = useMutation({
    mutationFn: () => enviarMensagem(id!, mensagem),
    onSuccess: () => {
      setMensagem('')
      queryClient.invalidateQueries({ queryKey: ['proposta', id] })
    },
  })

  const { mutate: fechar, isPending: fechando } = useMutation({
    mutationFn: (status: StatusProposta) =>
      fecharAcordo(id!, {
        status,
        valorAcordado: status === 'ACEITA' ? parseFloat(valorAcordado) : undefined,
        parcelasAcordadas: status === 'ACEITA' ? parseInt(parcelas) : undefined,
      }),
    onSuccess: () => {
      setAcordoModal(false)
      queryClient.invalidateQueries({ queryKey: ['proposta', id] })
    },
  })

  if (isLoading) return <div className="flex justify-center py-20"><Spinner /></div>
  if (!data) return <p className="text-sm text-red-500">Proposta não encontrada.</p>

  const messages = data.historico.filter((m) => m.role !== 'system' && m.role !== 'tool')

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/propostas')} className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 flex items-center gap-2">
          <h1 className="text-xl font-semibold text-gray-900">Proposta</h1>
          <Badge variant={statusBadge[data.status]?.variant ?? 'gray'}>
            {statusBadge[data.status]?.label ?? data.status}
          </Badge>
        </div>
        {data.status === 'PENDENTE' && (
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => fechar('RECUSADA')} loading={fechando}>
              Recusar
            </Button>
            <Button size="sm" onClick={() => setAcordoModal(true)}>
              Fechar acordo
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 flex flex-col gap-4">
          <Card>
            <CardHeader><h2 className="text-sm font-semibold text-gray-900">Limites da negociação</h2></CardHeader>
            <CardBody className="flex flex-col gap-2 text-sm">
              {[
                ['Valor original', fmt(data.limites.valorOriginal)],
                ['Desconto máx.', `${data.limites.descontoMaximo}%`],
                ['Parcelas máx.', data.limites.parcelasMaximas],
                ['Prazo máx.', `${data.limites.prazoMaximoDias} dias`],
              ].map(([k, v]) => (
                <div key={String(k)} className="flex justify-between">
                  <span className="text-gray-400">{k}</span>
                  <span className="font-medium text-gray-900">{v}</span>
                </div>
              ))}
            </CardBody>
          </Card>

          {data.valorAcordado !== null && (
            <Card>
              <CardHeader><h2 className="text-sm font-semibold text-green-700">Acordo fechado</h2></CardHeader>
              <CardBody className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Valor</span>
                  <span className="font-medium text-gray-900">{fmt(data.valorAcordado)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Parcelas</span>
                  <span className="font-medium text-gray-900">{data.parcelasAcordadas}x</span>
                </div>
              </CardBody>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2 flex flex-col">
          <Card className="flex flex-col">
            <CardHeader>
              <h2 className="text-sm font-semibold text-gray-900">Conversa ({messages.length} mensagens)</h2>
            </CardHeader>
            <CardBody className="flex flex-col gap-2 min-h-80 max-h-[500px] overflow-y-auto">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`rounded-xl px-4 py-2.5 text-sm max-w-[85%] ${
                    m.role === 'assistant'
                      ? 'bg-blue-50 text-blue-900 self-start'
                      : 'bg-gray-100 text-gray-800 self-end'
                  }`}
                >
                  {m.content}
                </div>
              ))}
              <div ref={chatEndRef} />
            </CardBody>
            {data.status === 'PENDENTE' && (
              <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
                <input
                  className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Simular mensagem do devedor..."
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && mensagem.trim()) enviar() }}
                />
                <Button loading={enviando} disabled={!mensagem.trim()} onClick={() => enviar()}>
                  Enviar
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>

      {acordoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setAcordoModal(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-xl shadow-xl p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Fechar acordo</h2>
            <div className="flex flex-col gap-3 mb-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Valor acordado (R$)</label>
                <input
                  type="number" step="0.01"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  value={valorAcordado}
                  onChange={(e) => setValorAcordado(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Número de parcelas</label>
                <input
                  type="number" min="1"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  value={parcelas}
                  onChange={(e) => setParcelas(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setAcordoModal(false)}>Cancelar</Button>
              <Button loading={fechando} onClick={() => fechar('ACEITA')}>Confirmar acordo</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
