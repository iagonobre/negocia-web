import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPainel } from '../api/empresa'
import { dispararLembretesOficina } from '../api/notificacao'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardBody } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Spinner } from '../components/ui/Spinner'
import { useState } from 'react'

function KpiCard({ label, value, sub, color = 'blue' }: { label: string; value: string | number; sub?: string; color?: 'blue' | 'green' | 'yellow' | 'gray' }) {
  const colors = { blue: 'text-blue-600', green: 'text-green-600', yellow: 'text-amber-600', gray: 'text-gray-600' }
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

const statusLabels: Record<string, string> = { PENDENTE: 'Pendente', EM_ATENDIMENTO: 'Em Atendimento', AGENDADO: 'Agendado', CANCELADO: 'Cancelado', SEM_RESPOSTA: 'Sem Resposta' }
const statusColors: Record<string, string> = { PENDENTE: 'bg-yellow-50 text-yellow-700', EM_ATENDIMENTO: 'bg-blue-50 text-blue-700', AGENDADO: 'bg-green-50 text-green-700', CANCELADO: 'bg-red-50 text-red-700', SEM_RESPOSTA: 'bg-gray-100 text-gray-600' }

export function Dashboard() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [feedback, setFeedback] = useState('')

  const { data, isLoading } = useQuery({ queryKey: ['painel'], queryFn: getPainel })

  const { mutate: disparar, isPending } = useMutation({
    mutationFn: dispararLembretesOficina,
    onSuccess: (res) => {
      setFeedback(`${res.enviados} aviso(s) de revisão enviado(s).`)
      queryClient.invalidateQueries({ queryKey: ['painel'] })
      setTimeout(() => setFeedback(''), 4000)
    },
  })

  if (isLoading) return <div className="flex justify-center py-20"><Spinner /></div>

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Painel da Oficina</h1>
          <p className="text-sm text-gray-500 mt-0.5">Olá, {user?.nome}</p>
        </div>
        <div className="flex items-center gap-3">
          {feedback && <p className="text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-lg">{feedback}</p>}
          <Button variant="secondary" size="sm" loading={isPending} onClick={() => disparar()}>Avisar Revisões</Button>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Veículos Registrados" value={data?.clientes?.total ?? 0} color="gray" />
        <KpiCard label="Contatos Ativos" value={data?.agendamentos?.pendentes ?? 0} color="blue" />
        <KpiCard label="Revisões Agendadas" value={data?.agendamentos?.agendados ?? 0} color="green" />
        <KpiCard label="Agendamentos Totais" value={data?.agendamentos?.total ?? 0} color="yellow" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <div className="px-6 py-4 border-b border-gray-100"><h2 className="text-sm font-semibold text-gray-900">Agendamentos por status</h2></div>
          <CardBody>
            <div className="flex flex-col gap-2">
              {Object.entries(data?.agendamentos?.porStatus ?? {}).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[status] ?? 'bg-gray-100 text-gray-600'}`}>{statusLabels[status] ?? status}</span>
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