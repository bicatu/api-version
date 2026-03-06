// Response transformation middleware - transforms V3 responses to client's version

import { createMiddleware } from 'hono/factory';
import { Env } from '../types/shared';
import { transformFromV3, transformArrayFromV3 } from '../versions/adapters';
import { V3Task } from '../versions/v3/types';

/**
 * Transform Middleware
 * 
 * Intercepts responses and transforms V3 task data to the client's API version.
 * Handles both single tasks and arrays of tasks.
 * 
 * This middleware should run AFTER route handlers have executed.
 */
export const transformResponse = createMiddleware<Env>(async (c, next) => {
  await next();
  
  const apiVersion = c.get('apiVersion');
  
  // If client is using v3, no transformation needed
  if (apiVersion === 'v3') {
    return;
  }
  
  // Get the response
  const response = c.res;
  
  // Only transform JSON responses with 2xx status codes
  const contentType = response.headers.get('content-type');
  if (!contentType?.includes('application/json') || 
      response.status < 200 || 
      response.status >= 300) {
    return;
  }
  
  try {
    // Clone the response to read the body
    const clonedResponse = response.clone();
    const body = await clonedResponse.json();
    
    let transformed = body;
    let shouldTransform = false;
    
    // Check if this is a single task object
    if (body && typeof body === 'object' && !Array.isArray(body) && 'id' in body && 'status' in body) {
      transformed = transformFromV3(body as V3Task, apiVersion);
      shouldTransform = true;
    }
    // Check if this is an array of tasks
    else if (Array.isArray(body) && body.length > 0 && typeof body[0] === 'object' && 'status' in body[0]) {
      transformed = transformArrayFromV3(body as V3Task[], apiVersion);
      shouldTransform = true;
    }
    
    // If we transformed, create a new response
    if (shouldTransform) {
      const newHeaders = new Headers(response.headers);
      c.res = new Response(JSON.stringify(transformed), {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    }
  } catch (error) {
    // If parsing fails, return original response
    console.error('Error transforming response:', error);
  }
});
