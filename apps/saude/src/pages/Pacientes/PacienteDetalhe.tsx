import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { historicoPaciente } from '../../api/pacientes'
import { iniciarRetornoWhatsApp } from '../../api/consultas'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Spinner } from '../../components/ui/Spinner'
import { useState } from 'react'

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString('pt-BR')
}

function fmtDataHora(s: string) {
  return new Date(s).toLocaleString('pt-BR')
}

const statusConsultaBadge: Record<string, { variant: 'blue' | 'green' | 'yellow' | 'red' | 'gray'; label: string }> = {
  PENDENTE: { variant: 'yellow', label: 'Pendente' },
  CONFIRMADA: { variant: 'green', label: 'Confirmada' },
  REALIZADA: { variant: 'blue', label: 'Realizada' },
  CANCELADA: { variant: 'red', label: 'Cancelada' },
}

export function PacienteDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [feedback, setFeedback] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['paciente-detalhe', id],
    queryFn: () => historicoPaciente(id!),
    enabled: !!id,
  })

  const { mutate: iniciar, isPending: iniciando } = useMutation({
    mutationFn: () => iniciarRetornoWhatsApp(id!),
    onSuccess: () => {
      setFeedback('Contato iniciado! Mensagem enviada via WhatsApp.')
      queryClient.invalidateQueries({ queryKey: ['paciente-detalhe', id] })
      setTimeout(() => setFeedback(''), 4000)
    },
  })

  if (isLoading) return <div className="flex justify-center py-20"><Spinner /></div>
  if (!data) return <p className="text-sm text-red-500">Paciente não encontrado.</p>

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/pacientes')} className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-gray-900">{data.nome}</h1>
            <Badge variant="blue">
              {data.convenio || 'Particular'}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          {feedback && <p className="text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-lg">{feedback}</p>}
          <Button size="sm" loading={iniciando} onClick={() => iniciar()}>
            Agendar Retorno
          </Button>
          <Link to={`/pacientes/${id}/editar`}>
            <Button size="sm" variant="secondary">Editar</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <CardHeader><h2 className="text-sm font-semibold text-gray-900">Informações do Paciente</h2></CardHeader>
          <CardBody className="flex flex-col gap-2 text-sm">
            {[
              ['E-mail', data.email ?? '—'],
              ['Telefone', data.telefone],
              ['CPF', data.cpf ?? '—'],
              ['Convênio', data.convenio ?? 'Particular'],
              ['Regra de retorno', data.configRetorno ? `${data.configRetorno.descricao} (${data.configRetorno.diasParaRetorno}d)` : 'Nenhuma vinculada'],
              ['Cadastrado em', fmtDate(data.createdAt)],
            ].map(([k, v]) => (
              <div key={String(k)} className="flex justify-between">
                <span className="text-gray-400">{k}</span>
                <span className="text-gray-900 font-medium text-right max-w-xs truncate">{v}</span>
              </div>
            ))}
          </CardBody>
        </Card>

        <div className="lg:col-span-2 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-gray-900">Histórico de consultas ({data.consultas.length})</h2>
          {data.consultas.length === 0 ? (
            <Card><CardBody><p className="text-sm text-gray-400 text-center py-6">Nenhum histórico de contato ainda.</p></CardBody></Card>
          ) : (
            data.consultas.map((c) => (
              <Card key={c.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={statusConsultaBadge[c.status]?.variant ?? 'gray'}>
                        {statusConsultaBadge[c.status]?.label ?? c.status}
                      </Badge>
                      <span className="text-xs text-gray-400">{fmtDate(c.createdAt)}</span>
                    </div>
                  </div>
                  {c.dataAgendada && (
                    <p className="text-xs text-gray-500 mt-1">Agendado para {fmtDataHora(c.dataAgendada)}</p>
                  )}
                </CardHeader>
                <CardBody>
                  <p className="text-xs font-medium text-gray-500 mb-2">Conversa do Agente (WhatsApp)</p>
                  <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                    {c.historico
                      .filter((m) => m.role !== 'system' && m.role !== 'tool')
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
    </div>
  )
}