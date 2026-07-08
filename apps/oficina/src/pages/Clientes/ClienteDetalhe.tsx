import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { buscarCliente } from '../../api/clientes'
import { iniciarAgendamento } from '../../api/agendamentos'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Spinner } from '../../components/ui/Spinner'
import { useState } from 'react'

function fmtDate(s: string) { return new Date(s).toLocaleDateString('pt-BR') }

const statusBadge: Record<string, { variant: 'blue' | 'green' | 'yellow' | 'red' | 'gray'; label: string }> = {
  PENDENTE: { variant: 'yellow', label: 'Pendente' },
  EM_ATENDIMENTO: { variant: 'blue', label: 'Em Atendimento' },
  AGENDADO: { variant: 'green', label: 'Agendado' },
  CANCELADO: { variant: 'red', label: 'Cancelado' },
  SEM_RESPOSTA: { variant: 'gray', label: 'Sem resposta' },
}

export function ClienteDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [feedback, setFeedback] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['cliente-detalhe', id],
    queryFn: () => buscarCliente(id!),
    enabled: !!id,
  })

  const { mutate: iniciar, isPending: iniciando } = useMutation({
    mutationFn: () => iniciarAgendamento(id!),
    onSuccess: () => {
      setFeedback('Contato de revisão iniciado via WhatsApp.')
      queryClient.invalidateQueries({ queryKey: ['cliente-detalhe', id] })
      setTimeout(() => setFeedback(''), 4000)
    },
  })

  if (isLoading) return <div className="flex justify-center py-20"><Spinner /></div>
  if (!data) return <p className="text-sm text-red-500">Cliente não encontrado.</p>

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/clientes')} className="text-gray-400 hover:text-gray-600">
           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
             <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-gray-900">{data.nome}</h1>
            <Badge variant="blue">{data.placa}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          {feedback && <p className="text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-lg">{feedback}</p>}
          <Button size="sm" loading={iniciando} onClick={() => iniciar()}>Agendar Revisão</Button>
          <Link to={`/clientes/${id}/editar`}>
            <Button size="sm" variant="secondary">Editar</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <CardHeader><h2 className="text-sm font-semibold text-gray-900">Ficha do Veículo</h2></CardHeader>
          <CardBody className="flex flex-col gap-2 text-sm">
            {[
              ['Modelo', data.modeloVeiculo],
              ['Placa', data.placa],
              ['Proprietário', data.nome],
              ['Telefone', data.telefone],
              ['Cadastrado em', fmtDate(data.createdAt)],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-gray-400">{k}</span>
                <span className="text-gray-900 font-medium text-right max-w-xs truncate">{v}</span>
              </div>
            ))}
          </CardBody>
        </Card>

        <div className="lg:col-span-2 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-gray-900">Histórico de Agendamentos ({((data as any).agendamentos)?.length ?? 0})</h2>
          {((data as any).agendamentos ?? []).length === 0 ? (
            <Card><CardBody><p className="text-sm text-gray-400 text-center py-6">Nenhum histórico ainda.</p></CardBody></Card>
          ) : (
            ((data as any).agendamentos as Array<any>).map((a) => (
              <Card key={a.id}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusBadge[a.status]?.variant ?? 'gray'}>{statusBadge[a.status]?.label ?? a.status}</Badge>
                    <span className="text-xs text-gray-400">{fmtDate(a.createdAt)}</span>
                  </div>
                </CardHeader>
                <CardBody>
                  <p className="text-xs font-medium text-gray-500 mb-2">Conversa do Agente</p>
                  <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                    {a.historico.filter((m: any) => m.role !== 'system' && m.role !== 'tool' && m.content).map((m: any, i: number) => (
                      <div key={i} className={`rounded-lg px-3 py-2 text-xs max-w-[85%] ${m.role === 'assistant' ? 'bg-amber-50 text-amber-900 self-start' : 'bg-gray-100 text-gray-800 self-end'}`}>
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
    </div>
  )
}