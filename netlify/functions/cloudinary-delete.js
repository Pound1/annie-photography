const { cloudinary, requireAdmin, env } = require('./_cloudinary')

// Deletes one image by its Cloudinary public_id via the official SDK
// (handles signing internally).
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' }
  }
  if (!requireAdmin(event)) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Not authorised.' }) }
  }

  let publicId
  try {
    ;({ publicId } = JSON.parse(event.body || '{}'))
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body.' }) }
  }
  if (!publicId) {
    return { statusCode: 400, body: JSON.stringify({ error: 'publicId is required.' }) }
  }

  try {
    env('CLOUDINARY_CLOUD_NAME')
    const result = await cloudinary.uploader.destroy(publicId)
    if (result.result !== 'ok') {
      return { statusCode: 400, body: JSON.stringify({ error: result.result }) }
    }
    return { statusCode: 200, body: JSON.stringify(result) }
  } catch (err) {
    return {
      statusCode: err.error?.http_code ?? 500,
      body: JSON.stringify({ error: err.error?.message ?? `Cloudinary is not configured yet: ${err.message}` }),
    }
  }
}
