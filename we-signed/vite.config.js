import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import fs from "fs"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    port: 8000
  },
  // build: {
  //   outDir: 'dist',
  //   sourcemap: true,
  //   rollupOptions: {
  //     input: {
  //       main: 'src/main.jsx',
  //       auth: 'src/AuthForm.jsx',
  //       loading: 'src/Loading.jsx'
  //     }
  //   }
  // },
  // resolve: {
  //   alias: {
  //     '@': '/src',
  //     'components': '/src/components',
  //     'assets': '/src/assets',
  //     'utils': '/src/utils'
  //   }
  // },
  // css: {
})
