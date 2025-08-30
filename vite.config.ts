import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],  
  base: "/",
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          // Creates a vendor chunk that contains all code from node_modules
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  }
})