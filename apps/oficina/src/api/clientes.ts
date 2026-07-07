import api from './client'

export interface ClienteOficina {
  id: string
  nome: string
  telefone: string
  modeloVeiculo: string
  placa: string
  email?: string | null
  empresaId: string
  createdAt: string
  updatedAt: string
}

export interface CreateClientePayload {
  nome: string
  telefone: string
  modeloVeiculo: string
  placa: string
  email?: string
}

export const listarClientes = () => api.get<ClienteOficina[]>('/cliente-oficina').then((r) => r.data)
export const buscarCliente = (id: string) => api.get<ClienteOficina>(`/cliente-oficina/${id}`).then((r) => r.data)
export const criarCliente = (payload: CreateClientePayload) => api.post<ClienteOficina>('/cliente-oficina', payload).then((r) => r.data)
export const atualizarCliente = (id: string, payload: Partial<CreateClientePayload>) => api.patch<ClienteOficina>(`/cliente-oficina/${id}`, payload).then((r) => r.data)
export const deletarCliente = (id: string) => api.delete(`/cliente-oficina/${id}`).then((r) => r.data)