import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import { Layout, PublicLayout } from './components/layout/Layout'

import { Login } from './pages/Login'
import { Cadastro } from './pages/Cadastro'
import { Dashboard } from './pages/Dashboard'
import { Devedores } from './pages/Devedores/index'
import { DevedorForm } from './pages/Devedores/DevedorForm'
import { DevedorDetalhe } from './pages/Devedores/DevedorDetalhe'
import { Faixas } from './pages/Faixas/index'
import { FaixaForm } from './pages/Faixas/FaixaForm'
import { Propostas } from './pages/Propostas/index'
import { PropostaDetalhe } from './pages/Propostas/PropostaDetalhe'
import { Perfil } from './pages/Perfil'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
})

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
              <Route path="/devedores" element={<Devedores />} />
              <Route path="/devedores/novo" element={<DevedorForm />} />
              <Route path="/devedores/:id" element={<DevedorDetalhe />} />
              <Route path="/devedores/:id/editar" element={<DevedorForm />} />
              <Route path="/faixas" element={<Faixas />} />
              <Route path="/faixas/nova" element={<FaixaForm />} />
              <Route path="/faixas/:id/editar" element={<FaixaForm />} />
              <Route path="/propostas" element={<Propostas />} />
              <Route path="/propostas/:id" element={<PropostaDetalhe />} />
              <Route path="/perfil" element={<Perfil />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}
