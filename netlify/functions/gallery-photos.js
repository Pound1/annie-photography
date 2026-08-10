const { cloudinary } = require('./_cloudinary')

// Public, unauthenticated: returns real photos per album for the /gallery
// page to display. Read-only, no admin token needed -- this is the site's
// actual content, not a management action.
const ALBUM_SLUGS = ['landscapes', 'portraits', 'nature']

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method not allowed' }
  }

  const requested = event.queryStringParameters?.folder
  const slugs = requested ? [requested] : ALBUM_SLUGS

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
