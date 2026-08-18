const { cloudinary } = require('./_cloudinary')
const { readIndex } = require('./_galleries')

// Public, unauthenticated: returns real photos per album for the gallery
// pages to display. Read-only, no admin token needed -- this is the site's
// actual content, not a management action.
exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method not allowed' }
  }

  const requested = event.queryStringParameters?.folder
  const visibleSlugs = (await readIndex()).filter((g) => g.visible).map((g) => g.slug)

  if (requested && !visibleSlugs.includes(requested)) {
    return { statusCode: 404, body: JSON.stringify({ error: 'Gallery not found.' }) }
  }
  const slugs = requested ? [requested] : visibleSlugs

  try {
    const entries = await Promise.all(
      slugs.map(async (slug) => {
        const result = await cloudinary.api.resources_by_asset_folder(slug, {
          max_results: 100,
        })
        const photos = result.resources.map((r) => ({
          id: r.public_id,
          src: r.secure_url,
          width: r.width,
          height: r.height,
        }))
        return [slug, photos]
      }),
    )

    return {
      statusCode: 200,
      headers: { 'Cache-Control': 'public, max-age=60' },
      body: JSON.stringify(Object.fromEntries(entries)),
    }
  } catch (err) {
    return {
      statusCode: err.error?.http_code ?? 500,
      body: JSON.stringify({ error: err.error?.message ?? err.message }),
    }
  }
}
