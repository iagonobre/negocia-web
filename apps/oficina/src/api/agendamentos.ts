import api from './client'

export type StatusAgendamento = 'PENDENTE' | 'EM_ATENDIMENTO' | 'AGENDADO' | 'CANCELADO' | 'SEM_RESPOSTA'

export interface Agendamento {
  id: string
  status: StatusAgendamento
  historico: Array<{ role: string; content: string }>
  clienteId: string
  empresaId: string
  createdAt: string
  updatedAt: string
}

export const listarAgendamentos = () => api.get<Agendamento[]>('/agendamento').then((r) => r.data)
export const buscarAgendamento = (id: string) => api.get<Agendamento>(`/agendamento/${id}`).then((r) => r.data)
export const iniciarAgendamento = (clienteId: string) => api.post(`/agendamento/iniciar/${clienteId}`).then((r) => r.data)