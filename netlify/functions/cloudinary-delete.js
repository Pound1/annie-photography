const { signParams, requireAdmin, env, adminAuthHeader } = require('./_cloudinary')

// Deletes one image by its Cloudinary public_id. Deletion needs a
// signed request (unlike unsigned uploads), which is why this has to
// go through a server-side function rather than straight from the browser.
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
    const cloudName = env('CLOUDINARY_CLOUD_NAME')
    const timestamp = Math.round(Date.now() / 1000)
    const signature = signParams({ public_id: publicId, timestamp })

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: adminAuthHeader(),
        },
        body: JSON.stringify({
          public_id: publicId,
          timestamp,
          signature,
          api_key: env('CLOUDINARY_API_KEY'),
        }),
      },
    )
    const data = await res.json()
    if (!res.ok) {
      return { statusCode: res.status, body: JSON.stringify(data) }
    }
    return { statusCode: 200, body: JSON.stringify(data) }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Cloudinary is not configured yet: ${err.message}` }),
    }
  }
}
