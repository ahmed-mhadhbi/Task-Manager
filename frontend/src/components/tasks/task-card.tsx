"use client";

import { useState } from "react";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { DraggableProvided } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Task } from "@/types";
import { TaskForm, TaskFormValues } from "./task-form";

interface TaskCardProps {
  task: Task;
  provided?: DraggableProvided;
  onUpdate: (id: string, values: TaskFormValues) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function TaskCard({ task, onUpdate, onDelete, provided }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isEditing) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <TaskForm
          defaultValues={{ title: task.title, description: task.description ?? undefined, status: task.status }}
          submitLabel="Update task"
          onCancel={() => setIsEditing(false)}
          onSubmit={async (values) => {
            await onUpdate(task.id, values);
            setIsEditing(false);
          }}
        />
        {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
      </div>
    );
  }

  const createdDate = new Date(task.createdAt);

  return (
    <div
      ref={provided?.innerRef}
      {...provided?.draggableProps}
      {...provided?.dragHandleProps}
      className="group relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
    >
      <div className="absolute right-3 top-3 hidden items-center gap-2 group-hover:flex">
        <Button variant="ghost" className="h-8 gap-1 px-2" onClick={() => setIsEditing(true)}>
          <Pencil className="h-4 w-4" />
          Edit
        </Button>
        <Button
          variant="destructive"
          className="h-8 gap-1 px-2"
          disabled={isDeleting}
          onClick={async () => {
            setIsDeleting(true);
            setError(null);
            try {
              await onDelete(task.id);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Failed to delete task.");
            } finally {
              setIsDeleting(false);
            }
          }}
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </div>
      <div className="mb-3 flex items-center gap-2 text-xs text-slate-400">
        <GripVertical className="h-4 w-4" />
        {createdDate.toLocaleDateString()}
      </div>
      <h3 className="text-sm font-semibold text-slate-900">{task.title}</h3>
      {task.description && <p className="mt-2 text-sm text-slate-600">{task.description}</p>}
      {error && <p className="mt-3 text-xs text-rose-600">{error}</p>}
    </div>
  );
}

