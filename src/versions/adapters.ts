// Composite adapters for multi-version transformations

import { V1Task } from './v1/types';
import { V2Task } from './v2/types';
import { V3Task } from './v3/types';
import { v1ToV2, v2ToV1, completedToStatus } from './v2/adapters';
import { v2ToV3, v3ToV2 } from './v3/adapters';
import { ApiVersion } from '../types/shared';
import { TaskStatus } from './v2/types';

/**
 * Transform V1 Task to V3 Task (composed: v1→v2→v3)
 */
export const v1ToV3 = (task: V1Task): V3Task => {
  return v2ToV3(v1ToV2(task));
};

/**
 * Transform V3 Task to V1 Task (composed: v3→v2→v1)
 */
export const v3ToV1 = (task: V3Task): V1Task => {
  return v2ToV1(v3ToV2(task));
};

/**
 * Transform V3 task to any version (for responses)
 */
export const transformFromV3 = (task: V3Task, targetVersion: ApiVersion): V1Task | V2Task | V3Task => {
  switch (targetVersion) {
    case 'v1':
      return v3ToV1(task);
    case 'v2':
      return v3ToV2(task);
    case 'v3':
      return task;
  }
};

/**
 * Transform array of V3 tasks to any version (for responses)
 */
export const transformArrayFromV3 = (tasks: V3Task[], targetVersion: ApiVersion): (V1Task | V2Task | V3Task)[] => {
  return tasks.map(task => transformFromV3(task, targetVersion));
};

/**
 * Transform any version request data to V3 format (for incoming requests)
 * Uses the same transformation logic as the response adapters
 */
export const transformToV3 = (task: any, sourceVersion: ApiVersion): Partial<V3Task> => {
  switch (sourceVersion) {
    case 'v1':
      // V1 request with completed boolean - use same logic as v1ToV2
      return {
        title: task.title,
        status: completedToStatus(task.completed ?? false),
        dueDate: null,
        priority: 3,
        tags: [],
      };
    case 'v2':
      // V2 request with status enum - add V3 defaults
      return {
        title: task.title,
        status: task.status as TaskStatus,
        dueDate: task.dueDate ?? null,
        priority: 3,
        tags: [],
      };
    case 'v3':
      // Already V3 format
      return {
        title: task.title,
        status: task.status as TaskStatus,
        dueDate: task.dueDate ?? null,
        priority: task.priority ?? 3,
        tags: task.tags ?? [],
      };
  }
};
