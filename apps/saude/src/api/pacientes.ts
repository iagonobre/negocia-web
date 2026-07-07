import api from './client'

export interface Paciente {
  id: string
  nome: string
  telefone: string
  email?: string | null
  cpf?: string | null
  convenio?: string | null
  configRetornoId?: string | null
  empresaId: string
  createdAt: string
  updatedAt: string
}

export interface CreatePacientePayload {
  nome: string
  telefone: string
  email?: string
  cpf?: string
  convenio?: string
  configRetornoId?: string
}

export const listarPacientes = () => api.get<Paciente[]>('/paciente').then((r) => r.data)

export const buscarPaciente = (id: string) => api.get<Paciente>(`/paciente/${id}`).then((r) => r.data)

export const criarPaciente = (payload: CreatePacientePayload) =>
  api.post<Paciente>('/paciente', payload).then((r) => r.data)

export const atualizarPaciente = (id: string, payload: Partial<CreatePacientePayload>) =>
  api.patch<Paciente>(`/paciente/${id}`, payload).then((r) => r.data)

export const deletarPaciente = (id: string) =>
  api.delete(`/paciente/${id}`).then((r) => r.data)