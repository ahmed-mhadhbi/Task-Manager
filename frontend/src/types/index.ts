export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  position: number;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectWithTasks extends Project {
  tasks: Task[];
}

export type BoardColumns = Record<TaskStatus, Task[]>;

export interface AuthResponse {
  accessToken: string;
  user: User;
}

