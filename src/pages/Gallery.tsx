import { useEffect, useState } from 'react'
import { galleries as placeholderGalleries, type GalleryGroup } from '../data/galleries'
import Lightbox from '../components/Lightbox'
import styles from './Gallery.module.css'

interface OpenState {
  groupSlug: string
  index: number
}

interface RemotePhoto {
  id: string
  src: string
}

export default function Gallery() {
  const [groups, setGroups] = useState<GalleryGroup[]>(placeholderGalleries)
  const [open, setOpen] = useState<OpenState | null>(null)

  useEffect(() => {
    let cancelled = false

    fetch('/.netlify/functions/gallery-photos')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('request failed'))))
      .then((data: Record<string, RemotePhoto[]>) => {
        if (cancelled) return
        setGroups((prev) =>
          prev.map((group) => {
            const real = data[group.slug]
            if (!real || real.length === 0) return group
            return {
              ...group,
              photos: real.map((photo, i) => ({
                id: photo.id,
                alt: `${group.title} photo ${i + 1}`,
                gradient: group.photos[i % group.photos.length]?.gradient ?? '',
                src: photo.src,
              })),
            }
          }),
        )
      })
      .catch(() => {
        // Local dev without Netlify functions, or a Cloudinary hiccup --
        // keep showing the placeholder photos already in state.
      })

    return () => {
      cancelled = true
    }
  }, [])

  const activeGroup = open ? groups.find((g) => g.slug === open.groupSlug) : undefined

  return (
    <div className="container">
      <div className={styles.header}>
        <p className={styles.eyebrow}>Portfolio</p>
        <h1>Albums</h1>
        <p>Collections grouped by the kind of shoot you're after.</p>
      </div>

      {groups.map((group) => (
        <section key={group.slug} className={styles.group}>
          <div className={styles.groupHeader}>
            <h2>{group.title}</h2>
            <p>{group.description}</p>
          </div>
          <div className={styles.grid}>
            {group.photos.map((photo, i) => (
              <button
                key={photo.id}
                type="button"
                className={styles.thumb}
                onClick={() => setOpen({ groupSlug: group.slug, index: i })}
                aria-label={`Open ${photo.alt}`}
              >
                {photo.src ? (
                  <img
                    className={styles.thumbImage}
                    src={photo.src}
                    alt={photo.alt}
                  />
                ) : (
                  <div
                    className={styles.thumbImage}
                    style={{ background: photo.gradient }}
                  />
                )}
              </button>
            ))}
          </div>
        </section>
      ))}

      {activeGroup && open && (
        <Lightbox
          albumName={activeGroup.title}
          photos={activeGroup.photos}
          index={open.index}
          onClose={() => setOpen(null)}
          onChangeIndex={(index) => setOpen({ groupSlug: activeGroup.slug, index })}
        />
      )}
    </div>
  )
}
