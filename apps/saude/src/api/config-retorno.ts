import api from './client'

export interface ConfigRetorno {
  id: string
  descricao: string
  diasParaRetorno: number
  tomComunicacao: string
  mensagemInicial?: string
}

export interface CreateConfigRetornoPayload {
  descricao: string
  diasParaRetorno: number
  tomComunicacao: string
  mensagemInicial?: string
}

export const listarConfigRetornos = () => 
  api.get<ConfigRetorno[]>('/config-retorno').then((r) => r.data)

export const buscarConfigRetorno = (id: string) => 
  api.get<ConfigRetorno>(`/config-retorno/${id}`).then((r) => r.data)

export const criarConfigRetorno = (payload: CreateConfigRetornoPayload) =>
  api.post<ConfigRetorno>('/config-retorno', payload).then((r) => r.data)

export const atualizarConfigRetorno = (id: string, payload: Partial<CreateConfigRetornoPayload>) =>
  api.patch<ConfigRetorno>(`/config-retorno/${id}`, payload).then((r) => r.data)

export const deletarConfigRetorno = (id: string) =>
  api.delete(`/config-retorno/${id}`).then((r) => r.data)