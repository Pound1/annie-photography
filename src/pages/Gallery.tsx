import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { gradientForSlug, type GalleryMeta } from '../data/galleries'
import { useImageLoaded } from '../hooks/useImageLoaded'
import Spinner from '../components/Spinner'
import styles from './Gallery.module.css'

interface CoverPhoto {
  id: string
  src: string
}

function GalleryCard({ gallery, cover }: { gallery: GalleryMeta; cover?: CoverPhoto }) {
  const { ref, loaded, error, onLoad, onError } = useImageLoaded(cover?.src)

  return (
    <Link className={styles.card} to={`/gallery/${gallery.slug}`}>
      <div className={styles.cardImage}>
        {cover ? (
          <>
            <img
              ref={ref}
              className={styles.cardImg}
              src={cover.src}
              alt=""
              onLoad={onLoad}
              onError={onError}
              style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.25s ease' }}
            />
            {!loaded && !error && <Spinner />}
          </>
        ) : (
          <div className={styles.cardImg} style={{ background: gradientForSlug(gallery.slug) }} />
        )}
      </div>
      <div className={styles.cardBody}>
        <h2>{gallery.title}</h2>
        <p>{gallery.description}</p>
      </div>
    </Link>
  )
}

export default function Gallery() {
  const [galleries, setGalleries] = useState<GalleryMeta[]>([])
  const [covers, setCovers] = useState<Record<string, CoverPhoto>>({})
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')

  useEffect(() => {
    let cancelled = false

    fetch('/.netlify/functions/galleries-list')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('request failed'))))
      .then((data: GalleryMeta[]) => {
        if (cancelled) return undefined
        setGalleries(data)
        setStatus('ready')
        return fetch('/.netlify/functions/gallery-photos').then((res) =>
          res.ok ? res.json() : Promise.reject(new Error('request failed')),
        )
      })
      .then((photosByFolder: Record<string, { id: string; src: string }[]> | undefined) => {
        if (cancelled || !photosByFolder) return
        const nextCovers: Record<string, CoverPhoto> = {}
        for (const [slug, photos] of Object.entries(photosByFolder)) {
          if (photos[0]) nextCovers[slug] = photos[0]
        }
        setCovers(nextCovers)
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="container">
      <div className={styles.header}>
        <p className={styles.eyebrow}>Portfolio</p>
        <h1>Albums</h1>
        <p>Collections grouped by the kind of shoot you're after.</p>
      </div>

      {status === 'error' && <p className={styles.note}>Could not load albums right now.</p>}
      {status === 'ready' && galleries.length === 0 && (
        <p className={styles.note}>No albums yet.</p>
      )}

      <div className={styles.grid}>
        {galleries.map((gallery) => (
          <GalleryCard key={gallery.slug} gallery={gallery} cover={covers[gallery.slug]} />
        ))}
      </div>
    </div>
  )
}
