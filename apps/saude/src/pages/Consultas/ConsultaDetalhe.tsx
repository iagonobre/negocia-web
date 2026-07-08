import { useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { buscarConsulta, type StatusConsulta } from '../../api/consultas'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Card, CardBody, CardHeader } from '../../components/ui/Card'
import { Spinner } from '../../components/ui/Spinner'

const statusBadge: Record<StatusConsulta, { variant: 'blue' | 'green' | 'yellow' | 'red' | 'gray'; label: string }> = {
  PENDENTE: { variant: 'yellow', label: 'Pendente' },
  CONFIRMADA: { variant: 'green', label: 'Confirmada' },
  REALIZADA: { variant: 'blue', label: 'Realizada' },
  CANCELADA: { variant: 'red', label: 'Cancelada' },
}

function fmtDataHora(s: string) {
  return new Date(s).toLocaleString('pt-BR')
}

export function ConsultaDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()
  const chatEndRef = useRef<HTMLDivElement>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['consulta', id],
    queryFn: () => buscarConsulta(id!),
    enabled: !!id,
  })

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [data?.historico])

  if (isLoading) return <div className="flex justify-center py-20"><Spinner /></div>
  if (!data) return <p className="text-sm text-red-500">Consulta não encontrada.</p>

  const messages = data.historico.filter((m) => m.role !== 'system' && m.role !== 'tool' && m.content)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/consultas')} className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 flex items-center gap-2">
          <h1 className="text-xl font-semibold text-gray-900">Consulta</h1>
          <Badge variant={statusBadge[data.status]?.variant ?? 'gray'}>
            {statusBadge[data.status]?.label ?? data.status}
          </Badge>
        </div>
        {data.paciente && (
          <Link to={`/pacientes/${data.paciente.id}`}>
            <Button size="sm" variant="secondary">Ver paciente</Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 flex flex-col gap-4">
          <Card>
            <CardHeader><h2 className="text-sm font-semibold text-gray-900">Informações</h2></CardHeader>
            <CardBody className="flex flex-col gap-2 text-sm">
              {[
                ['Paciente', data.paciente?.nome ?? '—'],
                ['Telefone', data.paciente?.telefone ?? '—'],
                ['Convênio', data.paciente?.convenio ?? 'Particular'],
              ].map(([k, v]) => (
                <div key={String(k)} className="flex justify-between">
                  <span className="text-gray-400">{k}</span>
                  <span className="font-medium text-gray-900 text-right max-w-xs truncate">{v}</span>
                </div>
              ))}
            </CardBody>
          </Card>

          {data.dataAgendada && (
            <Card>
              <CardHeader><h2 className="text-sm font-semibold text-green-700">Retorno agendado</h2></CardHeader>
              <CardBody className="text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Data e horário</span>
                  <span className="font-medium text-gray-900">{fmtDataHora(data.dataAgendada)}</span>
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
            <CardBody className="flex flex-col gap-2 min-h-80 max-h-[600px] overflow-y-auto">
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
          </Card>
        </div>
      </div>
    </div>
  )
}
