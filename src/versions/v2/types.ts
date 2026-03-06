// V2 Task Type - Status enum with due date

export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface V2Task {
  id: string;
  title: string;
  status: TaskStatus;
  dueDate: string | null; // ISO 8601 date string or null
  createdAt: string; // ISO 8601 date string
}

export interface V2CreateTaskRequest {
  title: string;
  status?: TaskStatus;
  dueDate?: string | null;
}

export interface V2UpdateTaskRequest {
  title?: string;
  status?: TaskStatus;
  dueDate?: string | null;
}
