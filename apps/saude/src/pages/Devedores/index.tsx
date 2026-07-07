import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { listarDevedores, deletarDevedor, importarCSV, type Devedor, type StatusDevedor } from '../../api/devedores'
import { iniciarNegociacao } from '../../api/propostas'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Spinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/ui/EmptyState'
import { Modal } from '../../components/ui/Modal'

const statusBadge: Record<StatusDevedor, { variant: 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'purple'; label: string }> = {
  PENDENTE: { variant: 'yellow', label: 'Pendente' },
  EM_NEGOCIACAO: { variant: 'blue', label: 'Em negociação' },
  ACORDADO: { variant: 'green', label: 'Acordado' },
  PAGO: { variant: 'green', label: 'Pago' },
  SEM_RESPOSTA: { variant: 'gray', label: 'Sem resposta' },
  RECUSADO: { variant: 'red', label: 'Recusado' },
}

function fmt(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

export function Devedores() {
  const queryClient = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [deleteTarget, setDeleteTarget] = useState<Devedor | null>(null)
  const [feedback, setFeedback] = useState('')
  const [filter, setFilter] = useState('')

  const { data = [], isLoading } = useQuery({ queryKey: ['devedores'], queryFn: listarDevedores })

  const { mutate: deletar, isPending: deletando } = useMutation({
    mutationFn: (id: string) => deletarDevedor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devedores'] })
      setDeleteTarget(null)
    },
  })

  const { mutate: iniciar, isPending: iniciando } = useMutation({
    mutationFn: (devedorId: string) => iniciarNegociacao(devedorId),
    onSuccess: () => {
      setFeedback('Negociação iniciada! Mensagem enviada via WhatsApp.')
      queryClient.invalidateQueries({ queryKey: ['devedores'] })
      setTimeout(() => setFeedback(''), 4000)
    },
  })

  const { mutate: importar, isPending: importando } = useMutation({
    mutationFn: (file: File) => importarCSV(file),
    onSuccess: (res) => {
      setFeedback(`${res.importados} devedor(es) importado(s) com sucesso.`)
      queryClient.invalidateQueries({ queryKey: ['devedores'] })
      setTimeout(() => setFeedback(''), 4000)
    },
  })

  const filtered = data.filter(
    (d) =>
      d.nome.toLowerCase().includes(filter.toLowerCase()) ||
      (d.email ?? '').toLowerCase().includes(filter.toLowerCase()),
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Devedores</h1>
          <p className="text-sm text-gray-500 mt-0.5">{data.length} registro(s)</p>
        </div>
        <div className="flex gap-2">
          {feedback && <p className="text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-lg self-center">{feedback}</p>}
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) importar(f); e.target.value = '' }} />
          <Button variant="secondary" size="sm" loading={importando} onClick={() => fileRef.current?.click()}>
            Importar CSV
          </Button>
          <Link to="/devedores/novo">
            <Button size="sm">Novo devedor</Button>
          </Link>
        </div>
      </div>

      <Card>
        <div className="px-6 py-3 border-b border-gray-100">
          <input
            className="w-full max-w-xs rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            placeholder="Buscar por nome ou e-mail..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title={filter ? 'Nenhum resultado encontrado' : 'Nenhum devedor cadastrado'}
            description={filter ? 'Tente outros termos de busca.' : 'Adicione devedores manualmente ou importe um CSV.'}
            action={!filter ? <Link to="/devedores/novo"><Button size="sm">Novo devedor</Button></Link> : undefined}
          />
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((d) => (
              <div key={d.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 truncate">{d.nome}</p>
                    <Badge variant={statusBadge[d.status]?.variant ?? 'gray'}>
                      {statusBadge[d.status]?.label ?? d.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{d.email ?? d.telefone} · Dívida: {fmt(d.valorDivida)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {(d.status === 'PENDENTE' || d.status === 'SEM_RESPOSTA') && (
                    <Button
                      size="sm"
                      variant="ghost"
                      loading={iniciando}
                      onClick={() => iniciar(d.id)}
                    >
                      Iniciar negociação
                    </Button>
                  )}
                  <Link to={`/devedores/${d.id}`}>
                    <Button size="sm" variant="ghost">Ver</Button>
                  </Link>
                  <Link to={`/devedores/${d.id}/editar`}>
                    <Button size="sm" variant="ghost">Editar</Button>
                  </Link>
                  <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(d)}>
                    <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Excluir devedor"
        size="sm"
      >
        <p className="text-sm text-gray-600 mb-4">
          Tem certeza que deseja excluir <strong>{deleteTarget?.nome}</strong>? Todos os dados e propostas serão removidos.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
          <Button variant="danger" loading={deletando} onClick={() => deleteTarget && deletar(deleteTarget.id)}>
            Excluir
          </Button>
        </div>
      </Modal>
    </div>
  )
}
