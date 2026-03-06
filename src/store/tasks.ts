// In-memory task storage using V3Task as single source of truth

import { V3Task } from '../versions/v3/types';

// In-memory storage
const tasks = new Map<string, V3Task>();

// Helper to generate simple IDs
let idCounter = 1;
export const generateId = (): string => `task-${idCounter++}`;

// CRUD operations
export const getAllTasks = (): V3Task[] => {
  return Array.from(tasks.values());
};

export const getTaskById = (id: string): V3Task | undefined => {
  return tasks.get(id);
};

export const createTask = (task: V3Task): V3Task => {
  tasks.set(task.id, task);
  return task;
};

export const updateTask = (id: string, updates: Partial<V3Task>): V3Task | undefined => {
  const existing = tasks.get(id);
  if (!existing) {
    return undefined;
  }
  
  const updated = { ...existing, ...updates };
  tasks.set(id, updated);
  return updated;
};

export const deleteTask = (id: string): boolean => {
  return tasks.delete(id);
};

// Seed some initial data for testing
export const seedTasks = (): void => {
  const now = new Date().toISOString();
  
  createTask({
    id: generateId(),
    title: 'Setup development environment',
    status: 'done',
    dueDate: null,
    priority: 3,
    tags: ['setup', 'dev'],
    createdAt: now,
  });
  
  createTask({
    id: generateId(),
    title: 'Implement API versioning',
    status: 'in_progress',
    dueDate: '2026-02-20T00:00:00.000Z',
    priority: 5,
    tags: ['feature', 'important'],
    createdAt: now,
  });
  
  createTask({
    id: generateId(),
    title: 'Write documentation',
    status: 'todo',
    dueDate: '2026-02-25T00:00:00.000Z',
    priority: 2,
    tags: ['docs'],
    createdAt: now,
  });
};
