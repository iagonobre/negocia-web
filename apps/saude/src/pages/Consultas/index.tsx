import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { listarConsultas, type StatusConsulta } from '../../api/consultas'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Spinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/ui/EmptyState'
import { Button } from '../../components/ui/Button'

const statusBadge: Record<StatusConsulta, { variant: 'blue' | 'green' | 'yellow' | 'red' | 'gray'; label: string }> = {
  PENDENTE: { variant: 'yellow', label: 'Pendente' },
  CONFIRMADA: { variant: 'green', label: 'Confirmada' },
  REALIZADA: { variant: 'blue', label: 'Realizada' },
  CANCELADA: { variant: 'red', label: 'Cancelada' },
}

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString('pt-BR')
}

function fmtDataHora(s: string) {
  return new Date(s).toLocaleString('pt-BR')
}

export function Consultas() {
  const { data = [], isLoading } = useQuery({ queryKey: ['consultas'], queryFn: listarConsultas })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Consultas de Retorno</h1>
        <p className="text-sm text-gray-500 mt-0.5">{data.length} consulta(s) no total</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : data.length === 0 ? (
        <Card>
          <EmptyState
            title="Nenhuma consulta ainda"
            description="Consultas são criadas automaticamente ao iniciar um contato de retorno via WhatsApp."
          />
        </Card>
      ) : (
        <Card>
          <div className="divide-y divide-gray-50">
            {data.map((c) => (
              <div key={c.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 truncate">{c.paciente?.nome ?? 'Paciente removido'}</p>
                    <Badge variant={statusBadge[c.status]?.variant ?? 'gray'}>
                      {statusBadge[c.status]?.label ?? c.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                    <span>Iniciada em {fmtDate(c.createdAt)}</span>
                    {c.dataAgendada && (
                      <span className="text-green-600 font-medium">Agendada para {fmtDataHora(c.dataAgendada)}</span>
                    )}
                    <span>{c.historico.filter((m) => m.role !== 'system' && m.role !== 'tool' && m.content).length} mensagens</span>
                  </div>
                </div>
                <Link to={`/consultas/${c.id}`}>
                  <Button size="sm" variant="ghost">Ver detalhes</Button>
                </Link>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
