import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { historicoDevedor } from '../../api/devedores'
import { iniciarNegociacao, reiniciarNegociacao, fecharAcordo, type StatusProposta } from '../../api/propostas'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Spinner } from '../../components/ui/Spinner'
import { useState } from 'react'

function fmt(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString('pt-BR')
}

const statusPropostaBadge: Record<string, { variant: 'blue' | 'green' | 'yellow' | 'red' | 'gray'; label: string }> = {
  PENDENTE: { variant: 'yellow', label: 'Pendente' },
  ACEITA: { variant: 'green', label: 'Aceita' },
  RECUSADA: { variant: 'red', label: 'Recusada' },
}

const statusDevedorBadge: Record<string, { variant: 'blue' | 'green' | 'yellow' | 'red' | 'gray'; label: string }> = {
  PENDENTE: { variant: 'yellow', label: 'Pendente' },
  EM_NEGOCIACAO: { variant: 'blue', label: 'Em negociação' },
  ACORDADO: { variant: 'green', label: 'Acordado' },
  PAGO: { variant: 'green', label: 'Pago' },
  SEM_RESPOSTA: { variant: 'gray', label: 'Sem resposta' },
  RECUSADO: { variant: 'red', label: 'Recusado' },
}

interface AcordoForm {
  propostaId: string
  status: StatusProposta
  valorAcordado: string
  parcelasAcordadas: string
}

