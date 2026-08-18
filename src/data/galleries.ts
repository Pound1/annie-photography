// Gallery metadata (title/description/visibility) is admin-managed and
// fetched from the galleries-list / galleries-admin Netlify functions --
// nothing here is hardcoded content anymore. This file just holds the
// shared types and a placeholder-gradient helper for gallery covers that
// don't have a photo yet.

export interface GalleryMeta {
  slug: string
  title: string
  description: string
  visible: boolean
  createdAt: string
}

export interface Photo {
  id: string
  src: string
  alt: string
}

const gradients = [
  'linear-gradient(135deg, #7a8a5e, #c8d6a8)',
  'linear-gradient(135deg, #c67139, #ebc09a)',
  'linear-gradient(135deg, #b2622d, #e0a672)',
  'linear-gradient(135deg, #3d472b, #7a8a5e)',
  'linear-gradient(135deg, #8c491a, #c67139)',
  'linear-gradient(135deg, #dcd3c4, #7a8a5e)',
]

// Deterministic per-gallery gradient, used as a cover placeholder before a
// gallery has any photos.
export function gradientForSlug(slug: string): string {
  let hash = 0
  for (let i = 0; i < slug.length; i += 1) hash = (hash * 31 + slug.charCodeAt(i)) | 0
  return gradients[Math.abs(hash) % gradients.length]
}
