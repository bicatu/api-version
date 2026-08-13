// Task CRUD route handlers - all logic uses V3 internally

import { Hono } from 'hono';
import { Env } from '../types/shared';
import { 
  getAllTasks, 
  getTaskById, 
  createTask, 
  updateTask, 
  deleteTask,
  generateId 
} from '../store/tasks';
import { V3Task } from '../versions/v3/types';
import { transformToV3 } from '../versions/adapters';
import { jsonVersioned } from '../utils/response';

const tasks = new Hono<Env>();

/**
 * GET /api/tasks
 * List all tasks, optionally sorted by dueDate
 * Query params:
 *   order: 'asc' (earliest first) | 'desc' (latest first); tasks with no dueDate always last
 */
tasks.get('/', (c) => {
  const order = c.req.query('order');
  
  if (order !== undefined && order !== 'asc' && order !== 'desc') {
    return c.json({ error: "Order must be 'asc' or 'desc'" }, 400);
  }
  
  const allTasks = getAllTasks();
  
  if (order !== undefined) {
    const direction = order === 'asc' ? 1 : -1;
    const decorated = allTasks.map(task => {
      const parsed = task.dueDate === null ? null : Date.parse(task.dueDate);
      return { task, timestamp: parsed !== null && !Number.isNaN(parsed) ? parsed : null };
    });
    decorated.sort((a, b) => {
      if (a.timestamp === null && b.timestamp === null) return 0;
      if (a.timestamp === null) return 1;
      if (b.timestamp === null) return -1;
      return (a.timestamp - b.timestamp) * direction;
    });
    return jsonVersioned(c, decorated.map(d => d.task));
  }
  
  return jsonVersioned(c, allTasks);
});

/**
 * GET /api/tasks/:id
 * Get a single task by ID
 */
tasks.get('/:id', (c) => {
  const id = c.req.param('id');
  const task = getTaskById(id);
  
  if (!task) {
    return c.json({ error: 'Task not found' }, 404);
  }
  
  return jsonVersioned(c, task);
});

/**
 * POST /api/tasks
 * Create a new task
 * Accepts task data in any version format based on client's API version
 */
tasks.post('/', async (c) => {
  const apiVersion = c.get('apiVersion');
  
  try {
    const body = await c.req.json();
    
    // Validate required fields
    if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') {
      return c.json({ error: 'Title is required and must be a non-empty string' }, 400);
    }
    
    // Transform incoming data to V3 format
    const v3Data = transformToV3(body, apiVersion);
    
    // Validate dueDate
    if (v3Data.dueDate !== null && v3Data.dueDate !== undefined && Number.isNaN(Date.parse(v3Data.dueDate))) {
      return c.json({ error: 'Due date must be a valid date string or null' }, 400);
    }
    
    // Create the task with V3 structure
    const newTask: V3Task = {
      id: generateId(),
      title: body.title.trim(),
      status: v3Data.status || 'todo',
      dueDate: v3Data.dueDate || null,
      priority: v3Data.priority || 3,
      tags: v3Data.tags || [],
      createdAt: new Date().toISOString(),
    };
    
    // Validate priority range
    if (newTask.priority < 1 || newTask.priority > 5) {
      return c.json({ error: 'Priority must be between 1 and 5' }, 400);
    }
    
    const created = createTask(newTask);
    return jsonVersioned(c, created, 201);
  } catch (error) {
    return c.json({ error: 'Invalid request body' }, 400);
  }
});

/**
 * PUT /api/tasks/:id
 * Update an existing task (partial update)
 * Accepts task data in any version format based on client's API version
 */
tasks.put('/:id', async (c) => {
  const id = c.req.param('id');
  const apiVersion = c.get('apiVersion');
  
  try {
    const body = await c.req.json();
    
    // Check if task exists
    const existing = getTaskById(id);
    if (!existing) {
      return c.json({ error: 'Task not found' }, 404);
    }
    
    // Transform incoming updates to V3 format
    const v3Updates = transformToV3(body, apiVersion);
    
    // Apply updates (only provided fields)
    const updates: Partial<V3Task> = {};
    
    if (body.title !== undefined) {
      if (typeof body.title !== 'string' || body.title.trim() === '') {
        return c.json({ error: 'Title must be a non-empty string' }, 400);
      }
      updates.title = body.title.trim();
    }
    
    if (v3Updates.status !== undefined) {
      updates.status = v3Updates.status;
    }
    
    if (body.dueDate !== undefined) {
      if (body.dueDate !== null && Number.isNaN(Date.parse(body.dueDate))) {
        return c.json({ error: 'Due date must be a valid date string or null' }, 400);
      }
      updates.dueDate = body.dueDate;
    }
    
    if (body.priority !== undefined) {
      if (body.priority < 1 || body.priority > 5) {
        return c.json({ error: 'Priority must be between 1 and 5' }, 400);
      }
      updates.priority = body.priority;
    }
    
    if (body.tags !== undefined) {
      if (!Array.isArray(body.tags)) {
        return c.json({ error: 'Tags must be an array' }, 400);
      }
      updates.tags = body.tags;
    }
    
    // Handle V1 completed field
    if (apiVersion === 'v1' && body.completed !== undefined) {
      updates.status = body.completed ? 'done' : 'todo';
    }
    
    const updated = updateTask(id, updates);
    return jsonVersioned(c, updated);
  } catch (error) {
    return c.json({ error: 'Invalid request body' }, 400);
  }
});

/**
 * DELETE /api/tasks/:id
 * Delete a task
 */
tasks.delete('/:id', (c) => {
  const id = c.req.param('id');
  
  const deleted = deleteTask(id);
  
  if (!deleted) {
    return c.json({ error: 'Task not found' }, 404);
  }
  
  return c.json({ message: 'Task deleted successfully' }, 200);
});

export default tasks;
