import { IncomingMessage } from 'http'

/**
 * Extract the first subdomain from the request's host
 * @param req Client's incoming request object
 * @returns The first subdomain as `wildcard`. Note: If no subdomain
 * exists, `wilcard` defaults to 'www'
 */
export default function getWildcard(req: IncomingMessage) {
  // ['TLD', 'domain', 'subdomain1', 'subdomain2']
  const hostParts = req.headers.host?.split('.').reverse()

  // In development: hostParts = ['localhost:3000', 'subdomain1', 'subdomain2']
  // In production: hostParts = ['TLD', 'domain', 'subdomain1', 'subdomain2']

  // Possible cases
  // ['localhost:3000']
  // ['localhost:3000', 'www']
  // ['market', 'reservoir']
  // ['market', 'reservoir', 'www']
  let wildcard = 'www'

  if (hostParts) {
    // For cases: ['localhost:3000', 'www', ...]
    if (hostParts.length > 1 && hostParts[0] === 'localhost:3000')
      wildcard = hostParts[1]

    // For cases: ['market', 'reservoir', 'www', ...]
    if (hostParts.length > 2 && hostParts[0] !== 'localhost:3000')
      wildcard = hostParts[2]
  }

  return wildcard
}
