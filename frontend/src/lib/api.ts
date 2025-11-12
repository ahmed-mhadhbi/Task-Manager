import { AuthResponse, BoardColumns, Project, ProjectWithTasks, Task, TaskStatus, User } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

interface RequestOptions extends RequestInit {
  token?: string;
}

async function request<T>(path: string, method: HttpMethod, options: RequestOptions = {}): Promise<T> {
  const { token, headers, body, ...rest } = options;

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers ?? {}),
    },
    body,
    ...rest,
  });

  if (!response.ok) {
    const message = await extractErrorMessage(response);
    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

async function extractErrorMessage(response: Response) {
  try {
    const data = await response.json();
    if (typeof data === "string") return data;
    if (data?.message) {
      return Array.isArray(data.message) ? data.message.join(", ") : data.message;
    }
  } catch {
    // ignore
  }
  return response.statusText || "Unexpected error";
}

export const authApi = {
  register(payload: { email: string; password: string; name?: string }): Promise<AuthResponse> {
    return request<AuthResponse>("/auth/register", "POST", {
      body: JSON.stringify(payload),
    });
  },
  login(payload: { email: string; password: string }): Promise<AuthResponse> {
    return request<AuthResponse>("/auth/login", "POST", {
      body: JSON.stringify(payload),
    });
  },
  me(token: string): Promise<User> {
    return request<User>("/auth/me", "GET", { token });
  },
};

export const projectsApi = {
  list(token: string): Promise<Project[]> {
    return request<Project[]>("/projects", "GET", { token });
  },
  create(token: string, payload: { name: string; description?: string | null }): Promise<Project> {
    return request<Project>("/projects", "POST", { token, body: JSON.stringify(payload) });
  },
  update(token: string, id: string, payload: { name?: string; description?: string | null }): Promise<Project> {
    return request<Project>(`/projects/${id}`, "PATCH", {
      token,
      body: JSON.stringify(payload),
    });
  },
  remove(token: string, id: string): Promise<void> {
    return request<void>(`/projects/${id}`, "DELETE", { token });
  },
  getWithTasks(token: string, id: string): Promise<ProjectWithTasks> {
    return request<ProjectWithTasks>(`/projects/${id}`, "GET", { token });
  },
};

export const tasksApi = {
  board(token: string, projectId: string): Promise<BoardColumns> {
    return request<BoardColumns>(`/projects/${projectId}/tasks`, "GET", { token });
  },
  create(token: string, projectId: string, payload: { title: string; description?: string | null; status?: TaskStatus }): Promise<Task> {
    return request<Task>(`/projects/${projectId}/tasks`, "POST", {
      token,
      body: JSON.stringify(payload),
    });
  },
  update(token: string, id: string, payload: Partial<Pick<Task, "title" | "description" | "status">>): Promise<Task> {
    return request<Task>(`/tasks/${id}`, "PATCH", {
      token,
      body: JSON.stringify(payload),
    });
  },
  move(token: string, id: string, payload: { status?: TaskStatus; position?: number }): Promise<Task> {
    return request<Task>(`/tasks/${id}/move`, "PATCH", {
      token,
      body: JSON.stringify(payload),
    });
  },
  remove(token: string, id: string): Promise<void> {
    return request<void>(`/tasks/${id}`, "DELETE", { token });
  },
};

