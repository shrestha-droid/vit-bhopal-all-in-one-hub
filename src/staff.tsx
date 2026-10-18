import { useEffect, useState } from 'react'

type Column = { name: string; type: string; pk: boolean; protected?: boolean }
type Table = { name: string; key: string; columns: Column[]; rows: Array<Record<string, unknown>> }

const TOKEN = 'branchhq.staffToken'
const getToken = () => { try { return sessionStorage.getItem(TOKEN) || '' } catch { return '' } }
const setToken = (t: string) => { try { t ? sessionStorage.setItem(TOKEN, t) : sessionStorage.removeItem(TOKEN) } catch { /* unavailable */ } }

async function call(path: string, init: { method?: string; body?: unknown } = {}): Promise<any> {
  const res = await fetch(path, {
    method: init.method || 'GET',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + getToken() },
    body: init.body === undefined ? undefined : JSON.stringify(init.body)
  })
  if (res.status === 401) { setToken(''); throw new Error('You were signed out. Sign in again.') }
  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error((data && data.error && (typeof data.error.message === 'string' ? data.error.message : data.error.code)) || 'That did not work (' + res.status + ').')
  return data
}

async function download(path: string, fallbackName: string) {
  const res = await fetch(path, { headers: { Authorization: 'Bearer ' + getToken() } })
  if (!res.ok) throw new Error('Could not download (' + res.status + ').')
  const name = (/filename="([^"]+)"/.exec(res.headers.get('Content-Disposition') || '') || [])[1] || fallbackName
  const url = URL.createObjectURL(await res.blob())
  const a = document.createElement('a')
  a.href = url; a.download = name; a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const label = (s: string) => s.replace(/[_-]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, c => c.toUpperCase())
const shown = (v: unknown) => v === null || v === undefined ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v)
const isProtected = (v: unknown) => typeof v === 'string' && v.startsWith('enc:')

const INPUT = 'w-full rounded-md border border-line bg-canvas px-2.5 py-1.5 text-sm text-ink outline-none focus:border-accent'
const BTN = 'rounded-md border border-line px-3 py-1.5 text-sm text-ink hover:bg-surface disabled:opacity-40'
const PRIMARY = 'rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-on-accent hover:opacity-90 disabled:opacity-40'

// The sign-in page: the business's own name, a name and a password, and what to do when a password is forgotten.
function Login({ onIn }: { onIn: () => void }) {
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [forgot, setForgot] = useState(false)
  const [brand, setBrand] = useState('')
  useEffect(() => {
    fetch('/api/settings').then(r => r.ok ? r.json() : null).then(s => {
      // The model names the field: name, businessName, company_name, storeName...
      const key = s && Object.keys(s).find(k => /^(business|company|brand|store|shop|site)?[_ ]?name$/i.test(k) && typeof s[k] === 'string')
      if (key) setBrand(s[key])
    }).catch(() => {})
  }, [])
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      const r = await fetch('/api/staff/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name.trim(), password, code: password }) /* code: a Python site's own login reads that */ })
      const data = await r.json().catch(() => null)
      if (r.status === 429) throw new Error('Too many attempts. Try again in 15 minutes.')
      if (!r.ok || !data || !data.token) throw new Error((data && data.error && data.error.message) || 'That name and password do not match.')
      setToken(data.token); onIn()
    } catch (err: any) { setError(err.message === 'Failed to fetch' ? 'Could not reach the site. Check your connection and try again.' : err.message) } finally { setBusy(false) }
  }
  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-12">
      <form onSubmit={submit} className="w-full max-w-sm space-y-5 rounded-xl border border-line bg-surface p-7 shadow-sm">
        <div className="space-y-1">
          {brand && <p className="text-xs uppercase tracking-widest text-muted">{brand}</p>}
          <h1 className="font-display text-2xl text-ink">Sign in</h1>
          <p className="text-sm text-muted">For the people who run this site.</p>
        </div>
        <label className="block space-y-1.5">
          <span className="text-sm text-ink">Name</span>
          <input autoFocus autoComplete="username" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Owner" className={INPUT + ' py-2'} />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm text-ink">Password</span>
          <span className="relative block">
            <input type={show ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} className={INPUT + ' py-2 pr-16'} />
            <button type="button" onClick={() => setShow(v => !v)} className="absolute inset-y-0 right-0 px-3 text-xs text-muted hover:text-ink" aria-label={show ? 'Hide password' : 'Show password'}>{show ? 'Hide' : 'Show'}</button>
          </span>
        </label>
        {error && <p role="alert" className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600">{error}</p>}
        <button disabled={busy || !password} className={PRIMARY + ' w-full py-2'}>{busy ? 'Signing in...' : 'Sign in'}</button>
        <div className="flex items-center justify-between text-sm">
          <button type="button" onClick={() => setForgot(v => !v)} className="text-muted hover:text-ink">Forgot your password?</button>
          <a href="/" className="text-muted hover:text-ink">Back to the site</a>
        </div>
        {forgot && (
          <div className="space-y-1.5 rounded-md border border-line px-3 py-2.5 text-sm text-muted">
            <p><span className="text-ink">On the team?</span> Ask the owner — they can set you a new password from Team.</p>
            <p><span className="text-ink">The owner?</span> In your host's settings add STAFF_RESET_CODE with a new password (8+ characters) and restart the site; sign in with it, then remove the setting.</p>
          </div>
        )}
      </form>
    </div>
  )
}

