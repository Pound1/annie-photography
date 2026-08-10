// Placeholder gallery data. Each photo is rendered as a coloured
// swatch until real images exist. Shape matches what a Cloudinary
// folder listing would return (id, alt, src, plus gradient fallback),
// so swapping this file for a real fetch later is a drop-in change.
// Album names/slugs match Annie's design (Landscapes / Portraits / Nature).

export interface Photo {
  id: string
  alt: string
  gradient: string
  src?: string
}

export interface GalleryGroup {
  slug: string
  title: string
  description: string
  photos: Photo[]
}

const gradients = [
  'linear-gradient(135deg, #7a8a5e, #c8d6a8)',
  'linear-gradient(135deg, #c67139, #ebc09a)',
  'linear-gradient(135deg, #b2622d, #e0a672)',
  'linear-gradient(135deg, #3d472b, #7a8a5e)',
  'linear-gradient(135deg, #8c491a, #c67139)',
  'linear-gradient(135deg, #dcd3c4, #7a8a5e)',
]

function placeholderPhotos(prefix: string, count: number): Photo[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${prefix}-${i + 1}`,
    alt: `Placeholder photo ${i + 1} for ${prefix} album`,
    gradient: gradients[i % gradients.length],
  }))
}

export const galleries: GalleryGroup[] = [
  {
    slug: 'landscapes',
    title: 'Landscapes',
    description: 'Wide open spaces and quiet, wild places.',
    photos: placeholderPhotos('landscapes', 6),
  },
  {
    slug: 'portraits',
    title: 'Portraits',
    description: 'Natural light portraits, individuals and families.',
    photos: placeholderPhotos('portraits', 6),
  },
  {
    slug: 'nature',
    title: 'Nature',
    description: 'Close, honest moments outdoors.',
    photos: placeholderPhotos('nature', 6),
  },
]
