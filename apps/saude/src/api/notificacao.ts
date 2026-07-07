import api from './client'

export const dispararLembretesSaude = () => 
  api.post<{ enviados: number }>('/notificacao-saude/lembretes/manual').then((r) => r.data)