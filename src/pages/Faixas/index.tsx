import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listarFaixas, deletarFaixa, type FaixaCriterio } from '../../api/faixas'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/ui/EmptyState'
import { Modal } from '../../components/ui/Modal'

function fmt(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

export function Faixas() {
  const queryClient = useQueryClient()
  const [deleteTarget, setDeleteTarget] = useState<FaixaCriterio | null>(null)

  const { data = [], isLoading } = useQuery({ queryKey: ['faixas'], queryFn: listarFaixas })

  const { mutate: deletar, isPending: deletando } = useMutation({
    mutationFn: (id: string) => deletarFaixa(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faixas'] })
      setDeleteTarget(null)
    },
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Faixas de Critério</h1>
          <p className="text-sm text-gray-500 mt-0.5">Regras de negociação por faixa de valor de dívida</p>
        </div>
        <Link to="/faixas/nova">
          <Button size="sm">Nova faixa</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : data.length === 0 ? (
        <Card>
          <EmptyState
            title="Nenhuma faixa cadastrada"
            description="Crie faixas de critério para que o agente de IA saiba como negociar."
            action={<Link to="/faixas/nova"><Button size="sm">Nova faixa</Button></Link>}
          />
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {data.map((f, i) => (
            <Card key={f.id}>
              <div className="px-6 py-4 flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-xs font-semibold shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{f.descricao}</p>
                      <p className="text-xs text-blue-600 font-medium mt-0.5">
                        {fmt(f.valorMinimo)} — {fmt(f.valorMaximo)}
                      </p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Link to={`/faixas/${f.id}/editar`}>
                        <Button size="sm" variant="ghost">Editar</Button>
                      </Link>
                      <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(f)}>
                        <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-xs">
                    {[
                      ['Desconto máx.', `${f.descontoMaximo}%`],
                      ['Parcelas máx.', f.parcelasMaximas],
                      ['Prazo máx.', `${f.prazoMaximoDias} dias`],
                      ['Tom', f.tomComunicacao],
                    ].map(([k, v]) => (
                      <div key={String(k)}>
                        <span className="text-gray-400">{k}</span>
                        <p className="font-medium text-gray-700 capitalize">{v}</p>
                      </div>
                    ))}
                  </div>
                  {f.mensagemInicial && (
                    <div className="mt-3 bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-600 italic">
                      "{f.mensagemInicial}"
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Excluir faixa" size="sm">
        <p className="text-sm text-gray-600 mb-4">
          Tem certeza que deseja excluir a faixa <strong>{deleteTarget?.descricao}</strong>?
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
