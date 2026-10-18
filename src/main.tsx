/// <reference types="vite/client" />
import ReactDOM from 'react-dom/client'
import App from './App'
import StaffPanel from './staff'
import.meta.glob('./theme.css', { eager: true })
import './assets/main.css'

// Branch HQ: the staff pass, kept after a staff login and sent with this site's own /api/ requests.
{
  const KEY = 'branchhq.staffToken'
  const original = window.fetch.bind(window)
  // Where the server runs when the website is hosted on its own (VITE_API_URL, set where the site is built,
  // e.g. in Vercel); empty means the same address, which is how Render's one-click deploy runs it.
  const API_BASE = String(import.meta.env.VITE_API_URL || '').replace(/\/+$/, '')
  const urlOf = (input: RequestInfo | URL) => typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
  const ownApi = (url: string) => { try { const u = new URL(url, window.location.href); return u.origin === window.location.origin && u.pathname.startsWith('/api/') } catch { return false } }
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = urlOf(input)
    let request = init
    if (ownApi(url)) {
      let pass = ''
      try { pass = sessionStorage.getItem(KEY) || '' } catch { /* storage unavailable */ }
      const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined))
      if (pass && !headers.has('Authorization')) { headers.set('Authorization', 'Bearer ' + pass); request = { ...init, headers } }
    }
    let target: RequestInfo | URL = input
    if (API_BASE && ownApi(url) && !(input instanceof Request)) { const u = new URL(url, window.location.href); target = API_BASE + u.pathname + u.search }
    const res = await original(target, request)
    if (ownApi(url) && /\/api\/staff\/login\/?$/.test(new URL(url, window.location.href).pathname) && res.ok) {
      try { const data = await res.clone().json(); if (data && data.token) sessionStorage.setItem(KEY, data.token) } catch { /* not JSON */ }
    }
    return res
  }
}

const onStaff = window.location.pathname.replace(/\/+$/, '') === '/staff'
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(onStaff ? <StaffPanel /> : <App />)