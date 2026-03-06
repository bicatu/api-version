// Main Hono application - Evolving API Version System

import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { Env } from './types/shared';
import { versionGate } from './middleware/version-gate';
import { logger } from './middleware/logger';
import tasksRoutes from './routes/tasks';
import clientsRoutes from './routes/clients';
import { seedTasks } from './store/tasks';
import { seedClients } from './store/clients';

// Create the Hono app with typed environment
const app = new Hono<Env>();

// Initialize seed data
seedTasks();
seedClients();

console.log('🌱 Seed data initialized');
console.log('📦 Pre-registered clients: client-v1-demo, client-v2-demo, client-v3-demo');

// Apply global middleware
// 1. Logger - logs all requests with version info
app.use('*', logger);

// 2. Version Gate - detects and sets API version for each request
app.use('*', versionGate);

// Welcome route
app.get('/', (c) => {
  const apiVersion = c.get('apiVersion');
  const clientId = c.get('clientId');
  
  return c.json({
    message: 'Welcome to the Evolving API Version System',
    documentation: 'See README.md for usage examples',
    currentVersion: apiVersion,
    clientId: clientId,
    endpoints: {
      clients: {
        register: 'POST /api/clients/register',
        list: 'GET /api/clients',
        get: 'GET /api/clients/:clientId',
        updateVersion: 'PUT /api/clients/:clientId/version'
      },
      tasks: {
        list: 'GET /api/tasks',
        get: 'GET /api/tasks/:id',
        create: 'POST /api/tasks',
        update: 'PUT /api/tasks/:id',
        delete: 'DELETE /api/tasks/:id'
      }
    },
    versions: {
      v1: {
        description: 'Simple boolean completion',
        fields: ['id', 'title', 'completed', 'createdAt']
      },
      v2: {
        description: 'Status enum with due date',
        fields: ['id', 'title', 'status', 'dueDate', 'createdAt'],
        breaking_changes: ['replaced completed with status enum']
      },
      v3: {
        description: 'Rich metadata with priority and tags',
        fields: ['id', 'title', 'status', 'dueDate', 'priority', 'tags', 'createdAt'],
        new_features: ['priority (1-5)', 'tags array']
      }
    },
    usage: {
      authentication: 'X-Client-Id header is REQUIRED for all endpoints (except /, /api/clients/register, /api/clients)',
      versionDetection: [
        'Primary: X-Client-Id header looks up your registered version',
        'Override: Add X-API-Version header (v1, v2, or v3) to temporarily test another version',
        'Registration required: POST /api/clients/register before making API calls'
      ],
      example: 'curl -H "X-Client-Id: client-v1-demo" http://localhost:3000/api/tasks'
    }
  });
});

// Mount route handlers
app.route('/api/clients', clientsRoutes);
app.route('/api/tasks', tasksRoutes);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json({ error: 'Internal server error', message: err.message }, 500);
});

// Start the server
const port = 3000;

console.log(`🚀 Evolving API Server starting on http://localhost:${port}`);
console.log(`📚 Visit http://localhost:${port} for API documentation`);
console.log(`\n🔧 Version Detection Methods:`);
console.log(`   1. X-API-Version header: v1, v2, or v3`);
console.log(`   2. X-Client-Id header: client-v1-demo, client-v2-demo, or client-v3-demo`);
console.log(`   3. Default: v3 (latest)\n`);

serve({
  fetch: app.fetch,
  port,
});

