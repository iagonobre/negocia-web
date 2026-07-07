import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import { Layout, PublicLayout } from './components/layout/Layout'

import { Login } from './pages/Login'
import { Cadastro } from './pages/Cadastro'
import { Dashboard } from './pages/Dashboard'
import { Pacientes } from './pages/Pacientes/index'
import { PacienteForm } from './pages/Pacientes/PacienteForm'
import { PacienteDetalhe } from './pages/Pacientes/PacienteDetalhe'
import { Perfil } from './pages/Perfil'
import { ConfigRetornoList } from './pages/ConfigRetorno/index'
import { ConfigRetornoForm } from './pages/ConfigRetorno/ConfigRetornoForm'

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
              
              <Route path="/pacientes" element={<Pacientes />} />
              <Route path="/pacientes/novo" element={<PacienteForm />} />
              <Route path="/pacientes/:id" element={<PacienteDetalhe />} />
              <Route path="/pacientes/:id/editar" element={<PacienteForm />} />

              <Route path="/config-retorno" element={<ConfigRetornoList />} />
              <Route path="/config-retorno/nova" element={<ConfigRetornoForm />} />
              <Route path="/config-retorno/:id/editar" element={<ConfigRetornoForm />} />
              
              <Route path="/perfil" element={<Perfil />} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}