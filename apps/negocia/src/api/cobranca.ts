import api from './client'

export const dispararLembretes = () =>
  api.post<{ enviados: number }>('/cobranca/lembretes/manual').then((r) => r.data)
