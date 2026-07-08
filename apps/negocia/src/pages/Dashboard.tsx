import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getPainel } from '../api/empresa'
import { dispararLembretes } from '../api/cobranca'
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

const statusDevedorLabels: Record<string, string> = {
  PENDENTE: 'Pendente',
  EM_NEGOCIACAO: 'Em negociação',
  ACORDADO: 'Acordado',
  PAGO: 'Pago',
  SEM_RESPOSTA: 'Sem resposta',
  RECUSADO: 'Recusado',
}

const statusPropostaLabels: Record<string, string> = {
  PENDENTE: 'Pendente',
  ACEITA: 'Aceita',
  RECUSADA: 'Recusada',
}

const statusDevedorColors: Record<string, string> = {
  PENDENTE: 'bg-yellow-50 text-yellow-700',
  EM_NEGOCIACAO: 'bg-blue-50 text-blue-700',
  ACORDADO: 'bg-green-50 text-green-700',
  PAGO: 'bg-green-100 text-green-800',
  SEM_RESPOSTA: 'bg-gray-100 text-gray-600',
  RECUSADO: 'bg-red-50 text-red-700',
}

const statusPropostaColors: Record<string, string> = {
  PENDENTE: 'bg-yellow-50 text-yellow-700',
  ACEITA: 'bg-green-50 text-green-700',
  RECUSADA: 'bg-red-50 text-red-700',
}

function fmt(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function Dashboard() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [lembreteFeedback, setLembreteFeedback] = useState('')
  const [lembreteErro, setLembreteErro] = useState('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['painel'],
    queryFn: getPainel,
  })

  const { mutate: disparar, isPending: disparando } = useMutation({
    mutationFn: dispararLembretes,
    onSuccess: (res) => {
      setLembreteErro('')
      setLembreteFeedback(`${res.enviados} lembrete(s) enviado(s) com sucesso.`)
      queryClient.invalidateQueries({ queryKey: ['painel'] })
      setTimeout(() => setLembreteFeedback(''), 4000)
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message
      setLembreteErro(Array.isArray(msg) ? msg[0] : (msg ?? 'Erro ao disparar lembretes.'))
    },
  })

  if (isLoading) return <div className="flex justify-center py-20"><Spinner /></div>
  if (error || !data) return <p className="text-sm text-red-500">Erro ao carregar painel.</p>

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Painel</h1>
          <p className="text-sm text-gray-500 mt-0.5">Olá, {user?.nome}</p>
        </div>
        <div className="flex items-center gap-3">
          {lembreteFeedback && (
            <p className="text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-lg">{lembreteFeedback}</p>
          )}
          {lembreteErro && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">{lembreteErro}</p>
          )}
          <Button variant="secondary" size="sm" loading={disparando} onClick={() => disparar()}>
            Disparar lembretes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Devedores" value={data.devedores.total} color="gray" />
        <KpiCard label="Propostas" value={data.propostas.total} color="blue" />
        <KpiCard
          label="Em aberto"
          value={fmt(data.financeiro.valorTotalEmAberto)}
          color="yellow"
        />
        <KpiCard
          label="Recuperado"
          value={fmt(data.financeiro.valorTotalRecuperado)}
          sub={`${data.financeiro.taxaRecuperacaoPercent.toFixed(1)}% de recuperação`}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Devedores por status</h2>
          </div>
          <CardBody>
            <div className="flex flex-col gap-2">
              {Object.entries(data.devedores.porStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusDevedorColors[status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {statusDevedorLabels[status] ?? status}
                  </span>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Propostas por status</h2>
          </div>
          <CardBody>
            <div className="flex flex-col gap-2">
              {Object.entries(data.propostas.porStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusPropostaColors[status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {statusPropostaLabels[status] ?? status}
                  </span>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
