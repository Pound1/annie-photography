import { useEffect, useState, type FormEvent } from 'react'
import { galleries } from '../data/galleries'
import styles from './Admin.module.css'

const TOKEN_KEY = 'annie-admin-token'

interface CloudinaryResource {
  public_id: string
  secure_url: string
}

export default function Admin() {
  const [token, setToken] = useState<string | null>(() =>
    sessionStorage.getItem(TOKEN_KEY),
  )

  if (!token) {
    return <PasswordGate onAuthed={setToken} />
  }

  return <AdminPanel token={token} onLogout={() => {
    sessionStorage.removeItem(TOKEN_KEY)
    setToken(null)
  }} />
}

function PasswordGate({ onAuthed }: { onAuthed: (token: string) => void }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/.netlify/functions/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong.')
        return
      }
      sessionStorage.setItem(TOKEN_KEY, data.token)
      onAuthed(data.token)
    } catch {
      setError('Could not reach the server.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`container ${styles.wrap}`}>
      <h1>Admin</h1>
      <p className={styles.note}>
        Enter the site password to manage gallery photos.
      </p>
      <form className={styles.gateForm} onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Checking…' : 'Enter'}
        </button>
        {error && <p className={styles.error}>{error}</p>}
      </form>
    </div>
  )
}

function AdminPanel({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [folder, setFolder] = useState(galleries[0]?.slug ?? '')
  const [items, setItems] = useState<CloudinaryResource[]>([])
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  async function loadItems(targetFolder: string) {
    setError(null)
    try {
      const res = await fetch(
        `/.netlify/functions/cloudinary-list?folder=${encodeURIComponent(targetFolder)}`,
        { headers: { 'x-admin-token': token } },
      )
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Could not load photos.')
        setItems([])
        return
      }
      setItems(data.resources ?? [])
    } catch {
      setError('Could not reach the server.')
    }
  }

  useEffect(() => {
    if (folder) loadItems(folder)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folder, token])

  async function handleUpload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fileInput = e.currentTarget.elements.namedItem('file') as HTMLInputElement
    const file = fileInput.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)
    try {
      const signRes = await fetch('/.netlify/functions/cloudinary-sign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
        },
        body: JSON.stringify({ folder }),
      })
      const sign = await signRes.json()
      if (!signRes.ok) throw new Error(sign.error ?? 'Could not sign upload.')

      const body = new FormData()
      body.append('file', file)
      body.append('api_key', sign.apiKey)
      body.append('timestamp', String(sign.timestamp))
      body.append('signature', sign.signature)
      body.append('folder', sign.folder)

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`,
        { method: 'POST', body },
      )
      if (!uploadRes.ok) throw new Error('Upload to Cloudinary failed.')

      fileInput.value = ''
      await loadItems(folder)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(publicId: string) {
    if (!confirm('Remove this photo from the gallery?')) return
    setError(null)
    try {
      const res = await fetch('/.netlify/functions/cloudinary-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': token,
        },
        body: JSON.stringify({ publicId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Delete failed.')
      setItems((prev) => prev.filter((item) => item.public_id !== publicId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed.')
    }
  }

  return (
    <div className={`container ${styles.panel}`}>
      <div className={styles.row} style={{ justifyContent: 'space-between' }}>
        <h1 style={{ margin: 0 }}>Manage photos</h1>
        <button className="btn btn-secondary" onClick={onLogout}>
          Log out
        </button>
      </div>

      <p className={styles.note}>
        Photos are stored in Cloudinary. This page needs CLOUDINARY_CLOUD_NAME,
        CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET and ADMIN_PASSWORD set as
        Netlify environment variables before it will work &mdash; see .env.example.
      </p>

      <div className={styles.row}>
        <label htmlFor="folder">Gallery</label>
        <select id="folder" value={folder} onChange={(e) => setFolder(e.target.value)}>
          {galleries.map((g) => (
            <option key={g.slug} value={g.slug}>
              {g.title}
            </option>
          ))}
        </select>
      </div>

      <form className={styles.row} onSubmit={handleUpload}>
        <input type="file" name="file" accept="image/*" required />
        <button className="btn btn-primary" type="submit" disabled={uploading}>
          {uploading ? 'Uploading…' : 'Upload photo'}
        </button>
      </form>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.grid}>
        {items.map((item) => (
          <div key={item.public_id} className={styles.item}>
            <img src={item.secure_url} alt="" />
            <button
              type="button"
              className={styles.itemDelete}
              onClick={() => handleDelete(item.public_id)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
