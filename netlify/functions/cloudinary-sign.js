const { signParams, requireAdmin, env } = require('./_cloudinary')

// Returns a signed payload the browser can use to upload an image
// straight to Cloudinary (the API secret never reaches the client).
// Expects { folder } in the POST body -- folder should be the gallery
// slug (e.g. "weddings") so uploads land pre-sorted into that collection.
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' }
  }
  if (!requireAdmin(event)) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Not authorised.' }) }
  }

  let folder
  try {
    ;({ folder } = JSON.parse(event.body || '{}'))
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body.' }) }
  }
  if (!folder) {
    return { statusCode: 400, body: JSON.stringify({ error: 'folder is required.' }) }
  }

  try {
    const timestamp = Math.round(Date.now() / 1000)
    const params = { folder, timestamp }
    const signature = signParams(params)

    return {
      statusCode: 200,
      body: JSON.stringify({
        timestamp,
        signature,
        folder,
        apiKey: env('CLOUDINARY_API_KEY'),
        cloudName: env('CLOUDINARY_CLOUD_NAME'),
      }),
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Cloudinary is not configured yet: ${err.message}` }),
    }
  }
}