function Details({ owner = true }: { owner?: boolean }) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [newKey, setNewKey] = useState('')
  const [note, setNote] = useState('')
  const load = () => fetch('/api/settings').then(r => r.ok ? r.json() : {}).then((s: Record<string, unknown>) => setValues(Object.fromEntries(Object.entries(s || {}).map(([k, v]) => [k, shown(v)])))).catch(() => {})
  useEffect(() => { load() }, [])
  const save = async () => {
    setNote('')
    const patch: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(values)) { try { patch[k] = /^[\[{]/.test(v.trim()) ? JSON.parse(v) : v } catch { patch[k] = v } }
    try { await call('/api/settings', { method: 'PUT', body: patch }); setNote('Saved. The site shows the new details now.'); load() } catch (err: any) { setNote(err.message) }
  }
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">The business's details as the site shows them: name, phone, hours, prices and anything else kept here.</p>
      {Object.keys(values).length === 0 && <p className="text-sm text-muted">No details saved yet. Add the first one below.</p>}
      {Object.entries(values).map(([k, v]) => (
        <label key={k} className="block">
          <span className="text-xs uppercase tracking-wide text-muted">{label(k)}</span>
          {!owner ? <p className="px-1 py-1.5 text-sm text-ink">{v || <span className="text-muted">--</span>}</p>
            : isPicture(k) ? <PictureField value={v} onChange={nv => setValues({ ...values, [k]: nv })} />
            : v.length > 60 || /^[\[{]/.test(v.trim()) ? <textarea rows={3} value={v} onChange={e => setValues({ ...values, [k]: e.target.value })} className={INPUT} /> : <input value={v} onChange={e => setValues({ ...values, [k]: e.target.value })} className={INPUT} />}
        </label>
      ))}
      {owner ? <>
        <div className="flex gap-2">
          <input value={newKey} onChange={e => setNewKey(e.target.value)} placeholder="New detail, e.g. instagram" className={INPUT} />
          <button onClick={() => { if (newKey.trim()) { setValues({ ...values, [newKey.trim()]: '' }); setNewKey('') } }} className={BTN}>Add</button>
        </div>
        <div className="flex items-center gap-3"><button onClick={save} className={PRIMARY}>Save details</button>{note && <span className="text-sm text-muted">{note}</span>}</div>
      </> : <p className="text-sm text-muted">Only the owner can change the business's details.</p>}
    </div>
  )
}

// Pictures: a field named for one (image, photo, logo...) shows it and takes an upload from this computer.
// The file goes to the site's own server (POST /api/staff/images) and the field keeps its address. A list of
// pictures (a JSON array) gets the new one added; a single picture is replaced.
const isPicture = (name: string) => /image|photo|picture|img|logo|thumbnail|cover|banner|gallery/i.test(name)
const picturesIn = (v: string) => { try { const a = JSON.parse(v); if (Array.isArray(a)) return a.filter(x => typeof x === 'string') } catch { /* one address */ } return v ? [v] : [] }
function PictureField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const list = picturesIn(value)
  const isList = value.trim().startsWith('[')
  const pick = async (file: File | undefined) => {
    if (!file) return
    setError(''); setBusy(true)
    try {
      const dataUrl = await new Promise<string>((ok, fail) => { const r = new FileReader(); r.onload = () => ok(String(r.result)); r.onerror = () => fail(new Error('Could not read that file.')); r.readAsDataURL(file) })
      const { url } = await call('/api/staff/images', { method: 'POST', body: { dataUrl } })
      onChange(isList ? JSON.stringify([...list, url]) : url)
    } catch (err: any) { setError(err.message) } finally { setBusy(false) }
  }
  return (
    <div className="flex min-w-[12rem] flex-wrap items-center gap-1.5">
      {list.map((src, i) => (
        <span key={src + i} className="relative">
          <img src={src} alt="" className="h-10 w-10 rounded object-cover" />
          {isList && <button title="Remove this picture" onClick={() => onChange(JSON.stringify(list.filter((_, j) => j !== i)))} className="absolute -right-1 -top-1 rounded-full bg-surface px-1 text-[10px] text-muted">x</button>}
        </span>
      ))}
      <label className={BTN + ' cursor-pointer'}>
        {busy ? 'Uploading...' : list.length && !isList ? 'Replace' : 'Upload'}
        <input type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/avif" className="hidden" onChange={e => pick(e.target.files?.[0])} />
      </label>
      {error && <span className="text-xs text-muted">{error}</span>}
    </div>
  )
}

const PRICE_FIELD = /price|cost|amount|fee|discount|salary|wage/i
function TableEditor({ table, onChanged, owner = true }: { table: Table; onChanged: () => void; owner?: boolean }) {
  const editable = table.columns.filter(c => !c.pk)
  const [draft, setDraft] = useState<Record<string, string>>({})
  const [edits, setEdits] = useState<Record<string, Record<string, string>>>({})
  const [note, setNote] = useState('')
  const keyOf = (row: Record<string, unknown>) => String(row[table.key])
  const run = async (fn: () => Promise<unknown>, done: string) => {
    setNote('')
    try { await fn(); setNote(done); onChanged() } catch (err: any) { setNote(err.message) }
  }
  const base = '/api/staff/data/' + encodeURIComponent(table.name)
  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-md border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
            <tr>{editable.map(c => <th key={c.name} className="px-2.5 py-2 font-medium">{label(c.name)}</th>)}<th className="px-2.5 py-2" /></tr>
          </thead>
          <tbody>
            {table.rows.map(row => {
              const id = keyOf(row)
              const changed = edits[id] || {}
              return (
                <tr key={id} className="border-t border-line">
                  {editable.map(c => (
                    <td key={c.name} className="px-1.5 py-1 align-top">
                      {isProtected(row[c.name]) || c.protected
                        ? <span className="px-1 text-xs text-muted">(protected)</span>
                        : !owner && PRICE_FIELD.test(c.name)
                        ? <span className="px-1 text-sm text-ink" title="Only the owner can change prices">{shown(row[c.name])}</span>
                        : isPicture(c.name)
                          ? <PictureField value={changed[c.name] !== undefined ? changed[c.name] : shown(row[c.name])} onChange={v => setEdits({ ...edits, [id]: { ...changed, [c.name]: v } })} />
                          : <input value={changed[c.name] !== undefined ? changed[c.name] : shown(row[c.name])} onChange={e => setEdits({ ...edits, [id]: { ...changed, [c.name]: e.target.value } })} className={INPUT + ' min-w-[8rem]'} />}
                    </td>
                  ))}
                  <td className="whitespace-nowrap px-1.5 py-1 text-right">
                    {Object.keys(changed).length > 0 && <button onClick={() => run(() => call(base + '/' + encodeURIComponent(id), { method: 'PUT', body: changed }).then(() => setEdits({ ...edits, [id]: {} })), 'Saved.')} className={PRIMARY + ' mr-1'}>Save</button>}
                    {owner && <button onClick={() => { if (confirm('Remove this entry for good?')) run(() => call(base + '/' + encodeURIComponent(id), { method: 'DELETE' }), 'Removed.') }} className={BTN}>Remove</button>}
                  </td>
                </tr>
              )
            })}
            {table.rows.length === 0 && <tr><td colSpan={editable.length + 1} className="px-2.5 py-3 text-muted">Nothing here yet.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="rounded-md border border-line p-3">
        <p className="mb-2 text-sm font-medium text-ink">Add a new entry</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {editable.filter(c => !c.protected && (owner || !PRICE_FIELD.test(c.name))).map(c => isPicture(c.name)
            ? <div key={c.name}><p className="mb-1 text-xs text-muted">{label(c.name)}</p><PictureField value={draft[c.name] || ''} onChange={v => setDraft({ ...draft, [c.name]: v })} /></div>
            : <input key={c.name} value={draft[c.name] || ''} onChange={e => setDraft({ ...draft, [c.name]: e.target.value })} placeholder={label(c.name)} className={INPUT} />)}
        </div>
        <button onClick={() => run(() => call(base, { method: 'POST', body: Object.fromEntries(Object.entries(draft).filter(([, v]) => v !== '')) }).then(() => setDraft({})), 'Added.')} className={PRIMARY + ' mt-2'}>Add</button>
      </div>
      {note && <p className="text-sm text-muted">{note}</p>}
    </div>
  )
}

function Account({ owner = true, who, onRenamed }: { owner?: boolean; who: { level: string; name: string } | null; onRenamed: (name: string) => void }) {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [again, setAgain] = useState('')
  const [ownerName, setOwnerName] = useState(who ? who.name : '')
  const [note, setNote] = useState('')
  const act = async (fn: () => Promise<unknown>, done: string) => { setNote(''); try { await fn(); setNote(done) } catch (err: any) { setNote(err.message) } }
  const mismatch = again.length > 0 && again !== next
  return (
    <div className="max-w-lg space-y-7">
      <div className="space-y-2">
        <p className="text-sm font-medium text-ink">Downloads</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => act(() => download('/api/export.csv', 'records.csv'), 'Spreadsheet downloaded.')} className={BTN}>Spreadsheet (CSV)</button>
          {owner && <button onClick={() => act(() => download('/api/staff/backup', 'backup.db'), 'Backup downloaded. Keep a copy somewhere other than the server.')} className={BTN}>Full backup</button>}
        </div>
      </div>
      <form className="space-y-2" onSubmit={e => { e.preventDefault(); act(() => call('/api/staff/me/password', { method: 'POST', body: { current, next } }).then((r: any) => { setToken(r.token); setCurrent(''); setNext(''); setAgain('') }), 'Password changed. Anywhere else you were signed in has been signed out.') }}>
        <p className="text-sm font-medium text-ink">Your password</p>
        <input type="password" autoComplete="current-password" value={current} onChange={e => setCurrent(e.target.value)} placeholder="Current password" className={INPUT} />
        <input type="password" autoComplete="new-password" value={next} onChange={e => setNext(e.target.value)} placeholder="New password (8+ characters)" className={INPUT} />
        <input type="password" autoComplete="new-password" value={again} onChange={e => setAgain(e.target.value)} placeholder="New password again" className={INPUT} />
        {mismatch && <p className="text-sm text-red-600">The two new passwords are different.</p>}
        <button disabled={!current || next.length < 8 || again !== next} className={PRIMARY}>Change password</button>
      </form>
      {owner && <form className="space-y-2" onSubmit={e => { e.preventDefault(); act(() => call('/api/staff/owner-name', { method: 'PUT', body: { name: ownerName } }).then((r: any) => { setToken(r.token); onRenamed(r.name) }), 'You now sign in as ' + ownerName.trim() + '.') }}>
        <p className="text-sm font-medium text-ink">Your sign-in name</p>
        <div className="flex gap-2">
          <input value={ownerName} onChange={e => setOwnerName(e.target.value)} className={INPUT} />
          <button disabled={!ownerName.trim() || (who !== null && ownerName.trim() === who.name)} className={BTN}>Save</button>
        </div>
      </form>}
      {owner && <div className="space-y-2">
        <p className="text-sm font-medium text-ink">Sign out everywhere</p>
        <p className="text-sm text-muted">For a lost phone or someone who left: everyone, on every device, has to sign in again. You stay signed in here.</p>
        <button onClick={() => { if (confirm('Sign everyone out on every device?')) act(() => call('/api/staff/signout-everywhere', { method: 'POST' }).then((r: any) => setToken(r.token)), 'Everyone else has been signed out.') }} className={BTN}>Sign out everywhere</button>
      </div>}
      {note && <p className="text-sm text-muted">{note}</p>}
    </div>
  )
}

