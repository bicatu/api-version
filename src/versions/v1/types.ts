// V1 Task Type - Simple boolean completion

export interface V1Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string; // ISO 8601 date string
}

export interface V1CreateTaskRequest {
  title: string;
  completed?: boolean;
}

export interface V1UpdateTaskRequest {
  title?: string;
  completed?: boolean;
}
