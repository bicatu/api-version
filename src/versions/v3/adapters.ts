// Bidirectional adapters between V2 and V3

import { V2Task } from '../v2/types';
import { V3Task } from '../v3/types';

/**
 * Transform V2 Task to V3 Task
 * Adds priority and tags with defaults
 */
export const v2ToV3 = (task: V2Task): V3Task => {
  return {
    id: task.id,
    title: task.title,
    status: task.status,
    dueDate: task.dueDate,
    priority: 3, // Default to medium priority
    tags: [], // Default to empty tags
    createdAt: task.createdAt,
  };
};

/**
 * Transform V3 Task to V2 Task
 * Strips priority and tags fields
 */
export const v3ToV2 = (task: V3Task): V2Task => {
  return {
    id: task.id,
    title: task.title,
    status: task.status,
    dueDate: task.dueDate,
    createdAt: task.createdAt,
  };
};
