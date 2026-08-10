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

module.exports = { env, cloudinary, requireAdmin }
