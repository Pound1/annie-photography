const { connectLambda } = require('@netlify/blobs')
const { cloudinary, requireAdmin } = require('./_cloudinary')
const { readIndex, writeIndex, slugify, uniqueSlug } = require('./_galleries')

// Authenticated gallery management: list all (incl. hidden), create,
// toggle visibility / edit, and delete (which cascade-deletes every photo
// in that gallery's Cloudinary folder -- irreversible, so the client must
// send confirmTitle matching the gallery's title exactly).
exports.handler = async (event) => {
  // Classic Lambda-compatible function -- wire up Netlify Blobs for this
  // invocation before any getStore call (see galleries-list.js).
  connectLambda(event)

  if (!requireAdmin(event)) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Not authorised.' }) }
  }

  try {
    if (event.httpMethod === 'GET') {
      const galleries = await readIndex()
      galleries.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      return { statusCode: 200, body: JSON.stringify(galleries) }
    }

    if (event.httpMethod === 'POST') {
      const { title, description } = JSON.parse(event.body || '{}')
      if (!title || !title.trim()) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Title is required.' }) }
      }
      const base = slugify(title)
      if (!base) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Title must contain at least one letter or number.' }),
        }
      }
      const galleries = await readIndex()
      const entry = {
        slug: uniqueSlug(base, galleries),
        title: title.trim(),
        description: (description || '').trim(),
        visible: true,
        createdAt: new Date().toISOString(),
      }
      await writeIndex([...galleries, entry])
      return { statusCode: 200, body: JSON.stringify(entry) }
    }

    if (event.httpMethod === 'PATCH') {
      const { slug, visible, title, description } = JSON.parse(event.body || '{}')
      if (!slug) {
        return { statusCode: 400, body: JSON.stringify({ error: 'slug is required.' }) }
      }
      const galleries = await readIndex()
      const idx = galleries.findIndex((g) => g.slug === slug)
      if (idx === -1) {
        return { statusCode: 404, body: JSON.stringify({ error: 'Gallery not found.' }) }
      }
      const updated = { ...galleries[idx] }
      if (typeof visible === 'boolean') updated.visible = visible
      if (typeof title === 'string' && title.trim()) updated.title = title.trim()
      if (typeof description === 'string') updated.description = description.trim()
      galleries[idx] = updated
      await writeIndex(galleries)
      return { statusCode: 200, body: JSON.stringify(updated) }
    }

    if (event.httpMethod === 'DELETE') {
      const { slug, confirmTitle } = JSON.parse(event.body || '{}')
      if (!slug) {
        return { statusCode: 400, body: JSON.stringify({ error: 'slug is required.' }) }
      }
      const galleries = await readIndex()
      const entry = galleries.find((g) => g.slug === slug)
      if (!entry) {
        return { statusCode: 404, body: JSON.stringify({ error: 'Gallery not found.' }) }
      }
      if (confirmTitle !== entry.title) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'Confirmation text does not match the gallery name.' }),
        }
      }

      const result = await cloudinary.api.resources_by_asset_folder(slug, { max_results: 500 })
      const publicIds = result.resources.map((r) => r.public_id)
      if (publicIds.length > 0) {
        await cloudinary.api.delete_resources(publicIds)
      }
      try {
        await cloudinary.api.delete_folder(slug)
      } catch {
        // Folder may already be gone, or Cloudinary may reject deleting an
        // already-empty virtual folder -- not critical to the deletion.
      }

      await writeIndex(galleries.filter((g) => g.slug !== slug))
      return { statusCode: 200, body: JSON.stringify({ ok: true }) }
    }

    return { statusCode: 405, body: 'Method not allowed' }
  } catch (err) {
    return {
      statusCode: err.error?.http_code ?? 500,
      body: JSON.stringify({ error: err.error?.message ?? err.message }),
    }
  }
}
