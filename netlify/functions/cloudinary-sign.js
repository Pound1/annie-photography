const { cloudinary, requireAdmin, env } = require('./_cloudinary')

// Returns a signed payload the browser can use to upload an image
// straight to Cloudinary (the API secret never reaches the client).
// Expects { folder } in the POST body -- folder should be the gallery
// slug (e.g. "landscapes") so uploads land pre-sorted into that album.
//
// Uses asset_folder (not the legacy "folder" param) because Cloudinary
// accounts created since mid-2023 default to Dynamic Folder Mode, where
// "folder" no longer reliably files an asset into a Media Library folder.
// public_id_prefix is set to the same value purely so the public_id stays
// human-readable (e.g. "landscapes/abc123") -- it isn't required for
// folder placement itself.
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
    const paramsToSign = { asset_folder: folder, public_id_prefix: folder, timestamp }
    const signature = cloudinary.utils.api_sign_request(paramsToSign, env('CLOUDINARY_API_SECRET'))

    return {
      statusCode: 200,
      body: JSON.stringify({
        timestamp,
        signature,
        assetFolder: folder,
        publicIdPrefix: folder,
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
