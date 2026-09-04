import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // IMPORTANT: change this to match your GitHub repo name, e.g. if your repo
  // is github.com/you/piano-scheduler, this should be "/piano-scheduler/"
  base: "/piano-scheduler/",
})
