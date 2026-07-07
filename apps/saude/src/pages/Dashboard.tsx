import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// Assumindo que você vá criar uma rota getPainel genérica ou adaptada na API do back-end de saúde
import { getPainel } from '../api/empresa' 
import { useAuth } from '../contexts/AuthContext'
import { Card, CardBody } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { useState } from 'react'

function KpiCard({
  label,
  value,
  sub,
  color = 'blue',
}: {
  label: string
  value: string | number
  sub?: string
  color?: 'blue' | 'green' | 'yellow' | 'gray'
}) {
  const colors = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    gray: 'text-gray-600',
  }
  return (
    <Card>
      <CardBody>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        <p className={`text-2xl font-semibold mt-1 ${colors[color]}`}>{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </CardBody>
    </Card>
  )
}

const statusConsultaLabels: Record<string, string> = {
  AGUARDANDO_CONTATO: 'Aguardando Contato',
  EM_ATENDIMENTO: 'Em Atendimento',
  AGENDADO: 'Agendado',
  CANCELADO: 'Cancelado',
  SEM_RESPOSTA: 'Sem Resposta',
}

const statusConsultaColors: Record<string, string> = {
  AGUARDANDO_CONTATO: 'bg-yellow-50 text-yellow-700',
  EM_ATENDIMENTO: 'bg-blue-50 text-blue-700',
  AGENDADO: 'bg-green-50 text-green-700',
  CANCELADO: 'bg-red-50 text-red-700',
  SEM_RESPOSTA: 'bg-gray-100 text-gray-600',
}

export function Dashboard() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [feedback, setFeedback] = useState('')

  // Caso o backend de Saúde não tenha a rota /painel ainda, isso vai dar erro. 
  // Mas a estrutura visual já está adaptada para receber data.pacientes e data.consultas
  const { data, isLoading, error } = useQuery({
    queryKey: ['painel'],
    queryFn: getPainel,
  })

  if (isLoading) return <div className="flex justify-center py-20"><Spinner /></div>
  if (error || !data) return <p className="text-sm text-red-500 mt-10 text-center">Aguardando implementação do Dashboard na API de Saúde...</p>

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Painel de Retornos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Olá, Dr(a). {user?.nome}</p>
        </div>
        <div className="flex items-center gap-3">
          {feedback && (
            <p className="text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-lg">{feedback}</p>
          )}
          <Button variant="secondary" size="sm" onClick={() => {}}>
            Baixar Relatório
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Usando safe navigation para caso a API retorne nomes ligeiramente diferentes */}
        <KpiCard label="Total de Pacientes" value={data?.pacientes?.total ?? 0} color="gray" />
        <KpiCard label="Consultas em Andamento" value={data?.consultas?.total ?? 0} color="blue" />
        <KpiCard label="Retornos Agendados" value={data?.consultas?.agendados ?? 0} color="green" />
        <KpiCard label="Sem Resposta" value={data?.consultas?.semResposta ?? 0} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Consultas por status</h2>
          </div>
          <CardBody>
            <div className="flex flex-col gap-2">
              {Object.entries(data?.consultas?.porStatus ?? {}).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConsultaColors[status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {statusConsultaLabels[status] ?? status}
                  </span>
                  <span className="text-sm font-medium text-gray-900">{count as number}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}