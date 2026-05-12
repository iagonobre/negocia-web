import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { listarPropostas, type StatusProposta } from '../../api/propostas'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Spinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/ui/EmptyState'
import { Button } from '../../components/ui/Button'

const statusBadge: Record<StatusProposta, { variant: 'blue' | 'green' | 'yellow' | 'red' | 'gray'; label: string }> = {
  PENDENTE: { variant: 'yellow', label: 'Pendente' },
  ACEITA: { variant: 'green', label: 'Aceita' },
  RECUSADA: { variant: 'red', label: 'Recusada' },
}

function fmt(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString('pt-BR')
}

export function Propostas() {
  const { data = [], isLoading } = useQuery({ queryKey: ['propostas'], queryFn: listarPropostas })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Propostas</h1>
        <p className="text-sm text-gray-500 mt-0.5">{data.length} proposta(s) no total</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : data.length === 0 ? (
        <Card>
          <EmptyState
            title="Nenhuma proposta ainda"
            description="Propostas são criadas automaticamente ao iniciar uma negociação via WhatsApp."
          />
        </Card>
      ) : (
        <Card>
          <div className="divide-y divide-gray-50">
            {data.map((p) => (
              <div key={p.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant={statusBadge[p.status]?.variant ?? 'gray'}>
                      {statusBadge[p.status]?.label ?? p.status}
                    </Badge>
                    <span className="text-xs text-gray-400">{fmtDate(p.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                    <span>Original: {fmt(p.limites.valorOriginal)}</span>
                    {p.valorAcordado !== null && (
                      <span className="text-green-600 font-medium">Acordo: {fmt(p.valorAcordado)} em {p.parcelasAcordadas}x</span>
                    )}
                    <span>{p.historico.filter((m) => m.role !== 'system' && m.role !== 'tool').length} mensagens</span>
                  </div>
                </div>
                <Link to={`/propostas/${p.id}`}>
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
