const { requireAdmin, env, resourcesInFolder } = require('./_cloudinary')

// Lists images in a Cloudinary asset folder (gallery album) via the Admin
// API. Uses resources_by_asset_folder rather than the legacy prefix-search
// endpoint, since Dynamic Folder Mode decouples public_id from folder
// placement -- see the comment in cloudinary-sign.js.
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
    env('CLOUDINARY_CLOUD_NAME')
    const resources = await resourcesInFolder(folder, { max_results: 100 })
    return { statusCode: 200, body: JSON.stringify({ resources }) }
  } catch (err) {
    return {
      statusCode: err.error?.http_code ?? 500,
      body: JSON.stringify({ error: err.error?.message ?? `Cloudinary is not configured yet: ${err.message}` }),
    }
  }
}
