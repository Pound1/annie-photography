const cloudinary = require('cloudinary').v2

function env(name) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing environment variable: ${name}`)
  return value
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

function requireAdmin(event) {
  const token = event.headers['x-admin-token'] || event.headers['X-Admin-Token']
  return Boolean(token) && token === process.env.ADMIN_PASSWORD
}

// A Cloudinary asset folder only starts existing once something has been
// uploaded into it, so a brand-new (still-empty) gallery makes
// resources_by_asset_folder throw "Folder doesn't exist" instead of just
// returning no resources. Treat that specific error as an empty gallery
// everywhere we list folder contents; let any other error keep propagating.
async function resourcesInFolder(folder, options) {
  try {
    const result = await cloudinary.api.resources_by_asset_folder(folder, options)
    return result.resources
  } catch (err) {
    if (err.error?.message?.startsWith("Folder doesn't exist")) {
      return []
    }
    throw err
  }
}

module.exports = { env, cloudinary, requireAdmin, resourcesInFolder }
