import api from './client'

export type StatusConsulta = 'PENDENTE' | 'CONFIRMADA' | 'REALIZADA' | 'CANCELADA'

export interface Consulta {
  id: string
  status: StatusConsulta
  dataAgendada: string | null
  historico: Array<{ role: string; content: string }>
  pacienteId: string
  empresaId: string
  createdAt: string
  updatedAt: string
}

export interface ConsultaComPaciente extends Consulta {
  paciente: { id: string; nome: string; telefone: string; convenio: string | null }
}

export const listarConsultas = () =>
  api.get<ConsultaComPaciente[]>('/consulta').then((r) => r.data)

export const buscarConsulta = (id: string) =>
  api.get<ConsultaComPaciente>(`/consulta/${id}`).then((r) => r.data)

export const iniciarRetornoWhatsApp = (pacienteId: string) =>
  api.post(`/consulta/iniciar/${pacienteId}`).then((r) => r.data)