import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { listarServicos, deletarServico, type ServicoConfig } from '../../api/servico-config'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/ui/EmptyState'
import { Modal } from '../../components/ui/Modal'

export function ServicoConfigList() {
  const queryClient = useQueryClient()
  const [deleteTarget, setDeleteTarget] = useState<ServicoConfig | null>(null)

  const { data = [], isLoading } = useQuery({ queryKey: ['servico-configs'], queryFn: listarServicos })

  const { mutate: deletar, isPending: deletando } = useMutation({
    mutationFn: (id: string) => deletarServico(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servico-configs'] })
      setDeleteTarget(null)
    },
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Regras de Revisão</h1>
          <p className="text-sm text-gray-500 mt-0.5">Configurações de serviços da oficina</p>
        </div>
        <Link to="/servico-config/novo">
          <Button size="sm">Novo Serviço</Button>
        </Link>
      </div>

      <Card>
        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : data.length === 0 ? (
          <EmptyState
            title="Nenhum serviço cadastrado"
            description="Crie regras de revisão para a IA chamar seus clientes."
            action={<Link to="/servico-config/novo"><Button size="sm">Novo Serviço</Button></Link>}
          />
        ) : (
          <div className="divide-y divide-gray-50">
            {data.map((config) => (
              <div key={config.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{config.descricao}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Prazo: {config.prazoRevisaoDias} dias · Tom: {config.tomComunicacao}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link to={`/servico-config/${config.id}/editar`}>
                    <Button size="sm" variant="ghost">Editar</Button>
                  </Link>
                  <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(config)}>
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

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Excluir serviço" size="sm">
        <p className="text-sm text-gray-600 mb-4">Tem certeza que deseja excluir <strong>{deleteTarget?.descricao}</strong>?</p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
          <Button variant="danger" loading={deletando} onClick={() => deleteTarget && deletar(deleteTarget.id)}>Excluir</Button>
        </div>
      </Modal>
    </div>
  )
}