import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Puerto 5174 para convivir con web_carne (5173) y el backend (3000)
export default defineConfig({
  plugins: [react()],
  server: { port: 5174 },
})