// The owner's team: each person signs in with their own name and password. A team member can look at
// everything and keep the lists up to date, but not change prices, the business's details or the team, take
// backups, or remove entries.
function Team() {
  const [team, setTeam] = useState<Array<{ id: string; name: string; createdAt: string }>>([])
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [resetting, setResetting] = useState('')
  const [fresh, setFresh] = useState('')
  const [note, setNote] = useState('')
  const load = () => call('/api/staff/team').then(setTeam).catch((err: Error) => setNote(err.message))
  useEffect(() => { load() }, [])
  const act = async (fn: () => Promise<unknown>, done: string) => { setNote(''); try { await fn(); setNote(done); load() } catch (err: any) { setNote(err.message) } }
  return (
    <div className="max-w-lg space-y-4">
      <p className="text-sm text-muted">Each person signs in with their own name and password. They can see everything and keep orders, stock and enquiries up to date — only you can change prices and the business's details, remove entries, take backups or manage the team.</p>
      <ul className="divide-y divide-line rounded-md border border-line">
        {team.map(m => (
          <li key={m.id} className="space-y-2 px-3 py-2 text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="text-ink">{m.name}</span>
              <span className="flex gap-2">
                <button onClick={() => { setResetting(resetting === m.id ? '' : m.id); setFresh('') }} className={BTN}>New password</button>
                <button onClick={() => { if (confirm('Remove ' + m.name + '? They are signed out at once.')) act(() => call('/api/staff/team/' + encodeURIComponent(m.id), { method: 'DELETE' }), m.name + ' removed.') }} className={BTN}>Remove</button>
              </span>
            </div>
            {resetting === m.id && (
              <div className="flex gap-2">
                <input type="text" autoComplete="off" value={fresh} onChange={e => setFresh(e.target.value)} placeholder={'New password for ' + m.name + ' (8+ characters)'} className={INPUT} />
                <button disabled={fresh.trim().length < 8} onClick={() => act(() => call('/api/staff/team/' + encodeURIComponent(m.id) + '/password', { method: 'PUT', body: { password: fresh } }).then(() => { setResetting(''); setFresh('') }), 'Done — give ' + m.name + ' the new password. They sign in with it from now on.')} className={PRIMARY}>Set</button>
              </div>
            )}
          </li>
        ))}
        {team.length === 0 && <li className="px-3 py-2 text-sm text-muted">Only you so far.</li>}
      </ul>
      <form className="flex flex-wrap gap-2" onSubmit={e => { e.preventDefault(); act(() => call('/api/staff/team', { method: 'POST', body: { name, password } }).then(() => { setName(''); setPassword('') }), name.trim() + ' added. They sign in with the name "' + name.trim() + '" and that password.') }}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Their name" className={INPUT} />
        <input type="text" autoComplete="off" value={password} onChange={e => setPassword(e.target.value)} placeholder="Their password (8+ characters)" className={INPUT} />
        <button disabled={!name.trim() || password.trim().length < 8} className={PRIMARY}>Add</button>
      </form>
      {note && <p className="text-sm text-muted">{note}</p>}
    </div>
  )
}

