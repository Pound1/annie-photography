import { useState } from 'react'
import { galleries } from '../data/galleries'
import Lightbox from '../components/Lightbox'
import styles from './Gallery.module.css'

interface OpenState {
  groupSlug: string
  index: number
}

export default function Gallery() {
  const [open, setOpen] = useState<OpenState | null>(null)
  const activeGroup = open
    ? galleries.find((g) => g.slug === open.groupSlug)
    : undefined

  return (
    <div className="container">
      <div className={styles.header}>
        <p className={styles.eyebrow}>Portfolio</p>
        <h1>Albums</h1>
        <p>Collections grouped by the kind of shoot you're after.</p>
      </div>

      {galleries.map((group) => (
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
