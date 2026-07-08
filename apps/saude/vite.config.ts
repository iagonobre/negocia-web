import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// A API é acessada diretamente via VITE_API_URL (ver .env / src/api/client.ts).
// Não usamos proxy aqui de propósito: rotas de página no plural (ex: /pacientes)
// colidiam por prefixo com rotas da API no singular (ex: /paciente), fazendo o
// Vite encaminhar a navegação inteira pro backend em vez de servir o app.
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