export default function StaffPanel() {
  const [signedIn, setSignedIn] = useState(!!getToken())
  const [tables, setTables] = useState<Table[]>([])
  const [tab, setTab] = useState('details')
  const [error, setError] = useState('')
  const [who, setWho] = useState<{ level: string; name: string } | null>(null)
  const load = () => call('/api/staff/data').then(setTables).catch((err: Error) => { setError(err.message); if (!getToken()) setSignedIn(false) })
  useEffect(() => { if (signedIn) { load(); call('/api/staff/me').then(setWho).catch(() => setWho({ level: 'owner', name: 'Owner' })) } }, [signedIn])
  const owner = !who || who.level !== 'member'
  if (!signedIn) return <div className="min-h-screen bg-canvas"><Login onIn={() => setSignedIn(true)} /></div>
  const tabs: Array<[string, string]> = [['details', 'Business details'], ...tables.map(t => [t.name, label(t.name)] as [string, string]), ...(owner ? [['team', 'Team']] as Array<[string, string]> : []), ['account', 'Your account']]
  const current = tables.find(t => t.name === tab)
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className="flex items-center gap-4 border-b border-line px-6 py-3">
        <span className="font-display text-lg">Staff</span>
        <a href="/" className="text-sm text-muted hover:text-ink">View the site</a>
        {who && <span className="ml-auto text-sm text-muted">{who.name}{who.level === 'owner' && who.name.toLowerCase() !== 'owner' ? ' (owner)' : ''}</span>}
        <button onClick={() => { setToken(''); setSignedIn(false) }} className={(who ? '' : 'ml-auto ') + 'text-sm text-muted hover:text-ink'}>Sign out</button>
      </header>
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-6 md:flex-row">
        <nav className="flex shrink-0 flex-row flex-wrap gap-1 md:w-48 md:flex-col">
          {tabs.map(([id, name]) => <button key={id} onClick={() => setTab(id)} className={'rounded-md px-3 py-1.5 text-left text-sm ' + (tab === id ? 'bg-surface font-medium text-ink' : 'text-muted hover:text-ink')}>{name}</button>)}
        </nav>
        <main className="min-w-0 flex-1">
          {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
          {tab === 'details' && <Details owner={owner} />}
          {tab === 'team' && owner && <Team />}
          {tab === 'account' && <Account owner={owner} who={who} onRenamed={n => setWho({ level: 'owner', name: n })} />}
          {current && <TableEditor key={current.name} table={current} onChanged={load} owner={owner} />}
        </main>
      </div>
    </div>
  )
}
