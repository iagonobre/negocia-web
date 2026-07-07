import api from './client'

export interface FaixaCriterio {
  id: string
  descricao: string
  valorMinimo: number
  valorMaximo: number
  prazoMaximoDias: number
  parcelasMaximas: number
  descontoMaximo: number
  tomComunicacao: string
  mensagemInicial: string | null
  empresaId: string
}

export interface CreateFaixaPayload {
  descricao: string
  valorMinimo: number
  valorMaximo: number
  prazoMaximoDias: number
  parcelasMaximas: number
  descontoMaximo: number
  tomComunicacao: string
  mensagemInicial?: string
}

export const listarFaixas = () =>
  api.get<FaixaCriterio[]>('/faixas-criterio').then((r) => r.data)

export const buscarFaixa = (id: string) =>
  api.get<FaixaCriterio>(`/faixas-criterio/${id}`).then((r) => r.data)

export const criarFaixa = (payload: CreateFaixaPayload) =>
  api.post<FaixaCriterio>('/faixas-criterio', payload).then((r) => r.data)

export const atualizarFaixa = (id: string, payload: Partial<CreateFaixaPayload>) =>
  api.patch<FaixaCriterio>(`/faixas-criterio/${id}`, payload).then((r) => r.data)

export const deletarFaixa = (id: string) =>
  api.delete(`/faixas-criterio/${id}`).then((r) => r.data)
