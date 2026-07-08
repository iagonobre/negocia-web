import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { listarClientes, deletarCliente, type ClienteOficina } from '../../api/clientes'
import { iniciarAgendamento } from '../../api/agendamentos'
import { dispararLembretesOficina } from '../../api/notificacao'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/ui/EmptyState'
import { Modal } from '../../components/ui/Modal'

export function Clientes() {
  const queryClient = useQueryClient()
  const [deleteTarget, setDeleteTarget] = useState<ClienteOficina | null>(null)
  const [feedback, setFeedback] = useState('')
  const [erro, setErro] = useState('')
  const [filter, setFilter] = useState('')

  const { data = [], isLoading } = useQuery({ queryKey: ['clientes'], queryFn: listarClientes })

  const { mutate: deletar, isPending: deletando } = useMutation({
    mutationFn: (id: string) => deletarCliente(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] })
      setDeleteTarget(null)
    },
  })

  const { mutate: iniciar, isPending: iniciando } = useMutation({
    mutationFn: (clienteId: string) => iniciarAgendamento(clienteId),
    onSuccess: () => {
      setFeedback('Contato iniciado! Mensagem de revisão enviada.')
      setTimeout(() => setFeedback(''), 4000)
    },
  })

  const { mutate: dispararLembretes, isPending: disparando } = useMutation({
    mutationFn: dispararLembretesOficina,
    onSuccess: (res) => {
      setErro('')
      setFeedback(`${res.enviados} aviso(s) de revisão enviado(s).`)
      setTimeout(() => setFeedback(''), 4000)
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message
      setErro(Array.isArray(msg) ? msg[0] : (msg ?? 'Erro ao disparar lembretes.'))
    },
  })

  const filtered = data.filter(
    (c) => c.nome.toLowerCase().includes(filter.toLowerCase()) || c.placa.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Clientes & Veículos</h1>
          <p className="text-sm text-gray-500 mt-0.5">{data.length} registro(s)</p>
        </div>
        <div className="flex gap-2">
          {feedback && <p className="text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-lg self-center">{feedback}</p>}
          {erro && <p className="text-sm text-red-600 bg-red-50 px-3 py-1.5 rounded-lg self-center">{erro}</p>}
          <Button size="sm" variant="secondary" loading={disparando} onClick={() => dispararLembretes()}>
            Disparar lembretes
          </Button>
          <Link to="/clientes/novo">
            <Button size="sm">Novo Cliente</Button>
          </Link>
        </div>
      </div>

      <Card>
        <div className="px-6 py-3 border-b border-gray-100">
          <input
            className="w-full max-w-xs rounded-lg border border-gray-200 px-3 py-1.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            placeholder="Buscar por nome ou placa..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title={filter ? 'Nenhum resultado' : 'Nenhum cliente cadastrado'}
            description={filter ? 'Tente outros termos.' : 'Adicione os clientes da sua oficina.'}
            action={!filter ? <Link to="/clientes/novo"><Button size="sm">Novo Cliente</Button></Link> : undefined}
          />
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((c) => (
              <div key={c.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 truncate">{c.nome}</p>
                    <span className="text-xs px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-md font-mono uppercase">
                      {c.placa}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{c.modeloVeiculo} · {c.telefone}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button size="sm" variant="ghost" loading={iniciando} onClick={() => iniciar(c.id)}>
                    Agendar Revisão
                  </Button>
                  <Link to={`/clientes/${c.id}`}>
                    <Button size="sm" variant="ghost">Ver</Button>
                  </Link>
                  <Link to={`/clientes/${c.id}/editar`}>
                    <Button size="sm" variant="ghost">Editar</Button>
                  </Link>
                  <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(c)}>
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

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Excluir cliente" size="sm">
        <p className="text-sm text-gray-600 mb-4">
          Deseja excluir o cliente <strong>{deleteTarget?.nome}</strong> e seus registros?
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