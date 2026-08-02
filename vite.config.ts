import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig({
  plugins: [react()],
  // Content lives outside /src so agents have one obvious place to write.
  resolve: { alias: { '/content': resolve(__dirname, 'content') } },
  build: {
    rollupOptions: {
      output: {
        // three/drei must stay out of the initial bundle. The document route
        // has to paint without downloading a 3D engine.
        manualChunks: {
          three: ['three', '@react-three/fiber', '@react-three/drei'],
        },
      },
    },
  },
})
