import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getPerfil, updatePerfil, deletarConta } from '../api/empresa'
import { useAuth } from '../contexts/AuthContext'
import { Input } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Card, CardBody, CardHeader } from '../components/ui/Card'
import { Spinner } from '../components/ui/Spinner'
import { Modal } from '../components/ui/Modal'

export function Perfil() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [deleteModal, setDeleteModal] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  const { data, isLoading } = useQuery({ queryKey: ['perfil'], queryFn: getPerfil })

  const [form, setForm] = useState({
    nome: '',
    telefone: '',
    senha: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
  })

  const [editing, setEditing] = useState(false)

  const startEdit = () => {
    if (data) {
      setForm({
        nome: data.nome,
        telefone: data.telefone,
        senha: '',
        cep: data.endereco?.cep ?? '',
        logradouro: data.endereco?.logradouro ?? '',
        numero: data.endereco?.numero ?? '',
        complemento: data.endereco?.complemento ?? '',
        bairro: data.endereco?.bairro ?? '',
        cidade: data.endereco?.cidade ?? '',
        estado: data.endereco?.estado ?? '',
      })
    }
    setEditing(true)
  }

  const { mutate: salvar, isPending: salvando } = useMutation({
    mutationFn: () =>
      updatePerfil({
        nome: form.nome || undefined,
        telefone: form.telefone || undefined,
        senha: form.senha || undefined,
        endereco: {
          cep: form.cep || undefined,
          logradouro: form.logradouro || undefined,
          numero: form.numero || undefined,
          complemento: form.complemento || undefined,
          bairro: form.bairro || undefined,
          cidade: form.cidade || undefined,
          estado: form.estado || undefined,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['perfil'] })
      setEditing(false)
      setSuccess('Perfil atualizado com sucesso.')
      setTimeout(() => setSuccess(''), 3000)
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message
      setError(Array.isArray(msg) ? msg[0] : (msg ?? 'Erro ao atualizar perfil.'))
      setTimeout(() => setError(''), 4000)
    },
  })

  const { mutate: deletar, isPending: deletando } = useMutation({
    mutationFn: deletarConta,
    onSuccess: () => {
      logout()
      navigate('/login')
    },
  })

  const set = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }))

  if (isLoading) return <div className="flex justify-center py-20"><Spinner /></div>
  if (!data) return null

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Perfil</h1>
          <p className="text-sm text-gray-500 mt-0.5">Dados da sua empresa</p>
        </div>
        <div className="flex items-center gap-3">
          {success && <p className="text-sm text-green-700 bg-green-50 px-3 py-1.5 rounded-lg">{success}</p>}
          {error && <p className="text-sm text-red-500 bg-red-50 px-3 py-1.5 rounded-lg">{error}</p>}
          {!editing && <Button size="sm" variant="secondary" onClick={startEdit}>Editar</Button>}
        </div>
      </div>

      {!editing ? (
        <>
          <Card>
            <CardHeader><h2 className="text-sm font-semibold text-gray-900">Dados da empresa</h2></CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                {[
                  ['Nome', data.nome],
                  ['E-mail', data.email],
                  ['CNPJ', data.cnpj],
                  ['Telefone', data.telefone],
                  ['Cadastro', new Date(data.createdAt).toLocaleDateString('pt-BR')],
                ].map(([k, v]) => (
                  <div key={String(k)}>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">{k}</p>
                    <p className="font-medium text-gray-900 mt-0.5">{v}</p>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {data.endereco && (
            <Card>
              <CardHeader><h2 className="text-sm font-semibold text-gray-900">Endereço</h2></CardHeader>
              <CardBody>
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
                  {[
                    ['Logradouro', data.endereco.logradouro],
                    ['Número', data.endereco.numero],
                    ['Complemento', data.endereco.complemento ?? '—'],
                    ['Bairro', data.endereco.bairro],
                    ['Cidade', data.endereco.cidade],
                    ['Estado', data.endereco.estado],
                    ['CEP', data.endereco.cep],
                  ].map(([k, v]) => (
                    <div key={String(k)}>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">{k}</p>
                      <p className="font-medium text-gray-900 mt-0.5">{v}</p>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          <div className="pt-2">
            <Button variant="danger" size="sm" onClick={() => setDeleteModal(true)}>
              Excluir conta
            </Button>
          </div>
        </>
      ) : (
        <Card>
          <CardBody className="flex flex-col gap-4">
            <p className="text-sm font-medium text-gray-700">Dados da empresa</p>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Nome" value={form.nome} onChange={(e) => set('nome', e.target.value)} />
              <Input label="Telefone" value={form.telefone} onChange={(e) => set('telefone', e.target.value)} />
            </div>
            <Input label="Nova senha" type="password" value={form.senha} onChange={(e) => set('senha', e.target.value)} placeholder="Deixe em branco para manter a atual" />

            <hr className="border-gray-100" />
            <p className="text-sm font-medium text-gray-700">Endereço</p>

            <div className="grid grid-cols-3 gap-3">
              <Input label="CEP" value={form.cep} onChange={(e) => set('cep', e.target.value)} />
              <Input label="Número" value={form.numero} onChange={(e) => set('numero', e.target.value)} />
              <Input label="Complemento" value={form.complemento} onChange={(e) => set('complemento', e.target.value)} />
            </div>
            <Input label="Logradouro" value={form.logradouro} onChange={(e) => set('logradouro', e.target.value)} />
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <Input label="Cidade" value={form.cidade} onChange={(e) => set('cidade', e.target.value)} />
              </div>
              <Input label="Estado (UF)" value={form.estado} onChange={(e) => set('estado', e.target.value)} maxLength={2} />
            </div>
            <Input label="Bairro" value={form.bairro} onChange={(e) => set('bairro', e.target.value)} />

            <div className="flex gap-3 pt-2">
              <Button variant="secondary" onClick={() => setEditing(false)}>Cancelar</Button>
              <Button loading={salvando} onClick={() => salvar()}>Salvar alterações</Button>
            </div>
          </CardBody>
        </Card>
      )}

      <Modal open={deleteModal} onClose={() => { setDeleteModal(false); setConfirmText('') }} title="Excluir conta" size="sm">
        <p className="text-sm text-gray-600 mb-3">
          Esta ação é <strong>irreversível</strong>. Todos os devedores, propostas e configurações serão excluídos permanentemente.
        </p>
        <p className="text-sm text-gray-600 mb-3">Digite <strong>EXCLUIR</strong> para confirmar:</p>
        <input
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100 mb-4"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="EXCLUIR"
        />
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => { setDeleteModal(false); setConfirmText('') }}>Cancelar</Button>
          <Button
            variant="danger"
            loading={deletando}
            disabled={confirmText !== 'EXCLUIR'}
            onClick={() => deletar()}
          >
            Excluir conta
          </Button>
        </div>
      </Modal>
    </div>
  )
}
