import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { GalleryMeta, Photo } from '../data/galleries'
import Lightbox from '../components/Lightbox'
import Spinner from '../components/Spinner'
import { useImageLoaded } from '../hooks/useImageLoaded'
import styles from './GalleryDetail.module.css'

function GalleryThumb({ photo, onOpen }: { photo: Photo; onOpen: () => void }) {
  const { ref, loaded, error, onLoad, onError } = useImageLoaded(photo.src)

  return (
    <button
      type="button"
      className={styles.thumb}
      onClick={onOpen}
      aria-label={`Open ${photo.alt}`}
    >
      <img
        ref={ref}
        className={styles.thumbImage}
        src={photo.src}
        alt={photo.alt}
        onLoad={onLoad}
        onError={onError}
        style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.25s ease' }}
      />
      {!loaded && !error && <Spinner />}
    </button>
  )
}

export default function GalleryDetail() {
  const { slug } = useParams<{ slug: string }>()
  const [meta, setMeta] = useState<GalleryMeta | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'not-found'>('loading')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  useEffect(() => {
    if (!slug) return
    let cancelled = false
    setStatus('loading')

    Promise.all([
      fetch('/.netlify/functions/galleries-list').then((res) =>
        res.ok ? res.json() : Promise.reject(new Error('request failed')),
      ),
      fetch(`/.netlify/functions/gallery-photos?folder=${encodeURIComponent(slug)}`).then((res) =>
        res.ok ? res.json() : Promise.reject(new Error('request failed')),
      ),
    ])
      .then(
        ([galleries, photosByFolder]: [
          GalleryMeta[],
          Record<string, { id: string; src: string }[]>,
        ]) => {
          if (cancelled) return
          const found = galleries.find((g) => g.slug === slug)
          if (!found) {
            setStatus('not-found')
            return
          }
          setMeta(found)
          setPhotos(
            (photosByFolder[slug] ?? []).map((p, i) => ({
              id: p.id,
              src: p.src,
              alt: `${found.title} photo ${i + 1}`,
            })),
          )
          setStatus('ready')
        },
      )
      .catch(() => {
        if (!cancelled) setStatus('not-found')
      })

    return () => {
      cancelled = true
    }
  }, [slug])

  if (status === 'loading') {
    return (
      <div className="container">
        <p className={styles.note}>Loading gallery&hellip;</p>
      </div>
    )
  }

  if (status === 'not-found' || !meta) {
    return (
      <div className="container">
        <p className={styles.note}>That gallery couldn&rsquo;t be found.</p>
        <Link className="btn btn-secondary" to="/gallery">
          Back to albums
        </Link>
      </div>
    )
  }

  return (
    <div className="container">
      <div className={styles.header}>
        <Link className={styles.back} to="/gallery">
          &larr; All albums
        </Link>
        <h1>{meta.title}</h1>
        <p>{meta.description}</p>
      </div>

      {photos.length === 0 ? (
        <p className={styles.note}>No photos in this gallery yet.</p>
      ) : (
        <div className={styles.grid}>
          {photos.map((photo, i) => (
            <GalleryThumb key={photo.id} photo={photo} onOpen={() => setLightboxIndex(i)} />
          ))}
        </div>
      )}

      {lightboxIndex !== null && (
        <Lightbox
          albumName={meta.title}
          photos={photos}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onChangeIndex={setLightboxIndex}
        />
      )}
    </div>
  )
}
