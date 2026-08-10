// Checks the password submitted from the /admin page against the
// ADMIN_PASSWORD env var (set in Netlify site settings, never in the repo).
// On success returns the same password back as a token the client then
// sends as the "x-admin-token" header on every other admin function call.
// This is a single-shared-password MVP, not a real session system --
// good enough for one known editor, not for multi-user access.
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' }
  }

  const configured = process.env.ADMIN_PASSWORD
  if (!configured) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'ADMIN_PASSWORD is not configured on this site yet.' }),
    }
  }

  let password
  try {
    ;({ password } = JSON.parse(event.body || '{}'))
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body.' }) }
  }

  if (password !== configured) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Incorrect password.' }) }
  }

  return { statusCode: 200, body: JSON.stringify({ token: password }) }
}
