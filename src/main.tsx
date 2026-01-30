import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { getSerwist } from 'virtual:serwist'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

async function registerSW() {
  if ('serviceWorker' in navigator) {
    const serwist = await getSerwist()
    serwist?.register()
  }
}

registerSW()
