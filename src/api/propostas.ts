import api from './client'

export type StatusProposta = 'PENDENTE' | 'ACEITA' | 'RECUSADA'

export interface Proposta {
  id: string
  status: StatusProposta
  valorAcordado: number | null
  parcelasAcordadas: number | null
  limites: {
    valorOriginal: number
    descontoMaximo: number
    parcelasMaximas: number
    prazoMaximoDias: number
  }
  historico: Array<{ role: string; content: string }>
  devedorId: string
  empresaId: string
  createdAt: string
  updatedAt: string
}

export const listarPropostas = () =>
  api.get<Proposta[]>('/proposta').then((r) => r.data)

export const buscarProposta = (id: string) =>
  api.get<Proposta>(`/proposta/${id}`).then((r) => r.data)

export const iniciarNegociacao = (devedorId: string) =>
  api.post(`/whatsapp/iniciar/${devedorId}`).then((r) => r.data)

export const enviarMensagem = (id: string, mensagem: string) =>
  api.post<{ id: string; mensagemAgente: string }>(`/proposta/${id}/chat`, { mensagem }).then((r) => r.data)

export const fecharAcordo = (
  id: string,
  payload: { status: StatusProposta; valorAcordado?: number; parcelasAcordadas?: number },
) => api.patch<Proposta>(`/proposta/${id}/status`, payload).then((r) => r.data)
