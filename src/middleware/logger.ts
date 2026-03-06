// Logging middleware for observability

import { createMiddleware } from 'hono/factory';
import { Env } from '../types/shared';

/**
 * Logger Middleware
 * 
 * Logs request information including version and client ID
 */
export const logger = createMiddleware<Env>(async (c, next) => {
  const start = Date.now();
  const method = c.req.method;
  const path = c.req.path;
  
  await next();
  
  const elapsed = Date.now() - start;
  const status = c.res.status;
  const apiVersion = c.get('apiVersion');
  const clientId = c.get('clientId');
  
  console.log(
    `[${new Date().toISOString()}] ${method} ${path} - ${status} - ${elapsed}ms - version:${apiVersion} client:${clientId}`
  );
});
