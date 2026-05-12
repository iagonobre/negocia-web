import api from './client'

export type StatusDevedor = 'PENDENTE' | 'EM_NEGOCIACAO' | 'ACORDADO' | 'PAGO' | 'SEM_RESPOSTA' | 'RECUSADO'
export type TipoPessoa = 'FISICA' | 'JURIDICA'
export type OrigemDevedor = 'API' | 'PLANILHA'

export interface Devedor {
  id: string
  nome: string
  email: string | null
  telefone: string
  tipoPessoa: TipoPessoa
  cpf: string | null
  cnpj: string | null
  valorDivida: number
  descricaoDivida: string | null
  vencimento: string
  numeroParcelas: number | null
  status: StatusDevedor
  origem: OrigemDevedor
  tentativas: number
  ultimoContato: string | null
  empresaId: string
}

export interface CreateDevedorPayload {
  nome: string
  email?: string
  telefone: string
  tipoPessoa: TipoPessoa
  cpf?: string
  cnpj?: string
  valorDivida: number
  descricaoDivida?: string
  vencimento: string
  status?: StatusDevedor
  origem?: OrigemDevedor
  tentativas?: number
  empresaId: string
}

export const listarDevedores = () => api.get<Devedor[]>('/devedor').then((r) => r.data)

export const buscarDevedor = (id: string) => api.get<Devedor>(`/devedor/${id}`).then((r) => r.data)

export const historicoDevedor = (id: string) =>
  api.get(`/devedor/${id}/historico`).then((r) => r.data)

export const criarDevedor = (payload: CreateDevedorPayload) =>
  api.post<Devedor>('/devedor/cadastrar', payload).then((r) => r.data)

export const atualizarDevedor = (id: string, payload: Partial<CreateDevedorPayload>) =>
  api.patch<Devedor>(`/devedor/atualizar/${id}`, payload).then((r) => r.data)

export const deletarDevedor = (id: string) =>
  api.delete(`/devedor/${id}`).then((r) => r.data)

export const importarCSV = (file: File) => {
  const form = new FormData()
  form.append('file', file)
  return api.post('/devedor/importar', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data)
}
