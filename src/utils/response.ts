// Helper utilities for handling versioned responses

import { Context } from 'hono';
import { Env } from '../types/shared';
import { transformFromV3, transformArrayFromV3 } from '../versions/adapters';
import { V3Task } from '../versions/v3/types';

/**
 * Return a JSON response with automatic version transformation
 */
export const jsonVersioned = (c: Context<Env>, data: V3Task | V3Task[] | any, status = 200) => {
  const apiVersion = c.get('apiVersion');
  
  // If v3 or not task data, return as-is
  if (apiVersion === 'v3') {
    return c.json(data, status as any);
  }
  
  // Transform single task
  if (data && typeof data === 'object' && !Array.isArray(data) && 'id' in data && 'status' in data) {
    const transformed = transformFromV3(data as V3Task, apiVersion);
    return c.json(transformed, status as any);
  }
  
  // Transform array of tasks
  if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object' && 'status' in data[0]) {
    const transformed = transformArrayFromV3(data as V3Task[], apiVersion);
    return c.json(transformed, status as any);
  }
  
  // Not task data, return as-is
  return c.json(data, status as any);
};
