// Bidirectional adapters between V1 and V2

import { V1Task } from '../v1/types';
import { V2Task, TaskStatus } from '../v2/types';

/**
 * Core transformation logic: V1 completed boolean to V2 status enum
 */
export const completedToStatus = (completed: boolean): TaskStatus => {
  return completed ? 'done' : 'todo';
};

/**
 * Core transformation logic: V2 status enum to V1 completed boolean
 */
export const statusToCompleted = (status: TaskStatus): boolean => {
  return status === 'done';
};

/**
 * Transform V1 Task to V2 Task (for complete task objects)
 * Maps completed boolean to status enum
 */
export const v1ToV2 = (task: V1Task): V2Task => {
  return {
    id: task.id,
    title: task.title,
    status: completedToStatus(task.completed),
    dueDate: null,
    createdAt: task.createdAt,
  };
};

/**
 * Transform V2 Task to V1 Task (for complete task objects)
 * Maps status enum to completed boolean
 */
export const v2ToV1 = (task: V2Task): V1Task => {
  return {
    id: task.id,
    title: task.title,
    completed: statusToCompleted(task.status),
    createdAt: task.createdAt,
  };
};
