const crypto = require('node:crypto')

function env(name) {
  const value = process.env[name]
  if (!value) throw new Error(`Missing environment variable: ${name}`)
  return value
}

// Cloudinary signature: sha1 of sorted "key=value" params (excluding
// api_key/file), joined with "&", with the api secret appended.
// https://cloudinary.com/documentation/authentication_signatures
function signParams(params) {
  const apiSecret = env('CLOUDINARY_API_SECRET')
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&')
  return crypto
    .createHash('sha1')
    .update(toSign + apiSecret)
    .digest('hex')
}

function adminAuthHeader() {
  const key = env('CLOUDINARY_API_KEY')
  const secret = env('CLOUDINARY_API_SECRET')
  return 'Basic ' + Buffer.from(`${key}:${secret}`).toString('base64')
}

function requireAdmin(event) {
  const token = event.headers['x-admin-token'] || event.headers['X-Admin-Token']
  return Boolean(token) && token === process.env.ADMIN_PASSWORD
}

module.exports = { env, signParams, adminAuthHeader, requireAdmin }
