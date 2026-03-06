// Version detection middleware - determines API version for each request

import { createMiddleware } from 'hono/factory';
import { Env, ApiVersion } from '../types/shared';
import { getClientById } from '../store/clients';

/**
 * Version Gate Middleware
 * 
 * Enforces client registration for API access.
 * 
 * Requires X-Client-Id header for all endpoints except:
 * - /api/clients/register (new client registration)
 * - /api/clients (listing clients - demo/admin)
 * - / (welcome endpoint)
 * 
 * Version detection priority:
 * 1. X-API-Version header (explicit override for testing)
 * 2. Registered version from client registry (via X-Client-Id)
 * 
 * Sets context variables:
 * - apiVersion: The detected version
 * - clientId: The client identifier
 */
export const versionGate = createMiddleware<Env>(async (c, next) => {
  const path = c.req.path;
  const clientId = c.req.header('X-Client-Id');
  
  // Paths that don't require X-Client-Id
  const publicPaths = ['/', '/api/clients/register', '/api/clients'];
  const isPublicPath = publicPaths.includes(path);
  
  // Require X-Client-Id for protected endpoints
  if (!isPublicPath && !clientId) {
    return c.json({
      error: 'X-Client-Id header is required',
      message: 'Please register your client at POST /api/clients/register and include the X-Client-Id header in all requests',
      hint: 'curl -X POST http://localhost:3000/api/clients/register -H "Content-Type: application/json" -d \'{"clientId": "your-app-name", "version": "v1"}\''
    }, 401);
  }
  
  // Check for explicit version override (for testing/debugging)
  const versionHeader = c.req.header('X-API-Version');
  
  if (versionHeader && isValidVersion(versionHeader)) {
    c.set('apiVersion', versionHeader as ApiVersion);
    c.set('clientId', clientId || 'anonymous');
    await next();
    return;
  }
  
  // For public paths without client ID, default to v3
  if (isPublicPath && !clientId) {
    c.set('apiVersion', 'v3');
    c.set('clientId', 'anonymous');
    await next();
    return;
  }
  
  // Look up registered client version
  if (clientId) {
    const client = getClientById(clientId);
    
    if (!client) {
      return c.json({
        error: 'Client not registered',
        message: `Client ID '${clientId}' not found in registry`,
        hint: 'Register at POST /api/clients/register or use a registered client ID'
      }, 403);
    }
    
    c.set('apiVersion', client.version);
    c.set('clientId', clientId);
    await next();
    return;
  }
  
  // This shouldn't be reached, but fallback for safety
  c.set('apiVersion', 'v3');
  c.set('clientId', 'anonymous');
  await next();
});

/**
 * Type guard to validate API version string
 */
function isValidVersion(version: string): version is ApiVersion {
  return version === 'v1' || version === 'v2' || version === 'v3';
}