export function DevedorDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [acordoForm, setAcordoForm] = useState<AcordoForm | null>(null)
  const [feedback, setFeedback] = useState('')
  const [error, setError] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['devedor-historico', id],
    queryFn: () => historicoDevedor(id!),
    enabled: !!id,
  })

  const extrairErro = (err: unknown) => {
    const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message
    return Array.isArray(msg) ? msg[0] : (msg ?? 'Ocorreu um erro. Tente novamente.')
  }

  const { mutate: iniciar, isPending: iniciando } = useMutation({
    mutationFn: () => iniciarNegociacao(id!),
    onSuccess: () => {
      setError('')
      setFeedback('Negociação iniciada! Mensagem enviada via WhatsApp.')
      queryClient.invalidateQueries({ queryKey: ['devedor-historico', id] })
      setTimeout(() => setFeedback(''), 4000)
    },
    onError: (err) => setError(extrairErro(err)),
  })

  const { mutate: reiniciar, isPending: reiniciando } = useMutation({
    mutationFn: () => reiniciarNegociacao(id!),
    onSuccess: () => {
      setError('')
      setFeedback('Negociação reiniciada! Mensagem enviada via WhatsApp.')
      queryClient.invalidateQueries({ queryKey: ['devedor-historico', id] })
      setTimeout(() => setFeedback(''), 4000)
    },
    onError: (err) => setError(extrairErro(err)),
  })

  const { mutate: fechar, isPending: fechando } = useMutation({
    mutationFn: () =>
      fecharAcordo(acordoForm!.propostaId, {
        status: acordoForm!.status,
        valorAcordado: acordoForm!.status === 'ACEITA' ? parseFloat(acordoForm!.valorAcordado) : undefined,
        parcelasAcordadas: acordoForm!.status === 'ACEITA' ? parseInt(acordoForm!.parcelasAcordadas) : undefined,
      }),
    onSuccess: () => {
      setError('')
      setAcordoForm(null)
      queryClient.invalidateQueries({ queryKey: ['devedor-historico', id] })
    },
    onError: (err) => setError(extrairErro(err)),
  })

  if (isLoading) return <div className="flex justify-center py-20"><Spinner /></div>
  if (!data) return <p className="text-sm text-red-500">Devedor não encontrado.</p>

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/devedores')} className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-gray-900">{data.nome}</h1>
            <Badge variant={statusDevedorBadge[data.status]?.variant ?? 'gray'}>
              {statusDevedorBadge[data.status]?.label ?? data.status}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          {feedback && <p className="text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-lg">{feedback}</p>}
          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">{error}</p>}
          {(data.status === 'PENDENTE' || data.status === 'SEM_RESPOSTA') && (
            <Button size="sm" loading={iniciando} onClick={() => iniciar()}>
              Iniciar negociação
            </Button>
          )}
          {data.status === 'EM_NEGOCIACAO' && (
            <Button
              size="sm"
              variant="secondary"
              loading={reiniciando}
              onClick={() => {
                if (confirm('Isso cancela a negociação pendente e começa do zero (a conversa atual será apagada). Use apenas se a mensagem não chegou ao devedor. Continuar?')) {
                  reiniciar()
                }
              }}
            >
              Reiniciar negociação
            </Button>
          )}
          <Link to={`/devedores/${id}/editar`}>
            <Button size="sm" variant="secondary">Editar</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <CardHeader><h2 className="text-sm font-semibold text-gray-900">Informações</h2></CardHeader>
          <CardBody className="flex flex-col gap-2 text-sm">
            {[
              ['E-mail', data.email ?? '—'],
              ['Telefone', data.telefone],
              ['Tipo', data.tipoPessoa === 'FISICA' ? 'Pessoa Física' : 'Pessoa Jurídica'],
              ['CPF/CNPJ', data.cpf ?? data.cnpj ?? '—'],
              ['Dívida', fmt(data.valorDivida)],
              ['Vencimento', fmtDate(data.vencimento)],
              ['Descrição', data.descricaoDivida ?? '—'],
              ['Tentativas', data.tentativas],
              ['Último contato', data.ultimoContato ? fmtDate(data.ultimoContato) : '—'],
            ].map(([k, v]) => (
              <div key={String(k)} className="flex justify-between">
                <span className="text-gray-400">{k}</span>
                <span className="text-gray-900 font-medium text-right max-w-xs truncate">{v}</span>
              </div>
            ))}
          </CardBody>
        </Card>

        <div className="lg:col-span-2 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-gray-900">Histórico de propostas ({data.propostas?.length ?? 0})</h2>
          {(data.propostas ?? []).length === 0 ? (
            <Card><CardBody><p className="text-sm text-gray-400 text-center py-6">Nenhuma proposta ainda.</p></CardBody></Card>
          ) : (
            (data.propostas as Array<{
              id: string; status: string; valorAcordado: number | null; parcelasAcordadas: number | null;
              limites: { valorOriginal: number; descontoMaximo: number; parcelasMaximas: number; prazoMaximoDias: number };
              historico: Array<{ role: string; content: string }>;
              createdAt: string;
            }>).map((p) => (
              <Card key={p.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={statusPropostaBadge[p.status]?.variant ?? 'gray'}>
                        {statusPropostaBadge[p.status]?.label ?? p.status}
                      </Badge>
                      <span className="text-xs text-gray-400">{fmtDate(p.createdAt)}</span>
                    </div>
                    {p.status === 'PENDENTE' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setAcordoForm({ propostaId: p.id, status: 'RECUSADA', valorAcordado: '', parcelasAcordadas: '' })}
                        >
                          Recusar
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setAcordoForm({ propostaId: p.id, status: 'ACEITA', valorAcordado: String(p.limites.valorOriginal), parcelasAcordadas: '1' })}
                        >
                          Fechar acordo
                        </Button>
                      </div>
                    )}
                  </div>
                  {p.valorAcordado !== null && (
                    <p className="text-xs text-gray-500 mt-1">
                      Acordo: {fmt(p.valorAcordado)} em {p.parcelasAcordadas}x parcela(s)
                    </p>
                  )}
                </CardHeader>
                <CardBody>
                  <p className="text-xs font-medium text-gray-500 mb-3">Limites da negociação</p>
                  <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                    {[
                      ['Valor original', fmt(p.limites.valorOriginal)],
                      ['Desconto máx.', `${p.limites.descontoMaximo}%`],
                      ['Parcelas máx.', p.limites.parcelasMaximas],
                      ['Prazo máx.', `${p.limites.prazoMaximoDias}d`],
                    ].map(([k, v]) => (
                      <div key={String(k)} className="flex justify-between">
                        <span className="text-gray-400">{k}</span>
                        <span className="font-medium text-gray-700">{v}</span>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs font-medium text-gray-500 mb-2">Conversa</p>
                  <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                    {p.historico
                      .filter((m) => m.role !== 'system' && m.role !== 'tool' && m.content)
                      .map((m, i) => (
                        <div
                          key={i}
                          className={`rounded-lg px-3 py-2 text-xs max-w-[85%] ${
                            m.role === 'assistant'
                              ? 'bg-blue-50 text-blue-900 self-start'
                              : 'bg-gray-100 text-gray-800 self-end'
                          }`}
                        >
                          {m.content}
                        </div>
                      ))}
                  </div>
                </CardBody>
              </Card>
            ))
          )}
        </div>
      </div>

      {acordoForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setAcordoForm(null)} />
          <div className="relative w-full max-w-sm bg-white rounded-xl shadow-xl p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-4">
              {acordoForm.status === 'ACEITA' ? 'Fechar acordo' : 'Recusar proposta'}
            </h2>
            {acordoForm.status === 'ACEITA' && (
              <div className="flex flex-col gap-3 mb-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Valor acordado (R$)</label>
                  <input
                    type="number" step="0.01"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    value={acordoForm.valorAcordado}
                    onChange={(e) => setAcordoForm((f) => f ? { ...f, valorAcordado: e.target.value } : f)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700">Número de parcelas</label>
                  <input
                    type="number" min="1"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    value={acordoForm.parcelasAcordadas}
                    onChange={(e) => setAcordoForm((f) => f ? { ...f, parcelasAcordadas: e.target.value } : f)}
                  />
                </div>
              </div>
            )}
            {acordoForm.status === 'RECUSADA' && (
              <p className="text-sm text-gray-500 mb-4">A proposta será marcada como recusada.</p>
            )}
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setAcordoForm(null)}>Cancelar</Button>
              <Button
                variant={acordoForm.status === 'ACEITA' ? 'primary' : 'danger'}
                loading={fechando}
                onClick={() => fechar()}
              >
                {acordoForm.status === 'ACEITA' ? 'Confirmar acordo' : 'Recusar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
