import api from './client'

export interface Empresa {
  id: string
  nome: string
  email: string
  cnpj: string
  telefone: string
  createdAt: string
  updatedAt: string
  endereco: {
    id: string
    cep: string
    logradouro: string
    numero: string
    complemento: string | null
    bairro: string
    cidade: string
    estado: string
    empresaId: string
  } | null
}

export const getPerfil = () => api.get<Empresa>('/empresa/perfil').then((r) => r.data)

export const updatePerfil = (data: Partial<Omit<Empresa, 'id' | 'createdAt' | 'updatedAt' | 'endereco'>> & { senha?: string; endereco?: Partial<Empresa['endereco']> }) =>
  api.patch<Empresa>('/empresa/perfil', data).then((r) => r.data)

export const deletarConta = () => api.delete('/empresa/perfil').then((r) => r.data)