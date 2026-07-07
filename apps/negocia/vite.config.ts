import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/auth': 'http://localhost:3000',
      '/empresa': 'http://localhost:3000',
      '/devedor': 'http://localhost:3000',
      '/faixas-criterio': 'http://localhost:3000',
      '/proposta': 'http://localhost:3000',
      '/whatsapp': 'http://localhost:3000',
      '/cobranca': 'http://localhost:3000',
    },
  },
})
