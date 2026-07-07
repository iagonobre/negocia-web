import api from './client'
export const dispararLembretesOficina = () => api.post<{ enviados: number }>('/notificacao-oficina/lembretes/manual').then((r) => r.data)