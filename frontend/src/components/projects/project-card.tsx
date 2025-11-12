"use client";

import Link from "next/link";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Project } from "@/types";
import { ProjectForm, ProjectFormValues } from "./project-form";

interface ProjectCardProps {
  project: Project & { taskCount?: number };
  onUpdate: (id: string, values: ProjectFormValues) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function ProjectCard({ project, onUpdate, onDelete }: ProjectCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await onDelete(project.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete project.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isEditing) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Edit Project</h3>
        <ProjectForm
          defaultValues={{ name: project.name, description: project.description ?? undefined }}
          submitLabel="Save changes"
          onCancel={() => setIsEditing(false)}
          onSubmit={async (values) => {
            await onUpdate(project.id, values);
            setIsEditing(false);
          }}
        />
        {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">{project.name}</h3>
            {project.description && <p className="mt-1 text-sm text-slate-500">{project.description}</p>}
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
            {project.taskCount ?? 0} task{(project.taskCount ?? 0) === 1 ? "" : "s"}
          </span>
        </div>
      </div>
      {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
      <div className="mt-6 flex items-center justify-between gap-3">
        <Link href={`/projects/${project.id}`} className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Open board
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="gap-2" onClick={() => setIsEditing(true)}>
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" className="gap-2" onClick={handleDelete} disabled={isDeleting}>
            <Trash2 className="h-4 w-4" />
            {isDeleting ? "Removing..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}

