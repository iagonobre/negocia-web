import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { listarPacientes, deletarPaciente, type Paciente } from '../../api/pacientes'
import { iniciarRetornoWhatsApp } from '../../api/consultas'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/ui/EmptyState'
import { Modal } from '../../components/ui/Modal'

export function Pacientes() {
  const queryClient = useQueryClient()
  const [deleteTarget, setDeleteTarget] = useState<Paciente | null>(null)
  const [feedback, setFeedback] = useState('')
  const [filter, setFilter] = useState('')

  const { data = [], isLoading } = useQuery({ queryKey: ['pacientes'], queryFn: listarPacientes })

  const { mutate: deletar, isPending: deletando } = useMutation({
    mutationFn: (id: string) => deletarPaciente(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pacientes'] })
      setDeleteTarget(null)
    },
  })

  const { mutate: iniciar, isPending: iniciando } = useMutation({
    mutationFn: (pacienteId: string) => iniciarRetornoWhatsApp(pacienteId),
    onSuccess: () => {
      setFeedback('Contato iniciado! Mensagem enviada via WhatsApp.')
      setTimeout(() => setFeedback(''), 4000)
    },
  })

  const filtered = data.filter(
    (p) =>
      p.nome.toLowerCase().includes(filter.toLowerCase()) ||
      (p.email ?? '').toLowerCase().includes(filter.toLowerCase()),
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Pacientes</h1>
          <p className="text-sm text-gray-500 mt-0.5">{data.length} registro(s)</p>
        </div>
        <div className="flex gap-2">
          {feedback && <p className="text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-lg self-center">{feedback}</p>}
          <Link to="/pacientes/novo">
            <Button size="sm">Novo paciente</Button>
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
            title={filter ? 'Nenhum resultado encontrado' : 'Nenhum paciente cadastrado'}
            description={filter ? 'Tente outros termos de busca.' : 'Adicione pacientes manualmente para começar.'}
            action={!filter ? <Link to="/pacientes/novo"><Button size="sm">Novo paciente</Button></Link> : undefined}
          />
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((p) => (
              <div key={p.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.nome}</p>
                    <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
                      {p.convenio || 'Particular'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{p.email ?? p.telefone} · CPF: {p.cpf ?? 'Não informado'}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    loading={iniciando}
                    onClick={() => iniciar(p.id)}
                  >
                    Agendar Retorno
                  </Button>
                  <Link to={`/pacientes/${p.id}`}>
                    <Button size="sm" variant="ghost">Ver</Button>
                  </Link>
                  <Link to={`/pacientes/${p.id}/editar`}>
                    <Button size="sm" variant="ghost">Editar</Button>
                  </Link>
                  <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(p)}>
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
        title="Excluir paciente"
        size="sm"
      >
        <p className="text-sm text-gray-600 mb-4">
          Tem certeza que deseja excluir o paciente <strong>{deleteTarget?.nome}</strong>? Todos os dados serão removidos.
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