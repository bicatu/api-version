// V3 Task Type - Rich metadata with priority and tags

import { TaskStatus } from '../v2/types';

export interface V3Task {
  id: string;
  title: string;
  status: TaskStatus;
  dueDate: string | null; // ISO 8601 date string or null
  priority: number; // 1 (low) to 5 (high)
  tags: string[];
  createdAt: string; // ISO 8601 date string
}

export interface V3CreateTaskRequest {
  title: string;
  status?: TaskStatus;
  dueDate?: string | null;
  priority?: number;
  tags?: string[];
}

export interface V3UpdateTaskRequest {
  title?: string;
  status?: TaskStatus;
  dueDate?: string | null;
  priority?: number;
  tags?: string[];
}
