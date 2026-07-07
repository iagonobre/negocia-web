import api from './client'

export const dispararLembretes = () =>
  api.post<{ enviados: number }>('/cobranca/lembretes').then((r) => r.data)
