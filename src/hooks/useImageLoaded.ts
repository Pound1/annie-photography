import { useEffect, useRef, useState } from 'react'

// Tracks whether an <img> has finished loading its current src, so callers
// can show a spinner until then. Resets when src changes (e.g. paging
// through the lightbox) and skips the spinner entirely for images the
// browser already has cached (checked via img.complete after mount/update,
// since onLoad can fire before a listener attaches to a cached image).
export function useImageLoaded(src: string | undefined) {
  const ref = useRef<HTMLImageElement>(null)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    setLoaded(false)
    setError(false)
    if (ref.current?.complete && ref.current.naturalWidth > 0) {
      setLoaded(true)
    }
  }, [src])

  return {
    ref,
    loaded,
    error,
    onLoad: () => setLoaded(true),
    onError: () => setError(true),
  }
}
