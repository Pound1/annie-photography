const { adminAuthHeader, requireAdmin, env } = require('./_cloudinary')

// Lists images in a Cloudinary folder (gallery group) via the Admin API.
// Read-only, used by the admin page to show what's already uploaded.
exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method not allowed' }
  }
  if (!requireAdmin(event)) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Not authorised.' }) }
  }

  const folder = event.queryStringParameters?.folder
  if (!folder) {
    return { statusCode: 400, body: JSON.stringify({ error: 'folder query param is required.' }) }
  }

  try {
    const cloudName = env('CLOUDINARY_CLOUD_NAME')
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image?type=upload&prefix=${encodeURIComponent(folder)}/&max_results=100`
    const res = await fetch(url, { headers: { Authorization: adminAuthHeader() } })
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
