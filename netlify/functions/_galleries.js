const { getStore } = require('@netlify/blobs')

// Gallery metadata (title/description/visibility) lives in a single Netlify
// Blob, since Cloudinary only stores photos and this project has no
// database. The blob holds one JSON array, keyed under "index" -- small
// enough (a handful of galleries) that one read/write round-trip per
// request is simpler than one blob key per gallery.
const STORE_NAME = 'galleries'
const INDEX_KEY = 'index'

const DEFAULT_GALLERIES = [
  {
    slug: 'landscapes',
    title: 'Landscapes',
    description: 'Wide open spaces and quiet, wild places.',
    visible: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  {
    slug: 'portraits',
    title: 'Portraits',
    description: 'Natural light portraits, individuals and families.',
    visible: true,
    createdAt: '2026-01-01T00:00:01.000Z',
  },
  {
    slug: 'nature',
    title: 'Nature',
    description: 'Close, honest moments outdoors.',
    visible: true,
    createdAt: '2026-01-01T00:00:02.000Z',
  },
]

function store() {
  return getStore(STORE_NAME)
}

async function readIndex() {
  const list = await store().get(INDEX_KEY, { type: 'json' })
  if (list) return list
  await writeIndex(DEFAULT_GALLERIES)
  return DEFAULT_GALLERIES
}

async function writeIndex(list) {
  await store().setJSON(INDEX_KEY, list)
}

function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function uniqueSlug(base, existing) {
  const taken = new Set(existing.map((g) => g.slug))
  if (!taken.has(base)) return base
  let i = 2
  while (taken.has(`${base}-${i}`)) i += 1
  return `${base}-${i}`
}

module.exports = { readIndex, writeIndex, slugify, uniqueSlug }
