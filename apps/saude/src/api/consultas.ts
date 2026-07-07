import api from './client'

export type StatusConsulta = 'AGUARDANDO_CONTATO' | 'EM_ATENDIMENTO' | 'AGENDADO' | 'CANCELADO' | 'SEM_RESPOSTA'

export interface Consulta {
  id: string
  status: StatusConsulta
  historico: Array<{ role: string; content: string }>
  pacienteId: string
  empresaId: string
  createdAt: string
  updatedAt: string
}

export const listarConsultas = () =>
  api.get<Consulta[]>('/consulta').then((r) => r.data)

export const buscarConsulta = (id: string) =>
  api.get<Consulta>(`/consulta/${id}`).then((r) => r.data)

export const iniciarRetornoWhatsApp = (pacienteId: string) =>
  api.post(`/consulta/iniciar/${pacienteId}`).then((r) => r.data)