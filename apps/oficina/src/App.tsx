import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import { Layout, PublicLayout } from './components/layout/Layout'

import { Login } from './pages/Login'
import { Cadastro } from './pages/Cadastro'
import { Dashboard } from './pages/Dashboard'
import { Clientes } from './pages/Clientes/index'
import { ClienteForm } from './pages/Clientes/ClienteForm'
import { ClienteDetalhe } from './pages/Clientes/ClienteDetalhe'
import { ServicoConfigList } from './pages/ServicoConfig/index'
import { ServicoConfigForm } from './pages/ServicoConfig/ServicoConfigForm'
import { Perfil } from './pages/Perfil'

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30_000 } } })

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Cadastro />} />
            </Route>

            <Route element={<Layout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              
              <Route path="/clientes" element={<Clientes />} />
              <Route path="/clientes/novo" element={<ClienteForm />} />
              <Route path="/clientes/:id" element={<ClienteDetalhe />} />
              <Route path="/clientes/:id/editar" element={<ClienteForm />} />

              <Route path="/servico-config" element={<ServicoConfigList />} />
              <Route path="/servico-config/novo" element={<ServicoConfigForm />} />
              <Route path="/servico-config/:id/editar" element={<ServicoConfigForm />} />
              
              <Route path="/perfil" element={<Perfil />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}