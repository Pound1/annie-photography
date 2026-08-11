import { useCallback, useEffect } from 'react'
import type { Photo } from '../data/galleries'
import Spinner from './Spinner'
import { useImageLoaded } from '../hooks/useImageLoaded'
import styles from './Lightbox.module.css'

interface LightboxProps {
  albumName: string
  photos: Photo[]
  index: number
  onClose: () => void
  onChangeIndex: (index: number) => void
}

export default function Lightbox({
  albumName,
  photos,
  index,
  onClose,
  onChangeIndex,
}: LightboxProps) {
  const total = photos.length
  const photo = photos[index]
  const { ref, loaded, error, onLoad, onError } = useImageLoaded(photo.src)

  const goPrev = useCallback(
    () => onChangeIndex((index - 1 + total) % total),
    [index, total, onChangeIndex],
  )
  const goNext = useCallback(
    () => onChangeIndex((index + 1) % total),
    [index, total, onChangeIndex],
  )

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [goPrev, goNext, onClose])

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label={`${albumName}: ${photo.alt}`}
      onClick={onClose}
    >
      <div className={styles.topBar}>
        <div className={styles.albumName}>{albumName}</div>
        <div className={styles.topRight}>
          {total > 1 && (
            <span className={styles.counter}>
              {index + 1} / {total}
            </span>
          )}
          <button
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
        </div>
      </div>

      <div className={styles.stage}>
        {total > 1 && (
          <button
            type="button"
            className={`${styles.navButton} ${styles.prev}`}
            onClick={(e) => {
              e.stopPropagation()
              goPrev()
            }}
            aria-label="Previous photo"
          >
            &#8249;
          </button>
        )}

        <div className={styles.imageFrame} onClick={(e) => e.stopPropagation()}>
          {photo.src ? (
            <>
              <img
                ref={ref}
                className={styles.image}
                src={photo.src}
                alt={photo.alt}
                onLoad={onLoad}
                onError={onError}
                style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.25s ease' }}
              />
              {!loaded && !error && <Spinner />}
            </>
          ) : (
            <div
              className={styles.image}
              style={{ background: photo.gradient, width: '50vw', maxWidth: 560 }}
              role="img"
              aria-label={photo.alt}
            />
          )}
        </div>

        {total > 1 && (
          <button
            type="button"
            className={`${styles.navButton} ${styles.next}`}
            onClick={(e) => {
              e.stopPropagation()
              goNext()
            }}
            aria-label="Next photo"
          >
            &#8250;
          </button>
        )}
      </div>
    </div>
  )
}
