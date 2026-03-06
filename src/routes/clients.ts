// Client registration route handlers

import { Hono } from 'hono';
import { Env, ApiVersion } from '../types/shared';
import { 
  registerClient, 
  getClientById, 
  getAllClients,
  updateClientVersion 
} from '../store/clients';

const clients = new Hono<Env>();

/**
 * POST /api/clients/register
 * Register a new client with a specific API version
 */
clients.post('/register', async (c) => {
  try {
    const body = await c.req.json();
    
    // Validate request
    if (!body.clientId || typeof body.clientId !== 'string') {
      return c.json({ error: 'clientId is required and must be a string' }, 400);
    }
    
    if (!body.version || !isValidVersion(body.version)) {
      return c.json({ error: 'version is required and must be one of: v1, v2, v3' }, 400);
    }
    
    // Check if client already exists
    const existing = getClientById(body.clientId);
    if (existing) {
      return c.json({ 
        error: 'Client already registered', 
        hint: 'Use PUT /api/clients/:clientId/version to update version' 
      }, 409);
    }
    
    // Register the client
    const client = registerClient(body.clientId, body.version as ApiVersion);
    
    return c.json({
      clientId: client.clientId,
      version: client.version,
      apiKey: client.apiKey,
      registeredAt: client.registeredAt.toISOString(),
      message: `Client registered with API version ${client.version}. Use X-Client-Id header with value '${client.clientId}' in your requests.`
    }, 201);
  } catch (error) {
    return c.json({ error: 'Invalid request body' }, 400);
  }
});

/**
 * GET /api/clients
 * List all registered clients (for demo/debugging)
 */
clients.get('/', (c) => {
  const allClients = getAllClients();
  return c.json(allClients);
});

/**
 * GET /api/clients/:clientId
 * Get a specific client's information
 */
clients.get('/:clientId', (c) => {
  const clientId = c.req.param('clientId');
  const client = getClientById(clientId);
  
  if (!client) {
    return c.json({ error: 'Client not found' }, 404);
  }
  
  return c.json(client);
});

/**
 * PUT /api/clients/:clientId/version
 * Update a client's API version (migration scenario)
 */
clients.put('/:clientId/version', async (c) => {
  const clientId = c.req.param('clientId');
  
  try {
    const body = await c.req.json();
    
    if (!body.version || !isValidVersion(body.version)) {
      return c.json({ error: 'version is required and must be one of: v1, v2, v3' }, 400);
    }
    
    const updated = updateClientVersion(clientId, body.version as ApiVersion);
    
    if (!updated) {
      return c.json({ error: 'Client not found' }, 404);
    }
    
    return c.json({
      clientId: updated.clientId,
      version: updated.version,
      message: `Client API version updated to ${updated.version}`
    });
  } catch (error) {
    return c.json({ error: 'Invalid request body' }, 400);
  }
});

/**
 * Type guard to validate API version string
 */
function isValidVersion(version: string): version is ApiVersion {
  return version === 'v1' || version === 'v2' || version === 'v3';
}

export default clients;
