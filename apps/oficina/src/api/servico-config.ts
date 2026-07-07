import api from './client'

export interface ServicoConfig {
  id: string
  descricao: string
  prazoRevisaoDias: number
  tomComunicacao: string
  mensagemInicial?: string
}

export type CreateServicoPayload = Omit<ServicoConfig, 'id'>

export const listarServicos = () => api.get<ServicoConfig[]>('/servico-config').then((r) => r.data)
export const buscarServico = (id: string) => api.get<ServicoConfig>(`/servico-config/${id}`).then((r) => r.data)
export const criarServico = (payload: CreateServicoPayload) => api.post<ServicoConfig>('/servico-config', payload).then((r) => r.data)
export const atualizarServico = (id: string, payload: Partial<CreateServicoPayload>) => api.patch<ServicoConfig>(`/servico-config/${id}`, payload).then((r) => r.data)
export const deletarServico = (id: string) => api.delete(`/servico-config/${id}`).then((r) => r.data)