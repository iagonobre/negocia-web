import api from './client'

export interface LoginPayload {
  email: string
  senha: string
}

export interface LoginResponse {
  access_token: string
  empresa: {
    id: string
    nome: string
    email: string
  }
}

export interface CadastroPayload {
  nome: string
  email: string
  senha: string
  cnpj: string
  telefone: string
  endereco: {
    cep: string
    logradouro: string
    numero: string
    complemento?: string
    bairro: string
    cidade: string
    estado: string
  }
}

export const login = (payload: LoginPayload) =>
  api.post<LoginResponse>('/auth/login', payload).then((r) => r.data)

export const cadastrar = (payload: CadastroPayload) =>
  api.post('/empresa/cadastrar', payload).then((r) => r.data)
