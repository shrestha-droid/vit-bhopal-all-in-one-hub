import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const frontendPort = Number(process.env.BRANCH_HQ_FRONTEND_PORT) || 3000
const backendPort = Number(process.env.BRANCH_HQ_BACKEND_PORT) || 8787
const exposeToNetwork = process.env.BRANCH_HQ_EXPOSE_HOST === '1'

export default defineConfig({
  plugins: [react()],
  server: {
    port: frontendPort,
    strictPort: true,
    host: exposeToNetwork ? '0.0.0.0' : 'localhost',
    proxy: {
      // Relative /api/* calls from the app are forwarded here, server-side.
      // This is what makes the frontend work unchanged both locally and
      // when its preview is opened from another device on the network.
      '/api': {
        target: `http://localhost:${backendPort}`,
        changeOrigin: true
      },
      // Socket.io does NOT connect under /api -- it uses its own
      // /socket.io/ path -- so without this rule a real-time app cannot
      // reach the backend at all. io() connects to the page origin, which
      // is this dev server, asks for /socket.io/?EIO=4, gets a 404, and
      // retries forever while the UI sits there looking connected.
      //
      // ws: true is the other half: the handshake starts as HTTP polling
      // and then upgrades to a WebSocket, and a proxy that forwards only
      // the HTTP half leaves the connection stuck in polling or failing
      // outright.
      '/socket.io': {
        target: `http://localhost:${backendPort}`,
        changeOrigin: true,
        ws: true
      }
    }
  }
})