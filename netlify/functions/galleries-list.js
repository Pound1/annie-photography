const { connectLambda } = require('@netlify/blobs')
const { readIndex } = require('./_galleries')

// Public, unauthenticated: returns only visible galleries' metadata for the
// Albums landing page. No photos here -- gallery-photos.js handles those.
exports.handler = async (event) => {
  // These are classic Lambda-compatible functions (exports.handler), where
  // Netlify Blobs' automatic env config doesn't kick in on its own --
  // connectLambda() wires up the current invocation before any getStore call.
  connectLambda(event)

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method not allowed' }
  }

  try {
    const galleries = await readIndex()
    const visible = galleries
      .filter((g) => g.visible)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))

    return {
      statusCode: 200,
      headers: { 'Cache-Control': 'public, max-age=60' },
      body: JSON.stringify(visible),
    }
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) }
  }
}
