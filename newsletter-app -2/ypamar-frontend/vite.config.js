import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { cpSync, rmSync, existsSync, mkdirSync } from 'fs'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-to-backend',
      closeBundle() {
        const backendPublic = resolve(__dirname, '../backend/public')
        const backendAssets = resolve(backendPublic, 'assets')
        const distFolder = resolve(__dirname, 'dist')

        console.log('📦 Copying build files to backend...')

        // Crea la cartella public se non esiste
        if (!existsSync(backendPublic)) {
          mkdirSync(backendPublic, { recursive: true })
          console.log('📁 Created backend/public/ folder')
        }

        // 🧹 Pulisci i vecchi assets prima di copiare
        if (existsSync(backendAssets)) {
          rmSync(backendAssets, { recursive: true, force: true })
          console.log('🧹 Cleaned old assets/')
        }

        try {
          // Copia tutto il contenuto di dist/ in backend/public/
          cpSync(distFolder, backendPublic, { recursive: true })
          console.log('✅ Files successfully copied to ../backend/public/')
          console.log('   - index.html')
          console.log('   - assets/')
        } catch (error) {
          console.error('❌ Error copying files:', error.message)
        }
      }
    }
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
