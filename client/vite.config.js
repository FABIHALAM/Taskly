import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// config.js must have a only one default export.No lees than one and no more than one.
export default defineConfig({
  plugins: [react(), tailwindcss()],
})